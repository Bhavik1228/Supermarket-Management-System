"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Generate a unique referral code for a user
 */
function generateReferralCode(name: string): string {
    const namePrefix = name.substring(0, 3).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${namePrefix}${random}`
}

/**
 * Get or create referral code for a user
 */
export async function getReferralCode(userId: string) {
    try {
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true, name: true }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        // Generate code if doesn't exist
        if (!user.referralCode) {
            const code = generateReferralCode(user.name)

            await prisma.user.update({
                where: { id: userId },
                data: { referralCode: code }
            })

            return { success: true, referralCode: code, isNew: true }
        }

        return { success: true, referralCode: user.referralCode, isNew: false }
    } catch (error) {
        console.error("Failed to get referral code:", error)
        return { success: false, error: "Failed to generate referral code" }
    }
}

/**
 * Apply referral code when a new user signs up
 * Awards points to both referrer and referee
 */
export async function applyReferralCode(
    newUserId: string,
    referralCode: string,
    programId?: string
) {
    try {
        // Find referrer by code
        const referrer = await prisma.user.findUnique({
            where: { referralCode },
            select: { id: true, name: true }
        })

        if (!referrer) {
            return { success: false, error: "Invalid referral code" }
        }

        // Prevent self-referral
        if (referrer.id === newUserId) {
            return { success: false, error: "Cannot refer yourself" }
        }

        // Check if user already has a referrer
        const newUser = await prisma.user.findUnique({
            where: { id: newUserId },
            select: { referredBy: true }
        })

        if (newUser?.referredBy) {
            return { success: false, error: "User already has a referrer" }
        }

        // Update new user with referral info
        await prisma.user.update({
            where: { id: newUserId },
            data: {
                referredBy: referrer.id,
                referredAt: new Date()
            }
        })

        // Find or use default loyalty program
        let program = programId
            ? await prisma.loyaltyProgram.findUnique({ where: { id: programId } })
            : await prisma.loyaltyProgram.findFirst({ where: { isActive: true } })

        if (!program) {
            return { success: true, message: "Referral recorded but no loyalty program active" }
        }

        // Find referral rule for point amounts
        const referralRule = await prisma.loyaltyRule.findFirst({
            where: {
                programId: program.id,
                type: 'REFERRAL'
            }
        })

        const referrerPoints = referralRule?.points || 500 // Default 500 points
        const refereePoints = Math.floor(referrerPoints * 0.5) // Referee gets 50% of referrer reward

        // Award points to referrer
        const referrerAccount = await prisma.loyaltyAccount.findFirst({
            where: {
                userId: referrer.id,
                programId: program.id
            }
        })

        if (referrerAccount) {
            await prisma.$transaction([
                prisma.loyaltyTransaction.create({
                    data: {
                        accountId: referrerAccount.id,
                        type: 'EARN',
                        points: referrerPoints,
                        description: `Referral bonus: Referred new customer`
                    }
                }),
                prisma.loyaltyAccount.update({
                    where: { id: referrerAccount.id },
                    data: {
                        pointsBalance: { increment: referrerPoints },
                        lifetimePoints: { increment: referrerPoints }
                    }
                })
            ])
        }

        // Award points to referee (new user)
        const refereeAccount = await prisma.loyaltyAccount.findFirst({
            where: {
                userId: newUserId,
                programId: program.id
            }
        })

        if (refereeAccount) {
            await prisma.$transaction([
                prisma.loyaltyTransaction.create({
                    data: {
                        accountId: refereeAccount.id,
                        type: 'EARN',
                        points: refereePoints,
                        description: `Welcome bonus: Referred by ${referrer.name}`
                    }
                }),
                prisma.loyaltyAccount.update({
                    where: { id: refereeAccount.id },
                    data: {
                        pointsBalance: { increment: refereePoints },
                        lifetimePoints: { increment: refereePoints }
                    }
                })
            ])
        }

        revalidatePath("/store/customers")

        return {
            success: true,
            referrer: referrer.name,
            rewards: {
                referrerPoints,
                refereePoints
            }
        }
    } catch (error) {
        console.error("Referral application failed:", error)
        return { success: false, error: "Failed to apply referral code" }
    }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string) {
    try {
        const referrals = await prisma.user.findMany({
            where: { referredBy: userId },
            select: {
                id: true,
                name: true,
                email: true,
                referredAt: true,
                orders: {
                    select: { total: true }
                }
            }
        })

        const totalReferrals = referrals.length
        const totalRevenue = referrals.reduce((sum, ref) =>
            sum + ref.orders.reduce((orderSum, order) => orderSum + order.total, 0), 0
        )

        return {
            success: true,
            stats: {
                totalReferrals,
                totalRevenue,
                referrals: referrals.map(r => ({
                    name: r.name,
                    email: r.email,
                    joinedAt: r.referredAt,
                    orderCount: r.orders.length,
                    totalSpent: r.orders.reduce((sum, o) => sum + o.total, 0)
                }))
            }
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch referral stats" }
    }
}
