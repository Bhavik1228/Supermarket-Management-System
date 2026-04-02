"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { processLoyaltyForOrder } from "./loyalty"

export async function getProducts(storeId: string = 'store-freshmart') {
    try {
        const products = await prisma.product.findMany({
            where: { storeId }
        })
        return { success: true, products }
    } catch (error) {
        return { success: false, error: "Failed to fetch products" }
    }
}

export async function searchCustomers(query: string) {
    if (!query || query.length < 2) return []

    const customers = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } },
            ],
            // role: { in: ['CUSTOMER', 'STORE_STAFF'] } // Optional: filter by role
        },
        include: {
            LoyaltyAccount: true
        },
        take: 5,
    })

    return customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        image: c.image,
        points: c.LoyaltyAccount?.[0]?.pointsBalance || 0
    }))
}

import { enrollCustomer, checkAndUpgradeTier } from "./loyalty"

export async function createCustomer(data: { name: string; email: string; phone?: string }) {
    // Basic validation
    if (!data.phone || !data.name) {
        return { error: "Name and Phone are required" }
    }

    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: 'CUSTOMER',
                password: 'default_password',
            }
        })

        // Auto-enroll in default program
        // We assume 'loyalty-freshmart' or lookup handled by enrollCustomer if we pass a storeId or if it handles defaults
        // Since enrollCustomer takes (userId, programId), we need to know programId. 
        // Let's use getLoyaltyProgram to iterate or just find the default one here.

        // Quick lookup for default program
        const program = await prisma.loyaltyProgram.findFirst({ where: { isActive: true } })
        if (program) {
            await prisma.loyaltyAccount.create({
                data: {
                    userId: user.id,
                    programId: program.id,
                    pointsBalance: 0,
                    lifetimePoints: 0
                }
            })
        }

        return { success: true, user: { ...user, points: 0, tier: 'Member' } }
    } catch (error) {
        console.error("Failed to create customer:", error)
        return { error: "Failed to create customer. Email might be taken." }
    }
}

export async function getLoyaltyDetails(userId: string, programId: string) {
    const account = await prisma.loyaltyAccount.findUnique({
        where: {
            userId_programId: {
                userId,
                programId
            }
        },
        include: {
            tier: true
        }
    })


    return account
}

export async function createOrderWithLoyalty(
    data: {
        storeId?: string,
        items: any[],
        total: number,
        subtotal: number,
        tax: number,
        paymentMethod: string,
        customerId?: string,
        redeemedPoints?: number,
        discountAmount?: number,
        couponCode?: string,
        channel?: string,
        fulfillmentMethod?: string
    }
) {
    // Default store ID for prototype - in real app, context provides this
    const storeId = data.storeId || 'store-freshmart'

    try {
        const order = await prisma.$transaction(async (tx) => {
            // 1. Validate Stock & Deduct Inventory (Critical P0)
            for (const item of data.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.id }
                })

                if (!product) {
                    throw new Error(`Product not found: ${item.name}`)
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}`)
                }

                await tx.product.update({
                    where: { id: item.id },
                    data: { stock: { decrement: item.quantity } }
                })
            }

            // 2. Create Order
            const newOrder = await tx.order.create({
                data: {
                    storeId,
                    total: data.total,
                    subtotal: data.subtotal,
                    tax: data.tax,
                    paymentMethod: data.paymentMethod,
                    channel: data.channel || "POS",
                    fulfillmentMethod: data.fulfillmentMethod || "INSTANT",
                    customerId: data.customerId, // Add customer link
                    discount: data.discountAmount || 0, // Store discount value
                    items: {
                        create: data.items.map((item: any) => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.price * item.quantity,
                            name: item.name
                        }))
                    },
                }
            })

            // 3. Handle Loyalty: Redemption & Earning
            if (data.customerId) {
                await processLoyaltyForOrder(tx, {
                    storeId,
                    customerId: data.customerId,
                    orderId: newOrder.id,
                    total: data.total,
                    subtotal: data.subtotal,
                    redeemedPoints: data.redeemedPoints,
                    channel: data.channel || "POS"
                })
            }

            // 4. Handle Coupon (New)
            if (data.couponCode) {
                const coupon = await tx.coupon.findUnique({
                    where: { code: data.couponCode }
                })

                if (!coupon || !coupon.isActive) {
                    throw new Error("Invalid or inactive coupon code")
                }

                if (coupon.expiresAt && new Date() > coupon.expiresAt) {
                    throw new Error("Coupon has expired")
                }

                if (coupon.minSpend && data.subtotal < coupon.minSpend) {
                    throw new Error(`Minimum spend of ${coupon.minSpend} required for this coupon`)
                }

                // Check usage limits
                if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
                    throw new Error("Coupon usage limit reached")
                }

                if (data.customerId && coupon.maxUsesPerUser) {
                    const usageCount = await tx.couponUsage.count({
                        where: { couponId: coupon.id, userId: data.customerId }
                    })
                    if (usageCount >= coupon.maxUsesPerUser) {
                        throw new Error("You have already used this coupon")
                    }
                }

                // Record usage
                await tx.couponUsage.create({
                    data: {
                        couponId: coupon.id,
                        userId: data.customerId || 'anonymous', // Guest checkout coupon support?
                        orderId: newOrder.id,
                        discountAmount: data.discountAmount || 0
                    }
                })

                // Increment count
                await tx.coupon.update({
                    where: { id: coupon.id },
                    data: { usesCount: { increment: 1 } }
                })
            }

            return newOrder
        })

        // Check for tier upgrade AFTER transaction completes
        // This is done outside the transaction to avoid blocking the order
        if (data.customerId && order) {
            const program = await prisma.loyaltyProgram.findFirst({
                where: { OR: [{ storeId }, { storeId: null }] }
            })

            if (program) {
                const account = await prisma.loyaltyAccount.findUnique({
                    where: { userId_programId: { userId: data.customerId, programId: program.id } }
                })

                if (account) {
                    // Trigger tier upgrade check (non-blocking)
                    checkAndUpgradeTier(account.id).catch(err =>
                        console.error("Tier upgrade failed:", err)
                    )
                }
            }
        }

        return { success: true, order }
    } catch (error: any) {
        console.error("Order failed:", error)
        return { success: false, error: error.message || "Failed to process order" }
    }
}
