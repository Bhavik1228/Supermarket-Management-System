"use server"

import { db as prisma } from "@/lib/db"
import { GoogleGenAI } from '@google/genai'
import { revalidatePath } from "next/cache"

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
})

export async function createAITicket(description: string, userId: string = "staff-id") {
    try {
        // 1. Use AI to refine subject and categorize the issue
        const prompt = `A user of a Supermarket Management System is reporting an issue:
        "${description}"
        
        Suggest a concise subject line and a priority (LOW, MEDIUM, HIGH, CRITICAL).
        Return JSON: { "subject": "...", "priority": "..." }`

        const response = await genAI.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        })

        const text = response.text || ''
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const aiData = JSON.parse(cleanJson)

        // 2. Create the ticket
        const ticket = await prisma.ticket.create({
            data: {
                subject: aiData.subject || "Issue reported via AI Assistant",
                priority: aiData.priority || "MEDIUM",
                status: "OPEN",
                userId: userId,
            }
        })

        // 3. Add the user's original message
        await prisma.ticketMessage.create({
            data: {
                ticketId: ticket.id,
                message: description,
                isStaff: false
            }
        })

        revalidatePath("/store/support")
        return { success: true, ticketId: ticket.id }
    } catch (error) {
        console.error("AI Ticket creation error:", error)
        return { success: false, error: "Failed to create ticket" }
    }
}

export async function getTicket(ticketId: string) {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                },
                user: true
            }
        })
        return { success: true, ticket }
    } catch (error) {
        return { success: false, error: "Failed to find ticket" }
    }
}

export async function sendMessage(ticketId: string, message: string, isStaff: boolean = true) {
    try {
        const msg = await prisma.ticketMessage.create({
            data: {
                ticketId,
                message,
                isStaff
            }
        })
        revalidatePath(`/admin/support/${ticketId}`)
        revalidatePath("/store/support")
        return { success: true, message: msg }
    } catch (error) {
        return { success: false, error: "Failed to send message" }
    }
}

export async function updateTicketStatus(ticketId: string, status: string) {
    try {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { status }
        })
        revalidatePath(`/admin/support/${ticketId}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update status" }
    }
}
