"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export interface SalesSummary {
    totalSales: number
    totalTax: number
    totalDiscount: number
    transactionCount: number
    paymentMethods: {
        method: string
        amount: number
        count: number
    }[]
    categorySales: {
        category: string
        amount: number
    }[]
}

export async function getDailySalesSummary(storeId: string = 'store-freshmart', date?: Date): Promise<{ success: boolean, data?: SalesSummary, error?: string }> {
    try {
        const targetDate = date || new Date()
        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        // Fetch all orders for the day
        const orders = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: 'COMPLETED'
            },
            include: {
                // Include items if we want category breakdown later (for now, simpler is better for Z-Report)
            }
        })

        if (orders.length === 0) {
            return {
                success: true,
                data: {
                    totalSales: 0,
                    totalTax: 0,
                    totalDiscount: 0,
                    transactionCount: 0,
                    paymentMethods: [],
                    categorySales: []
                }
            }
        }

        // Aggregation Logic
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
        const totalTax = orders.reduce((sum, order) => sum + order.tax, 0)
        const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0)

        // Group by Payment Method
        const paymentMap = new Map<string, { amount: number, count: number }>()

        orders.forEach(order => {
            const method = order.paymentMethod || 'UNKNOWN'
            const current = paymentMap.get(method) || { amount: 0, count: 0 }

            paymentMap.set(method, {
                amount: current.amount + order.total,
                count: current.count + 1
            })
        })

        const paymentMethods = Array.from(paymentMap.entries()).map(([method, stats]) => ({
            method,
            amount: stats.amount,
            count: stats.count
        }))

        return {
            success: true,
            data: {
                totalSales,
                totalTax,
                totalDiscount,
                transactionCount: orders.length,
                paymentMethods,
                categorySales: [] // TODO: Implement if needed consuming simpler Z-Report first
            }
        }

    } catch (error) {
        console.error("Failed to generate sales report:", error)
        return { success: false, error: "Failed to generate report" }
    }
}
