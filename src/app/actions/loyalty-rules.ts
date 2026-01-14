"use server"

import { db as prisma } from "@/lib/db"

export type EarningContext = {
    orderTotal: number
    items: { productId: string; categoryId?: string; price: number; quantity: number }[]
    storeId: string
    paymentMethod?: string
}

/**
 * Evaluates points to be earned for a given transaction context.
 * Supports:
 * - Base spend (e.g. 1 point per $1)
 * - Category-specific multipliers (e.g. 2x on Beverages)
 * - Product-specific bonuses (e.g. +50 pts for featured items)
 * - Time-based bonus events (e.g. Happy Hour)
 */
export async function calculatePoints(programId: string, context: EarningContext) {
    try {
        const program = await prisma.loyaltyProgram.findUnique({
            where: { id: programId },
            include: { rules: true }
        })

        if (!program || !program.isActive) return 0

        let totalPoints = 0
        const now = new Date()

        // 1. Base Spend Rule - Apply to total order
        const basePoints = Math.floor(context.orderTotal * program.earningRate)
        totalPoints += basePoints

        // 2. Process Item-Specific Rules (Category, Product, etc.)
        for (const item of context.items) {
            let itemPoints = 0
            const itemSubtotal = item.price * item.quantity

            // Check for category-specific rules
            const categoryRules = program.rules.filter(rule =>
                rule.type === 'CATEGORY' &&
                rule.targetId === item.categoryId &&
                (!rule.startDate || new Date(rule.startDate) <= now) &&
                (!rule.endDate || new Date(rule.endDate) >= now)
            )

            for (const rule of categoryRules) {
                if (rule.multiplier > 1) {
                    // Apply multiplier to item subtotal
                    itemPoints += Math.floor(itemSubtotal * program.earningRate * (rule.multiplier - 1))
                }
                if (rule.points > 0) {
                    // Fixed bonus points per item
                    itemPoints += rule.points * item.quantity
                }
            }

            // Check for product-specific rules
            const productRules = program.rules.filter(rule =>
                rule.type === 'PRODUCT' &&
                rule.targetId === item.productId &&
                (!rule.startDate || new Date(rule.startDate) <= now) &&
                (!rule.endDate || new Date(rule.endDate) >= now)
            )

            for (const rule of productRules) {
                if (rule.multiplier > 1) {
                    itemPoints += Math.floor(itemSubtotal * program.earningRate * (rule.multiplier - 1))
                }
                if (rule.points > 0) {
                    itemPoints += rule.points * item.quantity
                }
            }

            totalPoints += itemPoints
        }

        // 3. Order-Level Bonus Rules (Visit, Signup, etc.)
        const orderRules = program.rules.filter(rule =>
            ['VISIT', 'SIGNUP', 'REFERRAL'].includes(rule.type) &&
            (!rule.startDate || new Date(rule.startDate) <= now) &&
            (!rule.endDate || new Date(rule.endDate) >= now)
        )

        for (const rule of orderRules) {
            // Check minimum spend requirement if applicable
            if (rule.minSpend && context.orderTotal < rule.minSpend) continue

            totalPoints += rule.points
        }

        return Math.floor(totalPoints)
    } catch (error) {
        console.error("Error calculating points:", error)
        return 0 // Safe default
    }
}

/**
 * Creates a new loyalty rule for a program
 */
export async function createRule(programId: string, data: any) {
    try {
        await prisma.loyaltyRule.create({
            data: {
                programId,
                type: data.type, // 'SPEND', 'VISIT', 'CATEGORY', 'PRODUCT', etc.
                targetId: data.targetId || null, // Category ID or Product ID
                multiplier: parseFloat(data.multiplier || '1.0'),
                points: parseInt(data.points || '0'),
                minSpend: data.minSpend ? parseFloat(data.minSpend) : null,
                startDate: data.startDate,
                endDate: data.endDate
            }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create rule" }
    }
}

/**
 * Get all rules for a program
 */
export async function getRules(programId: string) {
    try {
        const rules = await prisma.loyaltyRule.findMany({
            where: { programId },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, rules }
    } catch (error) {
        return { success: false, error: "Failed to fetch rules" }
    }
}

/**
 * Delete a loyalty rule
 */
export async function deleteRule(ruleId: string) {
    try {
        await prisma.loyaltyRule.delete({
            where: { id: ruleId }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete rule" }
    }
}
