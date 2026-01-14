"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendEmail, getReturnProcessedEmailHtml, getRefundRequestAlertEmailHtml, getSystemOwnerRefundAlertEmailHtml } from "@/lib/email"
import { getStorePersonnelEmails } from "./staff"

export async function getTransactions(query: string = "") {
    try {
        const where: any = query ? {
            OR: [
                { id: { contains: query } },
                { customer: { name: { contains: query } } },
                // Add more search fields if needed (e.g., date parsing)
            ]
        } : {}

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: true,
                customer: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit results
        })

        return { success: true, orders }
    } catch (error) {
        console.error("Fetch transactions error:", error)
        return { success: false, error: "Failed to fetch transactions" }
    }
}

export async function processReturn(orderId: string, items: { id: string, quantity: number, reason: string }[], storeId: string = "store-freshmart") {
    try {
        // 1. Update Order status
        await prisma.order.update({
            where: { id: orderId === "NO_BILL" ? undefined : orderId }, // Use undefined if no bill
            data: {
                status: "RETURNED",
            }
        })

        // 2. Adjust stock for returned items
        for (const item of items) {
            const orderItem = await prisma.orderItem.findUnique({
                where: { id: item.id }
            })

            if (orderItem) {
                await prisma.product.update({
                    where: { id: orderItem.productId },
                    data: {
                        stock: { increment: item.quantity }
                    }
                })
            }
        }

        // 3. Notify Managers
        const managerEmails = await getStorePersonnelEmails(storeId, ['STORE_MANAGER', 'STORE_OWNER'])
        if (managerEmails.length > 0) {
            const store = await prisma.store.findUnique({ where: { id: storeId } })
            const html = getReturnProcessedEmailHtml(
                store?.name || "Your Store",
                orderId,
                items.length,
                items[0]?.reason || "Multiple items"
            )
            for (const email of managerEmails) {
                await sendEmail({
                    to: email,
                    subject: `[Returns] New Return Processed: ${orderId}`,
                    html
                })
            }
        }

        revalidatePath("/store/returns")
        return { success: true, message: "Return processed and stock adjusted" }
    } catch (error) {
        console.error("Return Process Error:", error)
        return { success: false, error: "Return processing failed" }
    }
}

export async function requestRefund(orderId: string, reason: string, staffId: string, storeId: string = "store-freshmart") {
    try {
        console.log(`Processing refund request for order ${orderId} by staff ${staffId}`);

        let order = null;
        if (orderId !== "NO_BILL") {
            order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { customer: true }
            })
            if (!order) return { success: false, error: "Order not found" }
        }

        // Validate or fallback for staffId
        let finalStaffId = staffId;
        const staffExists = await prisma.user.findUnique({ where: { id: staffId } });

        if (!staffExists || staffId === "staff-id") {
            const fallbackUser = await prisma.user.findFirst({
                where: { role: { in: ['STORE_OWNER', 'SYSTEM_OWNER'] } }
            });
            if (fallbackUser) {
                finalStaffId = fallbackUser.id;
                console.log(`Using fallback user ID: ${finalStaffId}`);
            } else {
                return { success: false, error: "No valid user found to authorize return" };
            }
        }

        // Create a support ticket for admin approval
        const ticket = await prisma.ticket.create({
            data: {
                subject: `Refund Request: ${orderId === "NO_BILL" ? "Manual Entry" : "Order #" + orderId.slice(0, 8)}`,
                status: "OPEN",
                priority: "HIGH",
                userId: finalStaffId,
                storeId: storeId
            }
        })

        // Add details as the first message
        await prisma.ticketMessage.create({
            data: {
                ticketId: ticket.id,
                message: `Type: REFUND_REQUEST\nSource: ${orderId}\nTotal: ${order?.total ? '$' + order.total.toFixed(2) : 'Manual Entry'}\nReason: ${reason}\nCustomer: ${order?.customer?.name || 'Guest'}`,
                isStaff: true
            }
        })

        // Email Notifications
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        const ownerEmails = await getStorePersonnelEmails(storeId, ['STORE_OWNER'])
        const refundAmount = order?.total ? '$' + order.total.toFixed(2) : 'Manual Entry'
        const requester = await prisma.user.findUnique({ where: { id: staffId } })

        // Notify Store Owner
        if (ownerEmails.length > 0) {
            const html = getRefundRequestAlertEmailHtml(
                store?.name || "Your Store",
                orderId,
                refundAmount,
                reason,
                requester?.name || "Staff"
            )
            for (const email of ownerEmails) {
                await sendEmail({
                    to: email,
                    subject: `🔴 URGENT: Refund Authorization Required - Order ${orderId}`,
                    html
                })
            }
        }

        // Notify System Owner
        const systemOwner = await prisma.user.findFirst({ where: { role: 'SYSTEM_OWNER' } })
        if (systemOwner?.email) {
            const sysHtml = getSystemOwnerRefundAlertEmailHtml(
                store?.name || "Your Store",
                orderId,
                refundAmount,
                reason
            )
            await sendEmail({
                to: systemOwner.email,
                subject: `[Audit] Refund Request Logged: ${store?.name || 'Store'}`,
                html: sysHtml
            })
        }

        revalidatePath("/admin/support")
        return { success: true, ticketId: ticket.id }
    } catch (error) {
        console.error("Refund Request Error:", error)
        return { success: false, error: "Failed to submit refund request" }
    }
}
