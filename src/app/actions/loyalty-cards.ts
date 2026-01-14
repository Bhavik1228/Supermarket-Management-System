"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Generate a unique loyalty card code
 */
function generateCardCode(): string {
    const prefix = "LC"
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
}

/**
 * Issue a new loyalty card (physical or digital) to a customer
 */
export async function issueLoyaltyCard(
    accountId: string,
    type: 'PHYSICAL' | 'DIGITAL' = 'DIGITAL'
) {
    try {
        const code = generateCardCode()

        const card = await prisma.loyaltyCard.create({
            data: {
                code,
                type,
                accountId,
                isActive: true
            }
        })

        revalidatePath("/store/customers")

        return {
            success: true,
            card: {
                code: card.code,
                type: card.type,
                issuedAt: card.createdAt
            }
        }
    } catch (error) {
        console.error("Card issuance failed:", error)
        return { success: false, error: "Failed to issue loyalty card" }
    }
}

/**
 * Lookup loyalty account by card code (for quick POS scanning)
 */
export async function getLoyaltyByCard(cardCode: string) {
    try {
        const card = await prisma.loyaltyCard.findUnique({
            where: { code: cardCode },
            include: {
                account: {
                    include: {
                        user: { select: { name: true, email: true, phone: true } },
                        tier: true,
                        program: true
                    }
                }
            }
        })

        if (!card || !card.isActive) {
            return { success: false, error: "Invalid or inactive card" }
        }

        return {
            success: true,
            account: card.account,
            cardType: card.type
        }
    } catch (error) {
        return { success: false, error: "Failed to lookup card" }
    }
}

/**
 * Deactivate a loyalty card (lost/stolen)
 */
export async function deactivateCard(cardCode: string, reason: string) {
    try {
        await prisma.loyaltyCard.update({
            where: { code: cardCode },
            data: { isActive: false }
        })

        revalidatePath("/store/customers")

        return { success: true, message: `Card deactivated: ${reason}` }
    } catch (error) {
        return { success: false, error: "Failed to deactivate card" }
    }
}

/**
 * Get all cards for an account
 */
export async function getAccountCards(accountId: string) {
    try {
        const cards = await prisma.loyaltyCard.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, cards }
    } catch (error) {
        return { success: false, error: "Failed to fetch cards" }
    }
}
