"use server"

import { db as prisma } from "@/lib/db"

export async function getDashboardStats(storeId: string = 'store-freshmart') {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Optimized with Aggregations
        const [statsResult, pendingApprovals, inventoryResult] = await Promise.all([
            prisma.order.aggregate({
                where: {
                    storeId,
                    createdAt: { gte: today },
                    status: { not: 'CANCELLED' }
                },
                _sum: { total: true },
                _count: { id: true }
            }),
            prisma.ticket.count({
                where: {
                    storeId,
                    status: 'OPEN',
                    subject: { contains: 'Refund Request' }
                }
            }),
            prisma.product.aggregate({
                where: { storeId },
                _sum: { price: true } // This doesn't account for stock correctly if we just sum price
            })
        ])

        // Fetch products with their cost price for real profit calculation
        const products = await prisma.product.findMany({
            where: { storeId },
            select: { price: true, stock: true, costPrice: true }
        })

        const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

        // In-Stock Rate Calculation
        const totalProducts = products.length
        const inStockProducts = products.filter(p => p.stock > 0).length
        const inStockRate = totalProducts > 0 ? (inStockProducts / totalProducts) * 100 : 0

        // Calculate real cost of goods sold if costPrice exists, otherwise fallback to 70% of price
        const todayOrders = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: { gte: today },
                status: 'COMPLETED'
            },
            include: { items: { include: { product: true } } }
        })

        let actualProfit = 0
        todayOrders.forEach(order => {
            order.items.forEach(item => {
                const cost = item.product?.costPrice || (item.price * 0.7)
                actualProfit += (item.price - cost) * item.quantity
            })
        })

        const todayRevenue = statsResult._sum.total || 0
        const totalTransactions = statsResult._count.id

        return {
            success: true,
            stats: {
                revenue: todayRevenue,
                profit: actualProfit,
                transactions: totalTransactions,
                pendingApprovals,
                stockValue: totalStockValue,
                inStockRate: inStockRate.toFixed(1) + "%",
                health: inStockRate > 90 ? "98% HEALTH" : inStockRate > 70 ? "OPTIMIZED" : "CRITICAL"
            }
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch dashboard stats" }
    }
}

export async function getLiveAlerts(storeId: string = 'store-freshmart') {
    try {
        const alerts: { type: 'CRITICAL' | 'WARNING' | 'INFO', message: string, id: string }[] = []

        // Run queries in parallel for efficiency
        const [lowStock, urgentTickets] = await Promise.all([
            prisma.product.findMany({
                where: { storeId, stock: { lt: 10 } },
                take: 3
            }),
            prisma.ticket.findMany({
                where: { storeId, status: 'OPEN', priority: 'HIGH' },
                take: 2
            })
        ])

        lowStock.forEach(p => {
            alerts.push({
                id: `stock-${p.id}`,
                type: p.stock === 0 ? 'CRITICAL' : 'WARNING',
                message: `${p.name} is ${p.stock === 0 ? 'out of stock' : 'running low'} (${p.stock} left)`
            })
        })

        urgentTickets.forEach(t => {
            alerts.push({
                id: `ticket-${t.id}`,
                type: 'WARNING',
                message: `Urgent: ${t.subject}`
            })
        })

        return { success: true, alerts }
    } catch (error) {
        return { success: false, error: "Failed to fetch alerts" }
    }
}

