"use server"

import { db as prisma } from "@/lib/db"
import { GoogleGenAI } from '@google/genai'

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
})

export async function discoverNewProducts(storeId: string = "store-freshmart") {
    try {
        // 1. Get current products to provide context to AI
        const currentProducts = await prisma.product.findMany({
            where: { storeId },
            select: { name: true, category: true },
            take: 20
        })

        const categories = [...new Set(currentProducts.map(p => p.category))].join(", ")
        const productNames = currentProducts.map(p => p.name).join(", ")

        const prompt = `You are a retail strategy AI. Analyze this supermarket's current inventory and suggest 5 new, high-demand products they should add to their catalog to improve revenue and diversity.
        
        Current Categories: ${categories}
        Sample Products: ${productNames}
        
        Suggest 5 NEW products in JSON format:
        {
            "suggestions": [
                {
                    "name": "Product Name",
                    "category": "Suggested Category",
                    "reason": "Why this product fits",
                    "estimatedPrice": number,
                    "targetAudience": "Who will buy this"
                }
            ]
        }
        Return ONLY valid JSON.`

        const response = await genAI.models.generateContent({
            model: 'gemini-1.5-flash', // Using flash for discovery
            contents: prompt
        })

        const text = response.text || ''
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const data = JSON.parse(cleanJson)

        return { success: true, suggestions: data.suggestions }
    } catch (error) {
        console.error("AI Discovery error:", error)
        return { success: false, error: "Failed to generate suggestions" }
    }
}
