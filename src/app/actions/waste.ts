"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

export async function recordWaste(productId: string, quantity: number, reason: string, storeId: string = 'store-freshmart') {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Update product stock
            const product = await tx.product.update({
                where: { id: productId },
                data: { stock: { decrement: quantity } }
            })

            // 2. Create audit log for wastage
            await tx.auditLog.create({
                data: {
                    action: 'INVENTORY_WASTE_RECORDED',
                    entity: 'Product',
                    entityId: productId,
                    details: `Recorded wastage of ${quantity} units. Reason: ${reason}. Value loss: $${(quantity * (product.costPrice || product.price * 0.75)).toFixed(2)}`,
                    storeId,
                    userEmail: 'owner@system.com'
                }
            })

            revalidatePath('/store/inventory')
            revalidatePath('/store')
            return { success: true }
        })
    } catch (error) {
        console.error("recordWaste error:", error)
        return { success: false, error: "Failed to record waste" }
    }
}

export async function getWasteStats(storeId: string = 'store-freshmart') {
    try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const logs = await prisma.auditLog.findMany({
            where: {
                storeId,
                action: 'INVENTORY_WASTE_RECORDED',
                createdAt: { gte: thirtyDaysAgo }
            },
            take: 50
        })

        const totalLoss = logs.reduce((acc, log) => {
            const match = log.details?.match(/\$(\d+\.\d+)/)
            return acc + (match ? parseFloat(match[1]) : 0)
        }, 0)

        const byReason = logs.reduce((acc: any, log) => {
            const reason = log.details?.split('Reason: ')[1]?.split('.')[0] || 'Unknown'
            acc[reason] = (acc[reason] || 0) + 1
            return acc
        }, {})

        return {
            success: true,
            stats: {
                totalLoss,
                count: logs.length,
                topReasons: Object.entries(byReason)
                    .sort((a: any, b: any) => b[1] - a[1])
                    .slice(0, 3)
            }
        }
    } catch (error) {
        return { success: false, stats: { totalLoss: 0, count: 0, topReasons: [] } }
    }
}
