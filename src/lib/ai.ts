import { GoogleGenAI } from '@google/genai'

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
})

export async function generateProductDetails(productName: string, category?: string) {
    try {
        const prompt = `You are a retail product expert. Generate detailed product information for a supermarket/grocery store product.

Product Name: ${productName}
${category ? `Category: ${category}` : ''}

Provide the following in JSON format:
{
  "description": "A compelling 2-3 sentence product description for customers",
  "shortDescription": "A brief one-line description",
  "suggestedPrice": number (in USD, reasonable retail price),
  "category": "Best fitting category (Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks, Meat, Frozen, Pantry, Personal Care, Household)",
  "tags": ["array", "of", "relevant", "tags"],
  "nutritionHighlights": ["key", "nutrition", "points"] or null if not food,
  "storageInstructions": "How to store the product",
  "shelfLife": "Expected shelf life"
}

Return ONLY valid JSON, no markdown or explanation.`

        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        })

        const text = response.text || ''
        // Clean up response - remove markdown code blocks if present
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        return JSON.parse(cleanJson)
    } catch (error) {
        console.error('AI generation error:', error)
        throw new Error('Failed to generate product details')
    }
}

export async function predictInventory(productData: {
    name: string
    currentStock: number
    avgDailySales: number
    lastRestockDate: string
    category: string
}) {
    try {
        const prompt = `You are an AI inventory analyst for a supermarket. Analyze this product and provide inventory predictions.

Product: ${productData.name}
Category: ${productData.category}
Current Stock: ${productData.currentStock} units
Average Daily Sales: ${productData.avgDailySales} units
Last Restock Date: ${productData.lastRestockDate}

Provide analysis in JSON format:
{
  "daysUntilStockout": number,
  "recommendedReorderPoint": number (when to reorder),
  "recommendedOrderQuantity": number,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "insights": ["array", "of", "actionable", "insights"],
  "seasonalTrend": "increasing" | "stable" | "decreasing",
  "recommendation": "A brief recommendation for the store owner"
}

Return ONLY valid JSON.`

        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        })

        const text = response.text || ''
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        return JSON.parse(cleanJson)
    } catch (error) {
        console.error('AI prediction error:', error)
        throw new Error('Failed to predict inventory')
    }
}

export async function generateAuditExplanation(auditLog: {
    action: string
    entity: string
    details: string
    userEmail: string
}) {
    try {
        const prompt = `You are a system auditor. Explain this audit log entry in simple terms for a non-technical store owner.

Action: ${auditLog.action}
Entity: ${auditLog.entity}
Details: ${auditLog.details}
Performed by: ${auditLog.userEmail}

Provide in JSON format:
{
  "summary": "One sentence plain English summary",
  "whatHappened": "Detailed explanation of what occurred",
  "whyItMatters": "Why this action is important",
  "nextSteps": ["array", "of", "recommended", "follow-up", "actions"]
}

Return ONLY valid JSON.`

        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        })

        const text = response.text || ''
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        return JSON.parse(cleanJson)
    } catch (error) {
        console.error('AI explanation error:', error)
        throw new Error('Failed to generate explanation')
    }
}

export async function draftSupportResponse(ticket: {
    subject: string
    message: string
    userName: string
}) {
    try {
        const prompt = `You are a friendly customer support agent for MarketPulse, a supermarket management platform. Draft a helpful response to this support ticket.

Customer: ${ticket.userName}
Subject: ${ticket.subject}
Message: ${ticket.message}

Write a professional, empathetic response that:
1. Acknowledges their concern
2. Provides helpful guidance or solution
3. Offers further assistance

Keep it concise (2-3 paragraphs max). Return as plain text, not JSON.`

        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        })

        return response.text || 'Unable to generate response. Please try again.'
    } catch (error) {
        console.error('AI draft error:', error)
        throw new Error('Failed to draft response')
    }
}