export async function getAIInsights(storeId: string = 'store-freshmart') {
    try {
        // Real Analysis: Find top categories and potential issues
        const [topSellingItems, recentRefunds] = await Promise.all([
            prisma.orderItem.groupBy({
                by: ['productId', 'name'],
                where: { order: { storeId } },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            }),
            prisma.order.count({
                where: { storeId, status: 'REFUNDED', updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            })
        ])

        const insights = [
            {
                id: "ai-1",
                type: "OPTIMIZATION",
                impact: topSellingItems.length > 0 ? "HIGH" : "LOW",
                title: "Stock Rebalancing",
                description: topSellingItems.length > 0
                    ? `Top item '${topSellingItems[0].name}' has high velocity. Consider increasing par levels.`
                    : "Stable velocity detected across all categories."
            },
            {
                id: "ai-2",
                type: "FINANCIAL",
                impact: recentRefunds > 5 ? "HIGH" : "MEDIUM",
                title: "Refund Pattern",
                description: `${recentRefunds} refunds processed in the last 7 days. ${recentRefunds > 5 ? 'This is above threshold.' : 'Within normal limits.'}`
            }
        ]
        return { success: true, insights }
    } catch (error) {
        return { success: false, error: "Failed to fetch insights" }
    }
}

export async function getApprovalRequests(storeId: string = 'store-freshmart') {
    try {
        const requests = await prisma.ticket.findMany({
            where: {
                storeId,
                status: 'OPEN',
                subject: {
                    contains: 'Refund Request'
                }
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, requests }
    } catch (error) {
        return { success: false, error: "Failed to fetch approvals" }
    }
}

export async function getRecentAuditLogs(storeId: string = 'store-freshmart') {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { storeId },
            take: 10,
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, logs }
    } catch (error) {
        return { success: false, error: "Failed to fetch audit logs" }
    }
}

export async function getFinanceStats(storeId: string = 'store-freshmart') {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const aggregates = await prisma.order.aggregate({
            where: {
                storeId,
                createdAt: { gte: today },
                status: 'COMPLETED'
            },
            _sum: {
                tax: true,
                discount: true,
                total: true
            }
        })

        const tax = aggregates._sum.tax || 0
        const discounts = aggregates._sum.discount || 0
        const revenue = aggregates._sum.total || 0
        const netRevenue = revenue - tax

        // Real profit calculation for finance tab
        const products = await prisma.product.findMany({
            where: { storeId },
            select: { id: true, costPrice: true, price: true }
        })
        const costMap = new Map(products.map(p => [p.id, p.costPrice || (p.price * 0.7)]))

        const items = await prisma.orderItem.findMany({
            where: { order: { storeId, createdAt: { gte: today }, status: 'COMPLETED' } }
        })

        let totalCost = 0
        items.forEach(i => {
            totalCost += (costMap.get(i.productId) || 0) * i.quantity
        })

        const actualMarginValue = netRevenue - totalCost
        const marginPercent = netRevenue > 0 ? (actualMarginValue / netRevenue) * 100 : 0

        return {
            success: true,
            stats: {
                tax,
                discounts,
                netRevenue,
                margin: marginPercent.toFixed(1) + "%",
                marginValue: actualMarginValue
            }
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch finance stats" }
    }
}

export async function getStaffPerformance(storeId: string = 'store-freshmart') {
    try {
        // Real data: Aggegrate orders by cashier
        const transactions = await prisma.order.findMany({
            where: { storeId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            select: { cashierName: true, total: true }
        })

        const performanceMap: Record<string, number> = {}
        transactions.forEach(t => {
            const name = t.cashierName || "Unknown"
            performanceMap[name] = (performanceMap[name] || 0) + t.total
        })

        const activeStaff = Object.entries(performanceMap).map(([name, sales], index) => ({
            id: `staff-${index}`,
            name,
            role: "Cashier",
            sales,
            speed: "Live Data"
        }))

        return { success: true, staff: activeStaff }
    } catch (error) {
        return { success: false, error: "Failed to fetch staff performance" }
    }
}

export async function getCustomerLoyaltyOverview(storeId: string = 'store-freshmart') {
    try {
        const totalMembers = await prisma.user.count({
            where: {
                LoyaltyAccount: { some: {} }
            }
        })

        const recentEnrollments = await prisma.user.count({
            where: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                LoyaltyAccount: { some: {} }
            }
        })

        const loyaltyStats = await prisma.loyaltyTransaction.aggregate({
            where: { account: { program: { storeId } } },
            _sum: { points: true },
            _count: { id: true }
        })

        const redemptions = await prisma.loyaltyTransaction.count({
            where: { account: { program: { storeId } }, type: 'REDEEM' }
        })

        const rate = loyaltyStats._count.id > 0 ? (redemptions / loyaltyStats._count.id) * 100 : 0

        return {
            success: true,
            stats: {
                totalMembers,
                recentEnrollments,
                activePoints: loyaltyStats._sum.points || 0,
                redemptionRate: rate.toFixed(1) + "%"
            }
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch loyalty overview" }
    }
}
