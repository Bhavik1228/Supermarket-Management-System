"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

// --- QUERY ACTIONS ---

export async function getLoyaltyProgram(storeId?: string) {
    try {
        // If storeId is provided, look for that specific store's program
        // If not, try to find a global program or fallback
        const where = storeId ? { storeId } : {}

        let program = await prisma.loyaltyProgram.findFirst({
            where,
            include: {
                tiers: { orderBy: { minPoints: 'asc' } },
                rules: true
            }
        })

        // If no program found, return null (handled by UI) or create default if it's the main store
        return { success: true, program }
    } catch (error) {
        return { success: false, error: "Failed to fetch loyalty program" }
    }
}

export async function getLoyaltyBalance(userId: string, programId?: string) {
    try {
        // If programId is not provided, try to find the user's account in ANY active program
        // Prefer one associated with the user's context if possible
        const where = programId
            ? { userId, programId }
            : { userId } // This might return multiple, we take the first for now or need logic

        const account = await prisma.loyaltyAccount.findFirst({
            where,
            include: { tier: true, program: true }
        })

        if (!account) return { success: false, error: "No loyalty account found" }

        return {
            success: true,
            balance: account.pointsBalance,
            tier: account.tier?.name || "Member",
            programName: account.program.name,
            accountId: account.id,
            programId: account.programId
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch balance" }
    }
}

/**
 * Check if user qualifies for tier upgrade based on lifetime points
 * Called automatically after earning points
 */
export async function checkAndUpgradeTier(accountId: string) {
    try {
        const account = await prisma.loyaltyAccount.findUnique({
            where: { id: accountId },
            include: {
                tier: true,
                program: {
                    include: {
                        tiers: { orderBy: { minPoints: 'asc' } }
                    }
                }
            }
        })

        if (!account) return { success: false, error: "Account not found" }

        // Find the highest tier the user qualifies for
        const qualifiedTier = account.program.tiers
            .reverse() // Start from highest tier
            .find(tier => account.lifetimePoints >= tier.minPoints)

        // If user qualifies for a higher tier, upgrade them
        if (qualifiedTier && qualifiedTier.id !== account.tierId) {
            await prisma.loyaltyAccount.update({
                where: { id: accountId },
                data: { tierId: qualifiedTier.id }
            })

            // Create a transaction record for the tier upgrade
            await prisma.loyaltyTransaction.create({
                data: {
                    accountId: account.id,
                    type: 'ADJUST',
                    points: 0,
                    description: `Tier upgraded to ${qualifiedTier.name}`
                }
            })

            return {
                success: true,
                upgraded: true,
                newTier: qualifiedTier.name,
                oldTier: account.tier?.name || 'None'
            }
        }

        return { success: true, upgraded: false }
    } catch (error) {
        console.error("Tier upgrade check failed:", error)
        return { success: false, error: "Failed to check tier upgrade" }
    }
}

// --- MUTATION ACTIONS ---

export async function enrollCustomer(userId: string, programId: string) {
    try {
        // 1. Check if already enrolled
        const existing = await prisma.loyaltyAccount.findUnique({
            where: { userId_programId: { userId, programId } }
        })

        if (existing) return { success: false, error: "Already enrolled" }

        // 2. Get default tier
        const tier = await prisma.loyaltyTier.findFirst({
            where: { programId },
            orderBy: { minPoints: 'asc' }
        })

        // 3. Create Account
        const account = await prisma.loyaltyAccount.create({
            data: {
                userId,
                programId,
                tierId: tier?.id,
                pointsBalance: 0,
                lifetimePoints: 0
            }
        })

        revalidatePath("/store/customers")
        return { success: true, account }
    } catch (error) {
        return { success: false, error: "Failed to enroll customer" }
    }
}

// Note: Core `earn` and `redeem` are often transactional and part of the Order flow (see pos.ts).
// However, these standalone functions are useful for manual adjustments or non-transactional triggers.

/**
 * Manual point adjustment by staff with comprehensive audit trail
 * @param accountId - Loyalty account ID
 * @param points - Points to add (positive) or deduct (negative)
 * @param reason - Required reason for adjustment
 * @param staffId - ID of staff member making adjustment
 * @param metadata - Optional metadata (IP address, location, etc.)
 */
export async function manualAdjustPoints(
    accountId: string,
    points: number,
    reason: string,
    staffId: string,
    metadata?: { ipAddress?: string; location?: string }
) {
    try {
        // Verify staff has permission (in real app, check role)
        const staff = await prisma.user.findUnique({
            where: { id: staffId },
            select: { role: true, name: true }
        })

        if (!staff || !['STORE_MANAGER', 'STORE_OWNER', 'SYSTEM_OWNER'].includes(staff.role)) {
            return { success: false, error: "Unauthorized: Insufficient permissions" }
        }

        if (!reason || reason.trim().length < 10) {
            return { success: false, error: "Reason must be at least 10 characters" }
        }

        const type = points > 0 ? 'ADJUST' : 'ADJUST'
        const auditDescription = `Manual ${points > 0 ? 'addition' : 'deduction'} by ${staff.name} (${staff.role}): ${reason}${metadata?.ipAddress ? ` [IP: ${metadata.ipAddress}]` : ''}`

        await prisma.$transaction([
            prisma.loyaltyTransaction.create({
                data: {
                    accountId,
                    type,
                    points,
                    description: auditDescription
                }
            }),
            prisma.loyaltyAccount.update({
                where: { id: accountId },
                data: {
                    pointsBalance: { increment: points },
                    lifetimePoints: { increment: points > 0 ? points : 0 }
                }
            })
        ])

        // Add to system audit log
        await createAuditLog({
            action: 'LOYALTY_ADJUSTMENT',
            entity: 'LoyaltyAccount',
            entityId: accountId,
            details: auditDescription,
            userId: staffId,
            userEmail: 'staff@marketpulse.com'
        })

        revalidatePath("/store/customers")
        revalidatePath("/admin/loyalty")

        return {
            success: true,
            adjustment: {
                points,
                reason,
                adjustedBy: staff.name,
                timestamp: new Date()
            }
        }
    } catch (error) {
        console.error("Manual adjustment failed:", error)
        return { success: false, error: "Failed to adjust points" }
    }
}

/**
 * Get audit trail for a loyalty account
 */
export async function getAuditTrail(accountId: string, limit: number = 50) {
    try {
        const transactions = await prisma.loyaltyTransaction.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return { success: true, transactions }
    } catch (error) {
        return { success: false, error: "Failed to fetch audit trail" }
    }
}


// --- SETTINGS ACTIONS ---

export async function processLoyaltyForOrder(
    tx: any,
    data: {
        storeId: string,
        customerId: string,
        orderId: string,
        total: number,
        subtotal: number,
        redeemedPoints?: number,
        channel?: string
    }
) {
    const { storeId, customerId, orderId, total, redeemedPoints, channel } = data

    // 1. Find or create loyalty program
    const program = await tx.loyaltyProgram.findFirst({
        where: { OR: [{ storeId }, { storeId: null }] },
        include: { rules: true }
    })

    if (!program || !program.isActive) return null

    // 2. Find or create account
    let account = await tx.loyaltyAccount.findUnique({
        where: { userId_programId: { userId: customerId, programId: program.id } },
        include: { tier: true }
    })

    if (!account) {
        const defaultTier = await tx.loyaltyTier.findFirst({
            where: { programId: program.id },
            orderBy: { minPoints: 'asc' }
        })

        account = await tx.loyaltyAccount.create({
            data: {
                userId: customerId,
                programId: program.id,
                tierId: defaultTier?.id,
                pointsBalance: 0,
                lifetimePoints: 0
            },
            include: { tier: true }
        })
    }

    // 3. Handle Redemption
    if (redeemedPoints && redeemedPoints > 0) {
        if (account.pointsBalance < redeemedPoints) {
            throw new Error("Insufficient points balance")
        }

        await tx.loyaltyTransaction.create({
            data: {
                accountId: account.id,
                type: 'REDEEM',
                points: -redeemedPoints,
                referenceId: orderId,
                description: `Redeemed ${redeemedPoints} points for discount`
            }
        })

        await tx.loyaltyAccount.update({
            where: { id: account.id },
            data: {
                pointsBalance: { decrement: redeemedPoints },
                lastRedemptionAt: new Date()
            }
        })
    }

    // 4. Handle Earning
    const earnRate = program.earningRate || 1.0
    const tierMultiplier = account.tier?.multiplier || 1.0
    let pointsToEarn = 0

    if (program.programType === 'VISIT') {
        const visitRule = (program as any).rules.find((r: any) => r.type === 'VISIT')
        pointsToEarn = visitRule?.points || 10
    } else {
        pointsToEarn = Math.floor(total * earnRate * tierMultiplier)
    }

    // Channel Bonus
    if (channel === 'APP' || channel === 'ONLINE') {
        pointsToEarn = Math.floor(pointsToEarn * 1.5)
    }

    if (pointsToEarn > 0) {
        let expiresAt = null
        if (program.pointExpiryDays) {
            expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + program.pointExpiryDays)
        }

        await tx.loyaltyTransaction.create({
            data: {
                accountId: account.id,
                type: 'EARN',
                points: pointsToEarn,
                referenceId: orderId,
                description: `Points earned from Order #${orderId.slice(-4)}`,
                expiresAt
            }
        })

        await tx.loyaltyAccount.update({
            where: { id: account.id },
            data: {
                pointsBalance: { increment: pointsToEarn },
                lifetimePoints: { increment: pointsToEarn }
            }
        })
    }

    return { pointsEarned: pointsToEarn, accountId: account.id }
}

export async function updateProgramSettings(programId: string, data: any) {
    try {
        await prisma.loyaltyProgram.update({
            where: { id: programId },
            data: {
                currencyName: data.currencyName,
                earningRate: parseFloat(data.earningRate),
                isActive: data.isActive
            }
        })
        revalidatePath("/store/loyalty")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update settings" }
    }
}

export async function createTier(programId: string, data: any) {
    try {
        await prisma.loyaltyTier.create({
            data: {
                programId,
                name: data.name,
                minPoints: parseInt(data.minPoints),
                multiplier: parseFloat(data.multiplier)
            }
        })
        revalidatePath("/store/loyalty")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create tier" }
    }
}

export async function deleteTier(tierId: string) {
    try {
        await prisma.loyaltyTier.delete({ where: { id: tierId } })
        revalidatePath("/store/loyalty")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete tier" }
    }
}
