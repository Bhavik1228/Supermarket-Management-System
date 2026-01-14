"use server"

import { db as prisma } from "@/lib/db"

/**
 * Get points that are expiring soon for a customer
 */
export async function getExpiringPoints(accountId: string, daysAhead: number = 30) {
    try {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() + daysAhead)

        const expiringTransactions = await prisma.loyaltyTransaction.findMany({
            where: {
                accountId,
                type: 'EARN',
                expiresAt: {
                    lte: cutoffDate,
                    gte: new Date() // Not already expired
                }
            },
            orderBy: { expiresAt: 'asc' }
        })

        const totalExpiring = expiringTransactions.reduce((sum, tx) => sum + tx.points, 0)

        return {
            success: true,
            expiringPoints: totalExpiring,
            transactions: expiringTransactions
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch expiring points" }
    }
}

/**
 * Expire points that have passed their expiry date
 * This should be run as a cron job (daily)
 */
export async function expirePoints() {
    try {
        const now = new Date()

        // Find all EARN transactions that have expired
        const expiredTransactions = await prisma.loyaltyTransaction.findMany({
            where: {
                type: 'EARN',
                expiresAt: {
                    lte: now
                }
            },
            include: { account: true }
        })

        let totalExpired = 0

        for (const tx of expiredTransactions) {
            // Create EXPIRE transaction
            await prisma.loyaltyTransaction.create({
                data: {
                    accountId: tx.accountId,
                    type: 'EXPIRE',
                    points: -tx.points,
                    description: `Points expired from transaction ${tx.id.slice(-6)}`
                }
            })

            // Deduct from account balance
            await prisma.loyaltyAccount.update({
                where: { id: tx.accountId },
                data: {
                    pointsBalance: {
                        decrement: tx.points
                    }
                }
            })

            // Mark original transaction as processed (delete or update)
            await prisma.loyaltyTransaction.update({
                where: { id: tx.id },
                data: { expiresAt: null } // Clear expiry to prevent re-processing
            })

            totalExpired += tx.points
        }

        return {
            success: true,
            expiredCount: expiredTransactions.length,
            totalPoints: totalExpired
        }
    } catch (error) {
        console.error("Point expiry failed:", error)
        return { success: false, error: "Failed to expire points" }
    }
}

/**
 * Check if redemption is allowed based on cooling period
 */
export async function canRedeem(accountId: string, programId: string) {
    try {
        const account = await prisma.loyaltyAccount.findUnique({
            where: { id: accountId },
            include: { program: true }
        })

        if (!account) return { success: false, error: "Account not found" }

        // Check cooling period
        if (account.program.redemptionCoolingDays && account.lastRedemptionAt) {
            const daysSinceLastRedemption = Math.floor(
                (Date.now() - account.lastRedemptionAt.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysSinceLastRedemption < account.program.redemptionCoolingDays) {
                const daysRemaining = account.program.redemptionCoolingDays - daysSinceLastRedemption
                return {
                    success: false,
                    canRedeem: false,
                    error: `Redemption cooling period active. ${daysRemaining} days remaining.`
                }
            }
        }

        return { success: true, canRedeem: true }
    } catch (error) {
        return { success: false, error: "Failed to check redemption eligibility" }
    }
}
