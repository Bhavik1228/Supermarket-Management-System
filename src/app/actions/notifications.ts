"use server"

import { sendEmail, getOwnerCriticalAlertEmailHtml, getDailyDigestEmailHtml } from "@/lib/email"
import { db as prisma } from "@/lib/db"

/**
 * Send a critical alert to the store owner
 */
export async function sendOwnerAlert(alertType: string, message: string, details: any) {
    try {
        // In a real app, fetch owner email from store settings
        const ownerEmail = "owner@system.com"
        const storeName = "Fresh Mart Supermarket"

        await sendEmail({
            to: ownerEmail,
            subject: `[CRITICAL] ${alertType} - ${storeName}`,
            html: getOwnerCriticalAlertEmailHtml(storeName, alertType, message, details)
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to send owner alert:", error)
        return { success: false, error: "Failed to send alert" }
    }
}

/**
 * Send a daily digest to the store owner
 * This would be called by a cron job or at day end
 */
export async function sendDailyDigest(storeId: string) {
    try {
        const ownerEmail = "owner@system.com"
        const storeName = "Fresh Mart Supermarket"
        const todayStr = new Date().toLocaleDateString()

        // Fetch daily stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const orders = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: { gte: today },
                status: 'COMPLETED'
            }
        })

        const revenue = orders.reduce((sum, o) => sum + o.total, 0)
        const transactions = orders.length

        const stats = {
            revenue,
            transactions,
            insights: [
                revenue > 1000 ? "Strong sales day detected." : "Normal sales volume.",
                transactions > 50 ? "High customer traffic today." : "Steady customer flow.",
                "AI Recommendation: Restock dairy and fresh produce for tomorrow."
            ]
        }

        await sendEmail({
            to: ownerEmail,
            subject: `Daily Performance Digest - ${todayStr}`,
            html: getDailyDigestEmailHtml(storeName, todayStr, stats)
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to send daily digest:", error)
        return { success: false, error: "Failed to send digest" }
    }
}
