"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

export async function getOnlineOrders(storeId: string = 'store-freshmart') {
    try {
        const orders = await prisma.order.findMany({
            where: {
                storeId,
                channel: 'ONLINE'
            },
            include: {
                items: {
                    include: { product: true }
                },
                customer: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, orders }
    } catch (error) {
        return { success: false, error: "Failed to fetch online orders" }
    }
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                notes: notes || undefined
            },
            include: { store: true, customer: true }
        })

        // Log the action
        await createAuditLog({
            action: `ORDER_STATUS_UPDATE_${status}`,
            entity: "Order",
            entityId: orderId,
            details: `Order status changed to ${status}. Notes: ${notes || 'None'}`,
            storeId: order.storeId,
            userEmail: "system@marketpulse.pos"
        })

        // TODO: Trigger Email Notifications based on status
        // if (status === 'CONFIRMED') await sendOrderConfirmedEmail(order)
        // if (status === 'READY') await sendReadyForPickupEmail(order)
        // if (status === 'OUT_FOR_DELIVERY') await sendOutForDeliveryEmail(order)

        revalidatePath("/store/orders")
        return { success: true, order }
    } catch (error) {
        return { success: false, error: "Failed to update order status" }
    }
}

export async function createOnlineOrder(data: {
    storeId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    customerAddress: string,
    items: { productId: string, quantity: number, price: number, name: string }[],
    total: number,
    paymentMethod: string,
    fulfillmentMethod: string
}) {
    try {
        const order = await prisma.order.create({
            data: {
                storeId: data.storeId,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                customerAddress: data.customerAddress,
                total: data.total,
                status: 'PENDING',
                channel: 'ONLINE',
                paymentMethod: data.paymentMethod,
                fulfillmentMethod: data.fulfillmentMethod,
                items: {
                    create: data.items.map(i => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        price: i.price,
                        total: i.price * i.quantity,
                        name: i.name
                    }))
                }
            }
        })

        await createAuditLog({
            action: 'ONLINE_ORDER_CREATED_MANUAL',
            entity: 'Order',
            entityId: order.id,
            details: `Manual online order created for ${data.customerName}`,
            storeId: data.storeId,
            userEmail: 'owner@system.com'
        })

        revalidatePath("/store/orders")
        return { success: true, order }
    } catch (error) {
        console.error("createOnlineOrder error:", error)
        return { success: false, error: "Failed to create online order" }
    }
}
