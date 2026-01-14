"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getRules() {
    try {
        const rules = await prisma.automationRule.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, rules }
    } catch (error) {
        return { success: false, error: "Failed to fetch rules" }
    }
}

export async function toggleRule(id: string, isActive: boolean) {
    try {
        await prisma.automationRule.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath("/admin/automation")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to toggle rule" }
    }
}

export async function createRule(data: any) {
    try {
        await prisma.automationRule.create({
            data: {
                name: data.name,
                description: data.description,
                triggerType: data.triggerType,
                actionType: data.actionType,
                conditions: JSON.stringify(data.conditions || {})
            }
        })
        revalidatePath("/admin/automation")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create rule" }
    }
}
