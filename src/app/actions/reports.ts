"use server"

import { db as prisma } from "@/lib/db"
import { ReportType, ReportFilter } from "@/types/reports"
import { Order, OrderItem, Product, AuditLog } from "@prisma/client"

export async function generateReportData(type: ReportType, filters: ReportFilter, storeId: string = 'store-freshmart') {
    try {
        const { dateRange, staffId, categoryId } = filters
        const dateFilter = dateRange ? {
            createdAt: {
                gte: new Date(dateRange.from),
                lte: new Date(dateRange.to)
            }
        } : {}

        switch (type) {
            case 'SALES':
                return await getSalesReport(dateFilter, staffId, storeId)
            case 'INVENTORY':
                return await getInventoryReport(categoryId, storeId)
            case 'VELOCITY':
                return await getInventoryVelocity(storeId)
            case 'ACCOUNT_STATEMENT':
                return await getAccountStatement(filters.staffId || '', storeId) // staffId used as customerId here
            case 'TAX':
                return await getTaxReport(dateFilter, storeId)
            case 'PROFIT_LOSS':
                return await getProfitLossReport(dateFilter, storeId)
            case 'LOYALTY':
                return await getLoyaltyStatement(filters.staffId, storeId)
            case 'AUDIT':
                return await getAuditReport(dateFilter, staffId, storeId)
            default:
                throw new Error("Invalid report type")
        }
    } catch (error) {
        console.error("Report generation failed:", error)
        return { success: false, error: "Failed to generate report data" }
    }
}

export async function getPlatformSummary(filters: ReportFilter) {
    try {
        const { dateRange } = filters
        const dateFilter = dateRange ? {
            createdAt: {
                gte: new Date(dateRange.from),
                lte: new Date(dateRange.to)
            }
        } : {}

        const stores = await prisma.store.findMany({
            include: {
                orders: { where: { ...dateFilter, status: 'COMPLETED' } }
            }
        })

        const summary = stores.map(store => ({
            id: store.id,
            name: store.name,
            revenue: store.orders.reduce((sum, o) => sum + o.total, 0),
            orders: store.orders.length
        }))

        return { success: true, data: summary }
    } catch (error) {
        console.error("getPlatformSummary error:", error)
        return { success: false, error: "Failed to fetch platform summary" }
    }
}

async function getSalesReport(dateFilter: any, staffId?: string, storeId?: string) {
    const orders = await prisma.order.findMany({
        where: {
            ...dateFilter,
            ...(storeId ? { storeId } : {}),
            ...(staffId ? { userId: staffId } : {}),
            status: 'COMPLETED'
        },
        include: {
            items: true,
            customer: { select: { name: true } }
        }
    })

    const summary = orders.reduce((acc, order) => {
        acc.totalRevenue += order.total
        acc.totalOrders += 1
        acc.totalItems += order.items.length
        return acc
    }, { totalRevenue: 0, totalOrders: 0, totalItems: 0 })

    return { success: true, data: { summary, orders } }
}

async function getInventoryVelocity(storeId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Group by productId and sum quantity
    const salesData = await prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        where: { order: { storeId, createdAt: { gte: thirtyDaysAgo }, status: 'COMPLETED' } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } }
    })

    const products = await prisma.product.findMany({
        where: { storeId },
        select: { id: true, stock: true, reorderPoint: true }
    })

    const stockMap = new Map(products.map(p => [p.id, p]))

    const velocity = salesData.map(s => {
        const product = stockMap.get(s.productId)
        const dailyVelocity = (s._sum.quantity || 0) / 30
        const daysRemaining = product && dailyVelocity > 0 ? product.stock / dailyVelocity : Infinity

        return {
            productId: s.productId,
            name: s.name,
            totalSold: s._sum.quantity || 0,
            dailyVelocity: dailyVelocity.toFixed(2),
            daysRemaining: daysRemaining === Infinity ? '∞' : Math.floor(daysRemaining),
            status: daysRemaining < 7 ? 'CRITICAL' : daysRemaining < 14 ? 'WARNING' : 'STABLE'
        }
    })

    return { success: true, data: velocity }
}

async function getInventoryReport(categoryId?: string, storeId?: string) {
    const products = await prisma.product.findMany({
        where: {
            ...(categoryId ? { category: categoryId } : {}),
            ...(storeId ? { storeId } : {})
        },
        orderBy: { stock: 'asc' }
    })

    const lowStock = products.filter((p: Product) => p.stock <= 10)
    const outOfStock = products.filter((p: Product) => p.stock === 0)

    return {
        success: true,
        data: {
            totalProducts: products.length,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            products
        }
    }
}

async function getTaxReport(dateFilter: any, storeId?: string) {
    const orders = await prisma.order.findMany({
        where: {
            ...dateFilter,
            status: 'COMPLETED',
            ...(storeId ? { storeId } : {})
        }
    })

    const taxSummary = orders.reduce((acc: { totalTax: number; taxableAmount: number }, order: Order) => {
        acc.totalTax += order.tax
        acc.taxableAmount += (order.total - order.tax)
        return acc
    }, { totalTax: 0, taxableAmount: 0 })

    return { success: true, data: { taxSummary, orderCount: orders.length } }
}

async function getProfitLossReport(dateFilter: any, storeId: string) {
    const orders = await prisma.order.findMany({
        where: { ...dateFilter, storeId, status: 'COMPLETED' },
        include: { items: { include: { product: true } } }
    })

    let revenue = 0
    let cogs = 0 // Cost of Goods Sold
    let tax = 0
    let discounts = 0

    orders.forEach(order => {
        revenue += order.total
        tax += order.tax
        discounts += order.discount
        order.items.forEach(item => {
            const cost = item.product?.costPrice || (item.price * 0.7)
            cogs += cost * item.quantity
        })
    })

    const grossProfit = revenue - tax - cogs
    const netProfit = grossProfit - discounts

    return {
        success: true,
        data: {
            revenue,
            cogs,
            tax,
            discounts,
            grossProfit,
            netProfit,
            orderCount: orders.length
        }
    }
}

async function getAccountStatement(customerId: string, storeId: string) {
    const orders = await prisma.order.findMany({
        where: { customerId, storeId, status: 'COMPLETED' },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
    })

    const summary = {
        totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
        orderCount: orders.length,
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
        lastOrderDate: orders[0]?.createdAt.toISOString()
    }

    return { success: true, data: { summary, orders } }
}

async function getLoyaltyStatement(customerId: string | undefined, storeId: string) {
    if (!customerId) return { success: false, error: "Customer ID required for loyalty statement" }

    const account = await prisma.loyaltyAccount.findUnique({
        where: { userId_programId: { userId: customerId, programId: 'standard-loyalty' } }, // Example ID
        include: {
            user: true,
            transactions: { orderBy: { createdAt: 'desc' } }
        }
    })

    if (!account) return { success: false, error: "Loyalty account not found" }

    return { success: true, data: account }
}

async function getAuditReport(dateFilter: any, staffId?: string, storeId?: string) {
    const logs = await prisma.auditLog.findMany({
        where: {
            ...dateFilter,
            ...(staffId ? { userId: staffId } : {}),
            ...(storeId ? { storeId } : {})
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    })

    return { success: true, data: { logs } }
}
