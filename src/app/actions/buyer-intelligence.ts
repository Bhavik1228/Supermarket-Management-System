"use server"

import { db as prisma } from "@/lib/db"

export async function getBuyingSuggestions(storeId: string = 'store-freshmart') {
    try {
        // Fetch products with low stock OR high sales velocity
        const products = await prisma.product.findMany({
            where: { storeId },
            include: {
                orderItems: {
                    where: {
                        order: {
                            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                            status: 'COMPLETED'
                        }
                    }
                }
            }
        })

        const suggestions = products.map(p => {
            const soldLast30Days = p.orderItems.reduce((acc, item) => acc + item.quantity, 0)
            const velocity = soldLast30Days / 30
            const daysRemaining = velocity > 0 ? p.stock / velocity : 999

            // Suggest reorder if stock < (velocity * 7 days) OR stock < 5
            const shouldReorder = daysRemaining < 7 || p.stock < 5
            const reorderQty = Math.max(0, Math.ceil(velocity * 14) - p.stock) // 14 days safety stock

            return {
                id: p.id,
                name: p.name,
                stock: p.stock,
                velocity: velocity.toFixed(2),
                daysRemaining: daysRemaining === 999 ? '∞' : Math.floor(daysRemaining),
                shouldReorder,
                reorderQty: shouldReorder ? Math.max(reorderQty, 10) : 0,
                estimatedCost: (shouldReorder ? Math.max(reorderQty, 10) * p.price * 0.7 : 0).toFixed(2)
            }
        })
            .filter(s => s.shouldReorder)
            .sort((a, b) => Number(a.daysRemaining) - Number(b.daysRemaining))
            .slice(0, 5)

        return { success: true, suggestions }
    } catch (error) {
        console.error("getBuyingSuggestions error:", error)
        return { success: false, error: "Failed to fetch suggestions" }
    }
}

export async function getProfitInsights(storeId: string = 'store-freshmart') {
    try {
        const products = await prisma.product.findMany({
            where: { storeId },
            include: {
                orderItems: {
                    where: {
                        order: {
                            status: 'COMPLETED'
                        }
                    }
                }
            }
        })

        const insights = products.map(p => {
            const totalRevenue = p.orderItems.reduce((acc, item) => acc + item.total, 0)
            const totalQuantity = p.orderItems.reduce((acc, item) => acc + item.quantity, 0)
            const estCost = totalQuantity * p.price * 0.75
            const profit = totalRevenue - estCost

            return {
                name: p.name,
                revenue: totalRevenue,
                profit: profit,
                margin: totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(1) : 0
            }
        })
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 5)

        return { success: true, insights }
    } catch (error) {
        return { success: false, error: "Failed to fetch profit insights" }
    }
}
