"use server"

import { db as prisma } from "@/lib/db"
import { GoogleGenAI } from '@google/genai'

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
})

export async function getStoreMetrics(storeId: string = "store-freshmart") {
    try {
        const orders = await prisma.order.findMany({
            where: { storeId },
            include: { items: true },
            orderBy: { createdAt: 'asc' }
        })

        const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0)
        const totalOrders = orders.length

        // Revenue by Day (for charts)
        const dailyRevenue: Record<string, number> = {}
        const categoryShare: Record<string, number> = {}

        orders.forEach(o => {
            const date = o.createdAt.toISOString().split('T')[0]
            dailyRevenue[date] = (dailyRevenue[date] || 0) + o.total
        })

        const totalProductsSold = orders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0)

        const customerIds = [...new Set(orders.map(o => o.customerId).filter(Boolean))]
        const totalCustomers = customerIds.length

        // Top Selling Products & Category Share
        const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {}

        // Fetch product categories for categories chart
        const products = await prisma.product.findMany({
            where: { storeId },
            select: { id: true, category: true }
        })
        const categoryMap = new Map(products.map(p => [p.id, p.category]))

        orders.forEach(o => {
            o.items.forEach(i => {
                if (!productSales[i.productId]) {
                    productSales[i.productId] = { name: i.name, quantity: 0, revenue: 0 }
                }
                productSales[i.productId].quantity += i.quantity
                productSales[i.productId].revenue += i.total

                const cat = categoryMap.get(i.productId) || "Other"
                categoryShare[cat] = (categoryShare[cat] || 0) + i.total
            })
        })

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        const revenueData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
            date: date.split('-').slice(1).join('/'), // MM/DD
            revenue
        })).slice(-14) // Last 14 days

        const categoryData = Object.entries(categoryShare).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value).slice(0, 5)

        return {
            success: true,
            metrics: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProductsSold
            },
            topProducts,
            revenueData,
            categoryData
        }
    } catch (error) {
        console.error("Analytics error:", error)
        return { success: false }
    }
}

export async function getAIForecast(storeId: string = "store-freshmart") {
    try {
        const orders = await prisma.order.findMany({
            where: { storeId },
            include: { items: true },
            take: 100,
            orderBy: { createdAt: 'desc' }
        })

        if (orders.length === 0) {
            return {
                success: true,
                prediction: "Insufficient data for forecasting. Start processing orders to enable AI insights.",
                risks: "No items detected in current inventory cycles.",
                campaign: "Launch an 'Grand Opening' campaign to attract first-time shoppers."
            }
        }

        const history = orders.map(o => ({
            date: o.createdAt.toISOString().split('T')[0],
            total: o.total,
            items: o.items.map(i => i.name).join(", ")
        }))

        const prompt = `Analyze this sales history for a supermarket:
        ${JSON.stringify(history)}
        
        Predict next week's performance, identify potential stockout risks, and suggest one marketing campaign.
        Return ONLY valid JSON: { "prediction": "...", "risks": "...", "campaign": "..." }`

        const response = await genAI.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        })

        const text = response.text || ''
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return { success: true, ...JSON.parse(cleanJson) }
    } catch (error) {
        console.error("AI Forecast error:", error)
        return { success: false }
    }
}
