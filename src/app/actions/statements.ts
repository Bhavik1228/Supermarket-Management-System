"use server"

import { db as prisma } from "@/lib/db"

function convertToCSV(data: any[], headers: string[]) {
    if (data.length === 0) return headers.join(",") + "\n"

    const rows = data.map(row =>
        headers.map(header => {
            const val = row[header]
            const escaped = String(val ?? "").replace(/"/g, '""')
            return `"${escaped}"`
        }).join(",")
    )
    return [headers.join(","), ...rows].join("\n")
}

export async function getTransactionStatementData(storeId: string, days: number = 30) {
    try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const orders = await prisma.order.findMany({
            where: { storeId, createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = orders.map(o => ({
            ID: o.id,
            Date: o.createdAt.toISOString(),
            Total: o.total.toFixed(2),
            Method: o.paymentMethod,
            Channel: o.channel,
            Status: o.status
        }))

        const csv = convertToCSV(formatted, ["ID", "Date", "Total", "Method", "Channel", "Status"])
        return { success: true, csv, filename: `transactions_${days}d.csv` }
    } catch (error) {
        return { success: false, error: "Failed to generate transaction statement" }
    }
}

export async function getStaffPerformanceStatementData(storeId: string, days: number = 30) {
    try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const orders = await prisma.order.findMany({
            where: { storeId, createdAt: { gte: startDate }, status: 'COMPLETED' },
            select: { cashierName: true, total: true }
        })

        const performance: Record<string, { sales: number, count: number }> = {}
        orders.forEach(o => {
            const name = o.cashierName || "Unknown"
            if (!performance[name]) performance[name] = { sales: 0, count: 0 }
            performance[name].sales += o.total
            performance[name].count += 1
        })

        const formatted = Object.entries(performance).map(([name, data]) => ({
            StaffName: name,
            TotalSales: data.sales.toFixed(2),
            OrderCount: data.count,
            AvgOrderValue: (data.sales / data.count).toFixed(2)
        }))

        const csv = convertToCSV(formatted, ["StaffName", "TotalSales", "OrderCount", "AvgOrderValue"])
        return { success: true, csv, filename: `staff_performance_${days}d.csv` }
    } catch (error) {
        return { success: false, error: "Failed to generate staff statement" }
    }
}

export async function getAuditLogStatementData(storeId: string, days: number = 30) {
    try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const logs = await prisma.auditLog.findMany({
            where: { storeId, createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = logs.map(l => ({
            Date: l.createdAt.toISOString(),
            User: l.userEmail,
            Action: l.action,
            Entity: l.entity,
            Details: l.details || ""
        }))

        const csv = convertToCSV(formatted, ["Date", "User", "Action", "Entity", "Details"])
        return { success: true, csv, filename: `audit_logs_${days}d.csv` }
    } catch (error) {
        return { success: false, error: "Failed to generate audit log statement" }
    }
}

export async function getSupplierStatementData(storeId: string, days: number = 30) {
    try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const suppliers = await prisma.supplier.findMany({
            where: { storeId },
            include: {
                purchaseOrders: {
                    where: { createdAt: { gte: startDate } }
                }
            }
        })

        const formatted = suppliers.map(s => {
            const totalPOValue = s.purchaseOrders.reduce((sum, po) => sum + po.total, 0)
            return {
                SupplierName: s.name,
                Category: s.category || "General",
                TotalOrdersValue: totalPOValue.toFixed(2),
                CurrentPayables: s.payables.toFixed(2),
                Reliability: (s.reliability * 100).toFixed(0) + "%"
            }
        })

        const csv = convertToCSV(formatted, ["SupplierName", "Category", "TotalOrdersValue", "CurrentPayables", "Reliability"])
        return { success: true, csv, filename: `supplier_overview_${days}d.csv` }
    } catch (error) {
        return { success: false, error: "Failed to generate supplier statement" }
    }
}

export async function getInventoryValuationStatement(storeId: string) {
    try {
        const products = await prisma.product.findMany({
            where: { storeId }
        })

        const formatted = products.map(p => ({
            SKU: p.id.slice(0, 8),
            Name: p.name,
            Category: p.category || "General",
            Stock: p.stock,
            Price: p.price.toFixed(2),
            TotalValue: (p.stock * p.price).toFixed(2)
        }))

        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0)
        formatted.push({
            SKU: "TOTAL",
            Name: "-",
            Category: "-",
            Stock: 0,
            Price: "-",
            TotalValue: totalValue.toFixed(2)
        })

        const csv = convertToCSV(formatted, ["SKU", "Name", "Category", "Stock", "Price", "TotalValue"])
        return { success: true, csv, filename: `inventory_valuation.csv` }
    } catch (error) {
        return { success: false, error: "Failed to generate inventory statement" }
    }
}

export async function getTaxLiabilityStatement(storeId: string, days: number = 30) {
    try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const orders = await prisma.order.findMany({
            where: { storeId, createdAt: { gte: startDate }, status: 'COMPLETED' },
            select: { total: true, tax: true, createdAt: true }
        })

        const formatted = orders.map(o => ({
            Date: o.createdAt.toISOString().split('T')[0],
            GrossSales: o.total.toFixed(2),
            TaxCollected: (o.tax || 0).toFixed(2),
            NetSales: (o.total - (o.tax || 0)).toFixed(2)
        }))

        const totals = orders.reduce((acc, o) => ({
            gross: acc.gross + o.total,
            tax: acc.tax + (o.tax || 0),
            net: acc.net + (o.total - (o.tax || 0))
        }), { gross: 0, tax: 0, net: 0 })

        formatted.push({
            Date: "TOTALS",
            GrossSales: totals.gross.toFixed(2),
            TaxCollected: totals.tax.toFixed(2),
            NetSales: totals.net.toFixed(2)
        })

        const csv = convertToCSV(formatted, ["Date", "GrossSales", "TaxCollected", "NetSales"])
        return { success: true, csv, filename: `tax_liability_${days}d.csv` }
    } catch (error) {
        return { success: false, error: "Failed to generate tax statement" }
    }
}
