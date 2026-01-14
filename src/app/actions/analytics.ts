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
            include: { items: true }
        })

        const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0)
        const totalOrders = orders.length
        const totalProductsSold = orders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0)

        const customerIds = [...new Set(orders.map(o => o.customerId).filter(Boolean))]
        const totalCustomers = customerIds.length

        // Top Selling Products
        const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {}
        orders.forEach(o => {
            o.items.forEach(i => {
                if (!productSales[i.productId]) {
                    productSales[i.productId] = { name: i.name, quantity: 0, revenue: 0 }
                }
                productSales[i.productId].quantity += i.quantity
                productSales[i.productId].revenue += i.total
            })
        })

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        return {
            success: true,
            metrics: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProductsSold
            },
            topProducts
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

        const history = orders.map(o => ({
            date: o.createdAt.toISOString().split('T')[0],
            total: o.total,
            items: o.items.map(i => i.name).join(", ")
        }))

        const prompt = `Analyze this sales history for a supermarket:
        ${JSON.stringify(history)}
        
        Predict next week's performance, identify potential stockout risks, and suggest one marketing campaign.
        Return JSON: { "prediction": "...", "risks": "...", "campaign": "..." }`

        const response = await genAI.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        })

        const text = response.text || ''
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return { success: true, ...JSON.parse(cleanJson) }
    } catch (error) {
        return { success: false }
    }
}
