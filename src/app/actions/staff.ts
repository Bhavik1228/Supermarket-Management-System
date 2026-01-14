"use server"

import { db as prisma } from "@/lib/db"
import { GoogleGenAI } from '@google/genai'
import { revalidatePath } from "next/cache"

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ''
})

export async function getStaff(storeId: string = "store-freshmart") {
    try {
        const staff = await prisma.user.findMany({
            where: { workingAtId: storeId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
            }
        })
        return { success: true, staff }
    } catch (error) {
        return { success: false, staff: [] }
    }
}

export async function addStaff(data: any, storeId: string = "store-freshmart") {
    try {
        const staff = await prisma.user.create({
            data: {
                ...data,
                workingAtId: storeId,
                password: "defaultPassword123", // In real app, send invite email
            }
        })
        revalidatePath("/store/staff")
        return { success: true, staff }
    } catch (error) {
        return { success: false, error: "Failed to add staff" }
    }
}

export async function recommendRole(background: string) {
    try {
        const prompt = `Based on this candidate background: "${background}", recommend the best role for a supermarket (STORE_MANAGER, STORE_STAFF, CASHIER, STOCK_CLERK, INVENTORY_MANAGER).
        Return JSON: { "role": "...", "reason": "..." }`

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
export async function getStorePersonnelEmails(storeId: string, roles: string[]) {
    try {
        const staff = await prisma.user.findMany({
            where: {
                workingAtId: storeId,
                role: { in: roles }
            },
            select: { email: true }
        })
        return staff.map(s => s.email)
    } catch (error) {
        console.error("Error fetching staff emails:", error)
        return []
    }
}
