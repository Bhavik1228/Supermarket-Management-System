"use server"

import { db as prisma } from "@/lib/db"

export async function getAIInventoryData(storeId: string) {
    try {
        // 1. Get all products for the store
        const products = await prisma.product.findMany({
            where: { storeId },
            orderBy: { stock: 'asc' }
        })

        // 2. Calculate avg daily sales for each product from OrderItem history (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // Aggregating sales data
        const inventoryData = await Promise.all(products.map(async (product) => {
            const sales = await prisma.orderItem.aggregate({
                where: {
                    productId: product.id,
                    order: {
                        status: 'COMPLETED',
                        createdAt: { gte: thirtyDaysAgo }
                    }
                },
                _sum: {
                    quantity: true
                }
            })

            const totalQuantitySold = sales._sum.quantity || 0
            const avgDailySales = Math.max(0.1, totalQuantitySold / 30)

            return {
                id: product.id,
                name: product.name,
                currentStock: product.stock,
                avgDailySales: parseFloat(avgDailySales.toFixed(2)),
                category: product.category,
                lastRestock: product.updatedAt.toISOString(), // Approximation
            }
        }))

        return { success: true, inventoryData }
    } catch (error) {
        console.error("getAIInventoryData error:", error)
        return { success: false, error: "Failed to fetch production inventory data" }
    }
}
