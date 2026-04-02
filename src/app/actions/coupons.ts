"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Generate a unique coupon code
 */
function generateCouponCode(prefix: string = "SAVE"): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
    return `${prefix}${random}${timestamp}`
}

/**
 * Create a new coupon
 */
export async function createCoupon(data: {
    code?: string
    description?: string
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
    discountValue: number
    usageType?: 'SINGLE' | 'MULTI' | 'UNLIMITED'
    maxUses?: number
    maxUsesPerUser?: number
    startDate?: Date
    expiryDate?: Date
    minPurchase?: number
    maxDiscount?: number
    storeId?: string
    isPersonalized?: boolean
    assignedToId?: string
    isStackable?: boolean
    loyaltyProgramId?: string
    pointsCost?: number
}) {
    try {
        const code = data.code || generateCouponCode()

        const coupon = await prisma.coupon.create({
            data: {
                code,
                description: data.description,
                discountType: data.discountType,
                value: data.discountValue,
                usageType: data.usageType || 'SINGLE',
                maxUses: data.maxUses,
                maxUsesPerUser: data.maxUsesPerUser,
                startDate: data.startDate,
                expiresAt: data.expiryDate,
                minSpend: data.minPurchase,
                maxDiscount: data.maxDiscount,
                storeId: data.storeId,
                isPersonalized: data.isPersonalized || false,
                assignedToId: data.assignedToId,
                isStackable: data.isStackable || false,
                loyaltyProgramId: data.loyaltyProgramId,
                pointsCost: data.pointsCost
            }
        })

        revalidatePath("/admin/coupons")

        return { success: true, coupon }
    } catch (error) {
        console.error("Failed to create coupon:", error)
        return { success: false, error: "Failed to create coupon" }
    }
}

/**
 * Validate and apply coupon to an order
 */
export async function validateCoupon(
    code: string,
    userId: string,
    orderTotal: number,
    storeId?: string
) {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code },
            include: {
                usage: {
                    where: { userId }
                }
            }
        })

        if (!coupon) {
            return { valid: false, error: "Invalid coupon code" }
        }

        // Check if active
        if (!coupon.isActive) {
            return { valid: false, error: "This coupon is no longer active" }
        }

        // Check expiry
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return { valid: false, error: "This coupon has expired" }
        }

        // Check start date
        if (coupon.startDate && new Date() < coupon.startDate) {
            return { valid: false, error: "This coupon is not yet valid" }
        }

        // Check store restriction
        if (coupon.storeId && coupon.storeId !== storeId) {
            return { valid: false, error: "This coupon is not valid for this store" }
        }

        // Check personalization
        if (coupon.isPersonalized && coupon.assignedToId !== userId) {
            return { valid: false, error: "This coupon is assigned to another user" }
        }

        // Check minimum purchase
        if (coupon.minSpend && orderTotal < coupon.minSpend) {
            return { valid: false, error: `Minimum purchase of $${coupon.minSpend} required` }
        }

        // Check total usage limit
        if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
            return { valid: false, error: "This coupon has reached its usage limit" }
        }

        // Check per-user usage limit
        if (coupon.maxUsesPerUser) {
            const userUsageCount = coupon.usage.length
            if (userUsageCount >= coupon.maxUsesPerUser) {
                return { valid: false, error: "You have already used this coupon the maximum number of times" }
            }
        }

        // Calculate discount
        let discountAmount = 0
        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (orderTotal * coupon.value) / 100
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
            discountAmount = coupon.value
        }

        // Apply max discount cap
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount
        }

        // Ensure discount doesn't exceed order total
        discountAmount = Math.min(discountAmount, orderTotal)

        return {
            valid: true,
            coupon,
            discountAmount,
            isStackable: coupon.isStackable
        }
    } catch (error) {
        console.error("Coupon validation error:", error)
        return { valid: false, error: "Failed to validate coupon" }
    }
}

/**
 * Apply coupon to order (record usage)
 */
export async function applyCoupon(
    couponId: string,
    userId: string,
    orderId: string,
    discountAmount: number
) {
    try {
        await prisma.$transaction([
            // Record usage
            prisma.couponUsage.create({
                data: {
                    couponId,
                    userId,
                    orderId,
                    discountAmount
                }
            }),
            // Increment usage count
            prisma.coupon.update({
                where: { id: couponId },
                data: {
                    usesCount: { increment: 1 }
                }
            })
        ])

        return { success: true }
    } catch (error) {
        console.error("Failed to apply coupon:", error)
        return { success: false, error: "Failed to apply coupon" }
    }
}

/**
 * Gift a coupon to another user
 */
export async function giftCoupon(
    couponId: string,
    fromUserId: string,
    toUserId: string,
    message?: string
) {
    try {
        const coupon = await prisma.coupon.update({
            where: { id: couponId },
            data: {
                giftedById: fromUserId,
                assignedToId: toUserId,
                isPersonalized: true,
                giftMessage: message
            },
            include: {
                assignedTo: { select: { name: true, email: true } },
                giftedBy: { select: { name: true } }
            }
        })

        revalidatePath("/store/coupons")

        // TODO: Send gift notification email

        return { success: true, coupon }
    } catch (error) {
        console.error("Failed to gift coupon:", error)
        return { success: false, error: "Failed to gift coupon" }
    }
}

/**
 * Redeem loyalty points for a coupon
 */
export async function redeemCouponWithPoints(
    userId: string,
    couponId: string,
    loyaltyAccountId: string
) {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId }
        })

        if (!coupon || !coupon.pointsCost) {
            return { success: false, error: "Invalid coupon or no points cost set" }
        }

        const account = await prisma.loyaltyAccount.findUnique({
            where: { id: loyaltyAccountId }
        })

        if (!account || account.pointsBalance < coupon.pointsCost) {
            return { success: false, error: "Insufficient points" }
        }

        // Deduct points and assign coupon
        await prisma.$transaction([
            prisma.loyaltyAccount.update({
                where: { id: loyaltyAccountId },
                data: {
                    pointsBalance: { decrement: coupon.pointsCost }
                }
            }),
            prisma.loyaltyTransaction.create({
                data: {
                    accountId: loyaltyAccountId,
                    type: 'REDEEM',
                    points: -coupon.pointsCost,
                    description: `Redeemed coupon: ${coupon.code}`
                }
            }),
            prisma.coupon.update({
                where: { id: couponId },
                data: {
                    assignedToId: userId,
                    isPersonalized: true
                }
            })
        ])

        revalidatePath("/store/rewards")

        return { success: true, coupon }
    } catch (error) {
        console.error("Failed to redeem coupon:", error)
        return { success: false, error: "Failed to redeem coupon" }
    }
}

/**
 * Get user's available coupons
 */
export async function getUserCoupons(userId: string) {
    try {
        const coupons = await prisma.coupon.findMany({
            where: {
                OR: [
                    { isPersonalized: false, isActive: true },
                    { assignedToId: userId, isActive: true }
                ],
                expiresAt: {
                    gte: new Date()
                }
            },
            include: {
                giftedBy: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, coupons }
    } catch (error) {
        return { success: false, error: "Failed to fetch coupons" }
    }
}
