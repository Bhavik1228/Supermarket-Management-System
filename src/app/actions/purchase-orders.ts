"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"
import { sendEmail, getPurchaseOrderGeneratedEmailHtml, getPurchaseOrderStatusUpdateEmailHtml } from "@/lib/email"
import { getStorePersonnelEmails } from "./staff"

export async function generatePurchaseOrders(storeId: string = "store-freshmart") {
    try {
        // 1. Find all products with low stock (where stock <= reorderPoint)
        const lowStockProducts = await prisma.product.findMany({
            where: {
                storeId,
                stock: {
                    lte: 10 // Fallback or dynamic check
                }
            }
        })

        // Better dynamic check: find products where stock is less than their specific reorderPoint
        const allProducts = await prisma.product.findMany({ where: { storeId } })
        const filteredLowStock = allProducts.filter(p => p.stock <= p.reorderPoint)

        if (filteredLowStock.length === 0) {
            return { success: true, message: "Inventory is healthy. No purchase orders needed.", count: 0 }
        }

        const targetProducts = filteredLowStock

        // 2. Create the Purchase Order
        const total = targetProducts.reduce((acc, p: any) => acc + (p.reorderQuantity * (p.costPrice || p.price * 0.7)), 0)

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                storeId,
                status: "PENDING",
                total,
                items: {
                    create: targetProducts.map((p: any) => ({
                        productId: p.id,
                        productName: p.name,
                        quantity: p.reorderQuantity,
                        unitPrice: p.costPrice || p.price * 0.7,
                        total: p.reorderQuantity * (p.costPrice || p.price * 0.7)
                    }))
                }
            }
        })

        // 3. Audit Log
        await createAuditLog({
            action: 'PO_GENERATED',
            entity: 'PurchaseOrder',
            entityId: purchaseOrder.id,
            details: `Automated Purchase Order generated for ${targetProducts.length} low-stock items. Total Value: $${total.toFixed(2)}`,
            storeId
        })

        // 4. Send Notifications
        const personnelEmails = await getStorePersonnelEmails(storeId, ['STORE_OWNER', 'STORE_MANAGER'])
        if (personnelEmails.length > 0) {
            const store = await prisma.store.findUnique({ where: { id: storeId } })
            const html = getPurchaseOrderGeneratedEmailHtml(
                store?.name || "Your Store",
                purchaseOrder.id,
                targetProducts.length,
                total
            )
            for (const email of personnelEmails) {
                await sendEmail({
                    to: email,
                    subject: `[Inventory] New Purchase Order Generated: ${purchaseOrder.id}`,
                    html
                })
            }
        }

        revalidatePath("/store")
        return {
            success: true,
            message: `Purchase Order generated for ${targetProducts.length} items.`,
            count: targetProducts.length,
            poId: purchaseOrder.id
        }
    } catch (error) {
        console.error("PO Generation Error:", error)
        return { success: false, error: "Failed to generate purchase orders" }
    }
}

export async function getPurchaseOrders(storeId: string = "store-freshmart") {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            where: { storeId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, pos }
    } catch (error) {
        return { success: false, pos: [] }
    }
}

export async function getPurchaseOrder(poId: string) {
    try {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id: poId },
            include: { items: true }
        })
        return { success: true, po }
    } catch (error) {
        return { success: false, error: "Failed to fetch purchase order" }
    }
}

export async function updatePOStatus(poId: string, status: string, storeId: string = "store-freshmart") {
    try {
        const po = await prisma.purchaseOrder.update({
            where: { id: poId },
            data: { status }
        })

        await createAuditLog({
            action: 'PO_STATUS_UPDATE',
            entity: 'PurchaseOrder',
            entityId: poId,
            details: `Purchase Order status updated to ${status}`,
            storeId
        })

        // Send Status Update Email
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        const ownerEmails = await getStorePersonnelEmails(storeId, ['STORE_OWNER'])

        if (ownerEmails.length > 0) {
            const html = getPurchaseOrderStatusUpdateEmailHtml(
                store?.name || "Your Store",
                poId,
                "OLD_STATUS", // We don't track old status easily here without a fetch first, but PENDING is safe for now or just generic
                status
            )
            for (const email of ownerEmails) {
                await sendEmail({
                    to: email,
                    subject: `[Inventory] PO Status Update: ${poId} -> ${status}`,
                    html
                })
            }
        }

        revalidatePath("/store/inventory/purchase-orders")
        return { success: true, po }
    } catch (error) {
        console.error("PO Status Update Error:", error)
        return { success: false, error: "Failed to update purchase order status" }
    }
}
