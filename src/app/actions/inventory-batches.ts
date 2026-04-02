"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

export async function addProductBatch(data: {
    productId: string,
    batchNumber: string,
    quantity: number,
    expiryDate: string,
    costPrice?: number
}) {
    try {
        const batch = await prisma.productBatch.create({
            data: {
                productId: data.productId,
                batchNumber: data.batchNumber,
                quantity: data.quantity,
                initialQuantity: data.quantity,
                expiryDate: new Date(data.expiryDate),
                costPrice: data.costPrice || 0
            },
            include: { product: true }
        })

        // Increment main product stock
        await prisma.product.update({
            where: { id: data.productId },
            data: { stock: { increment: data.quantity } }
        })

        await createAuditLog({
            action: 'INVENTORY_BATCH_ADDED',
            entity: 'ProductBatch',
            entityId: batch.id,
            details: `New batch ${data.batchNumber} added for ${batch.product.name}. Quantity: ${data.quantity}, Expiry: ${data.expiryDate}`,
            userEmail: 'owner@system.com',
            storeId: batch.product.storeId
        })

        revalidatePath("/store/inventory")
        return { success: true, batch }
    } catch (error) {
        console.error("addProductBatch error:", error)
        return { success: false, error: "Failed to add batch" }
    }
}

export async function getExpiringProducts(days: number = 30, storeId: string = "store-freshmart") {
    try {
        const threshold = new Date()
        threshold.setDate(threshold.getDate() + days)

        const batches = await prisma.productBatch.findMany({
            where: {
                product: { storeId },
                expiryDate: {
                    lte: threshold,
                    gt: new Date() // Not yet expired
                },
                status: "ACTIVE",
                quantity: { gt: 0 }
            },
            include: { product: true },
            orderBy: { expiryDate: 'asc' }
        })

        return { success: true, batches }
    } catch (error) {
        return { success: false, error: "Failed to fetch expiring products" }
    }
}

export async function getBatchStats(storeId: string = "store-freshmart") {
    try {
        const totalStockValue = await prisma.productBatch.aggregate({
            where: { product: { storeId }, status: "ACTIVE" },
            _sum: {
                costPrice: true,
                quantity: true
            }
        })

        const expiredCount = await prisma.productBatch.count({
            where: {
                product: { storeId },
                expiryDate: { lte: new Date() },
                status: "ACTIVE"
            }
        })

        const criticalExpiring = await prisma.productBatch.count({
            where: {
                product: { storeId },
                expiryDate: {
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    gt: new Date()
                },
                status: "ACTIVE"
            }
        })

        return {
            totalBatches: await prisma.productBatch.count({ where: { product: { storeId } } }),
            expiredCount,
            criticalExpiring,
            totalStockValue: totalStockValue._sum.costPrice || 0
        }
    } catch (error) {
        return null
    }
}
