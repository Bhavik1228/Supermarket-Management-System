"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Play 'Spin the Wheel' game
 * @param userId - User ID playing the game
 * @param gameId - ID of the GamifiedGame config
 */
export async function playSpinWheel(userId: string, gameId: string) {
    try {
        // 1. Get Game Config
        const game = await prisma.gamifiedGame.findUnique({
            where: { id: gameId },
            include: { rewards: true }
        })

        if (!game || !game.isActive) {
            return { success: false, error: "Game not available" }
        }

        // 2. Check Cooldown
        const lastParticipation = await prisma.gameParticipation.findFirst({
            where: { userId, gameId },
            orderBy: { wonAt: 'desc' }
        })

        if (lastParticipation) {
            const nextAvailable = new Date(lastParticipation.wonAt)
            nextAvailable.setHours(nextAvailable.getHours() + game.cooldownHours)

            if (new Date() < nextAvailable) {
                const hoursLeft = Math.ceil((nextAvailable.getTime() - Date.now()) / (1000 * 60 * 60))
                return {
                    success: false,
                    error: `You can play again in ${hoursLeft} hour(s)`,
                    nextAvailable
                }
            }
        }

        // 3. Determine Reward based on chance
        const random = Math.random()
        let cumulativeChance = 0
        let selectedReward = null

        // Sort rewards to ensure consistent probability logic if needed, 
        // though random selection works fine with cumulative.
        for (const reward of game.rewards) {
            cumulativeChance += reward.chance
            if (random <= cumulativeChance) {
                selectedReward = reward
                break
            }
        }

        // 4. Process Reward
        const result = await prisma.$transaction(async (tx) => {
            // Record Participation
            const participation = await tx.gameParticipation.create({
                data: {
                    userId,
                    gameId,
                    rewardId: selectedReward?.id
                }
            })

            if (!selectedReward || selectedReward.type === 'BETTER_LUCK') {
                return { won: false, message: "Better luck next time!" }
            }

            // Handle Points Reward
            if (selectedReward.type === 'POINTS') {
                const program = await tx.loyaltyProgram.findFirst({
                    where: { isActive: true } // Assume default active program
                })

                if (program) {
                    const account = await tx.loyaltyAccount.findUnique({
                        where: { userId_programId: { userId, programId: program.id } }
                    })

                    if (account) {
                        await tx.loyaltyTransaction.create({
                            data: {
                                accountId: account.id,
                                type: 'BONUS',
                                points: Math.floor(selectedReward.value),
                                description: `Won from ${game.name}`
                            }
                        })

                        await tx.loyaltyAccount.update({
                            where: { id: account.id },
                            data: {
                                pointsBalance: { increment: Math.floor(selectedReward.value) },
                                lifetimePoints: { increment: Math.floor(selectedReward.value) }
                            }
                        })
                    }
                }
                return { won: true, type: 'POINTS', value: selectedReward.value, message: `You won ${selectedReward.value} points!` }
            }

            // Handle Coupon Reward
            if (selectedReward.type === 'COUPON' && selectedReward.couponId) {
                // Find the base coupon template
                const template = await tx.coupon.findUnique({
                    where: { id: selectedReward.couponId }
                })

                if (template) {
                    // Create a personalized instance for the user
                    const newCouponCode = `WIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                    const userCoupon = await tx.coupon.create({
                        data: {
                            code: newCouponCode,
                            title: `Spin Win: ${template.title}`,
                            description: template.description || `Won from ${game.name}`,
                            discountType: template.discountType,
                            value: template.value,
                            minSpend: template.minSpend,
                            isActive: true,
                            isPersonalized: true,
                            assignedToId: userId,
                            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
                        }
                    })

                    return { won: true, type: 'COUPON', code: newCouponCode, message: `You won a ${template.value}% discount coupon!` }
                }
            }

            return { won: false, message: "Unexpected reward type" }
        })

        revalidatePath("/store/loyalty")
        return { success: true, result }

    } catch (error) {
        console.error("Game play failed:", error)
        return { success: false, error: "Failed to play game" }
    }
}

/**
 * Initialize a default 'Spin the Wheel' game if none exists
 */
export async function initDefaultGame() {
    try {
        const existing = await prisma.gamifiedGame.findFirst({
            where: { name: "Daily Spin" }
        })

        if (existing) return { success: true, gameId: existing.id }

        const game = await prisma.gamifiedGame.create({
            data: {
                name: "Daily Spin",
                description: "Spin the wheel every 24 hours to win points or coupons!",
                cooldownHours: 24,
                rewards: {
                    create: [
                        { name: "100 Points", type: "POINTS", value: 100, chance: 0.2 },
                        { name: "50 Points", type: "POINTS", value: 50, chance: 0.4 },
                        { name: "10% Discount Coupon", type: "COUPON", value: 10, chance: 0.1 }, // Needs a couponId link in reality
                        { name: "Better Luck", type: "BETTER_LUCK", value: 0, chance: 0.3 },
                    ]
                }
            }
        })

        return { success: true, gameId: game.id }
    } catch (error) {
        console.error("Failed to init game:", error)
        return { success: false }
    }
}
