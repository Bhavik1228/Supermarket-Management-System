"use server"

import { db as prisma } from "@/lib/db"
import {
    sendEmail,
    getLoyaltyEnrollmentEmailHtml,
    getLoyaltyPointsEarnedEmailHtml,
    getLoyaltyTierUpgradeEmailHtml,
    getLoyaltyPointsExpiringEmailHtml,
    getLoyaltyReferralRewardEmailHtml
} from "@/lib/email"

/**
 * Notification types for loyalty events
 */
export type LoyaltyNotification = {
    type: 'ENROLLMENT' | 'EARNING' | 'REDEMPTION' | 'TIER_UPGRADE' | 'POINTS_EXPIRING' | 'REFERRAL_REWARD'
    userId: string
    title: string
    message: string
    metadata?: Record<string, any>
}

/**
 * Send notification for loyalty enrollment
 */
export async function notifyEnrollment(userId: string, programName: string, initialPoints: number = 0) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    })

    if (!user) return

    const notification: LoyaltyNotification = {
        type: 'ENROLLMENT',
        userId,
        title: `Welcome to ${programName}!`,
        message: `Hi ${user.name}, you've been enrolled in our loyalty program${initialPoints > 0 ? ` with ${initialPoints} welcome points` : ''}. Start earning rewards today!`,
        metadata: { programName, initialPoints }
    }

    // Send email
    await sendEmail({
        to: user.email!,
        subject: `Welcome to ${programName}!`,
        html: getLoyaltyEnrollmentEmailHtml(user.name!, programName, initialPoints, 'Member')
    })

    console.log(`[NOTIFICATION] ${notification.type}:`, notification.message)

    return notification
}

/**
 * Send notification for points earned
 */
export async function notifyPointsEarned(userId: string, points: number, orderId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    })

    if (!user) return

    const notification: LoyaltyNotification = {
        type: 'EARNING',
        userId,
        title: `You earned ${points} points!`,
        message: `Great news ${user.name}! You earned ${points} points from your recent purchase. Keep shopping to earn more rewards!`,
        metadata: { points, orderId }
    }

    // Send email
    await sendEmail({
        to: user.email!,
        subject: `You earned ${points} points!`,
        html: getLoyaltyPointsEarnedEmailHtml(user.name!, points, 0, 0, 'Member')
    })

    console.log(`[NOTIFICATION] ${notification.type}:`, notification.message)

    return notification
}

/**
 * Send notification for tier upgrade
 */
export async function notifyTierUpgrade(userId: string, oldTier: string, newTier: string, benefits?: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    })

    if (!user) return

    const notification: LoyaltyNotification = {
        type: 'TIER_UPGRADE',
        userId,
        title: `🎉 Congratulations! You're now ${newTier}!`,
        message: `Amazing ${user.name}! You've been upgraded from ${oldTier} to ${newTier} tier${benefits ? `. ${benefits}` : ''}. Enjoy your enhanced rewards!`,
        metadata: { oldTier, newTier, benefits }
    }

    // Send email
    await sendEmail({
        to: user.email!,
        subject: `Upgraded to ${newTier}! 🎉`,
        html: getLoyaltyTierUpgradeEmailHtml(user.name!, oldTier, newTier, 1.5)
    })

    console.log(`[NOTIFICATION] ${notification.type}:`, notification.message)

    return notification
}

/**
 * Send notification for expiring points
 */
export async function notifyPointsExpiring(userId: string, points: number, expiryDate: Date) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    })

    if (!user) return

    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    const notification: LoyaltyNotification = {
        type: 'POINTS_EXPIRING',
        userId,
        title: `⚠️ ${points} points expiring soon!`,
        message: `Hi ${user.name}, you have ${points} points expiring in ${daysUntilExpiry} days. Use them before ${expiryDate.toLocaleDateString()} to avoid losing them!`,
        metadata: { points, expiryDate, daysUntilExpiry }
    }

    // Send email
    await sendEmail({
        to: user.email!,
        subject: `⚠️ Your points are expiring!`,
        html: getLoyaltyPointsExpiringEmailHtml(user.name!, points, expiryDate.toLocaleDateString(), daysUntilExpiry)
    })

    console.log(`[NOTIFICATION] ${notification.type}:`, notification.message)

    return notification
}

/**
 * Send notification for referral reward
 */
export async function notifyReferralReward(userId: string, points: number, referredUserName: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    })

    if (!user) return

    const notification: LoyaltyNotification = {
        type: 'REFERRAL_REWARD',
        userId,
        title: `You earned ${points} referral points!`,
        message: `Thanks for spreading the word ${user.name}! ${referredUserName} joined using your referral code. You've earned ${points} bonus points!`,
        metadata: { points, referredUserName }
    }

    // Send email
    await sendEmail({
        to: user.email!,
        subject: `Referral Reward Earned! 🎁`,
        html: getLoyaltyReferralRewardEmailHtml(user.name!, points, referredUserName, 'REF-123', 1)
    })

    console.log(`[NOTIFICATION] ${notification.type}:`, notification.message)

    return notification
}

/**
 * Batch send expiring points notifications
 * Run this as a daily cron job
 */
export async function sendExpiringPointsReminders(daysAhead: number = 7) {
    try {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() + daysAhead)

        // Find all transactions expiring soon
        const expiringTransactions = await prisma.loyaltyTransaction.findMany({
            where: {
                type: 'EARN',
                expiresAt: {
                    lte: cutoffDate,
                    gte: new Date()
                }
            },
            include: {
                account: {
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        })

        // Group by user
        const userExpiringPoints = new Map<string, { points: number, earliestExpiry: Date }>()

        for (const tx of expiringTransactions) {
            const userId = tx.account.user.id
            const existing = userExpiringPoints.get(userId)

            if (!existing || tx.expiresAt! < existing.earliestExpiry) {
                userExpiringPoints.set(userId, {
                    points: (existing?.points || 0) + tx.points,
                    earliestExpiry: tx.expiresAt!
                })
            }
        }

        // Send notifications
        const notifications = []
        for (const [userId, data] of userExpiringPoints) {
            const notification = await notifyPointsExpiring(userId, data.points, data.earliestExpiry)
            if (notification) notifications.push(notification)
        }

        return {
            success: true,
            notificationsSent: notifications.length,
            notifications
        }
    } catch (error) {
        console.error("Failed to send expiring points reminders:", error)
        return { success: false, error: "Failed to send reminders" }
    }
}
