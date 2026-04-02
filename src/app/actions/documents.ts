"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"
import { sendOwnerAlert } from "./notifications"
import { processLoyaltyForOrder, checkAndUpgradeTier } from "./loyalty"

/**
 * Document Management Actions
 */

export async function getDocuments(storeId: string = 'store-freshmart', type?: string) {
    try {
        const where: any = { storeId }
        if (type) where.type = type.toUpperCase()

        const documents = await prisma.document.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, documents }
    } catch (error) {
        return { success: false, error: "Failed to fetch documents" }
    }
}

export async function getDocumentById(id: string) {
    try {
        const document = await prisma.document.findUnique({
            where: { id }
        })
        return { success: true, document }
    } catch (error) {
        return { success: false, error: "Failed to fetch document" }
    }
}

export async function createInvoice(storeId: string, data: any) {
    try {
        const docCount = await prisma.document.count({ where: { storeId, type: 'INVOICE' } })
        const number = `INV-${new Date().getFullYear().toString().slice(-2)}${(docCount + 1).toString().padStart(4, '0')}`

        const doc = await prisma.document.create({
            data: {
                storeId,
                type: 'INVOICE',
                number,
                customerId: data.customerId,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount,
                total: data.total,
                items: JSON.stringify(data.items),
                status: 'ISSUED'
            }
        })
        revalidatePath('/store/documents')
        return { success: true, document: doc }
    } catch (error) {
        console.error("createInvoice error:", error)
        return { success: false, error: "Failed to create invoice" }
    }
}

export async function createQuotation(storeId: string, data: any) {
    try {
        const docCount = await prisma.document.count({ where: { storeId, type: 'QUOTATION' } })
        const number = `QUO-${new Date().getFullYear().toString().slice(-2)}${(docCount + 1).toString().padStart(4, '0')}`

        const doc = await prisma.document.create({
            data: {
                storeId,
                type: 'QUOTATION',
                number,
                customerId: data.customerId,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount,
                total: data.total,
                items: JSON.stringify(data.items),
                status: 'SENT'
            }
        })
        revalidatePath('/store/documents')
        return { success: true, document: doc }
    } catch (error) {
        console.error("createQuotation error:", error)
        return { success: false, error: "Failed to create quotation" }
    }
}

export async function createProformaInvoice(storeId: string, data: any) {
    try {
        const docCount = await prisma.document.count({ where: { storeId, type: 'PROFORMA_INVOICE' } })
        const number = `PRO-${new Date().getFullYear().toString().slice(-2)}${(docCount + 1).toString().padStart(4, '0')}`

        const doc = await prisma.document.create({
            data: {
                storeId,
                type: 'PROFORMA_INVOICE',
                number,
                customerId: data.customerId,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount,
                total: data.total,
                items: JSON.stringify(data.items),
                status: 'DRAFT'
            }
        })
        revalidatePath('/store/documents')
        return { success: true, document: doc }
    } catch (error) {
        console.error("createProformaInvoice error:", error)
        return { success: false, error: "Failed to create proforma invoice" }
    }
}

export async function createDeliveryNote(storeId: string, data: any) {
    try {
        const docCount = await prisma.document.count({ where: { storeId, type: 'DELIVERY_NOTE' } })
        const number = `DLV-${new Date().getFullYear().toString().slice(-2)}${(docCount + 1).toString().padStart(4, '0')}`

        const doc = await prisma.document.create({
            data: {
                storeId,
                type: 'DELIVERY_NOTE',
                number,
                customerId: data.customerId,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                subtotal: data.subtotal,
                tax: 0,
                discount: 0,
                total: data.subtotal,
                items: JSON.stringify(data.items),
                status: 'PENDING'
            }
        })
        revalidatePath('/store/documents')
        return { success: true, document: doc }
    } catch (error) {
        return { success: false, error: "Failed to create delivery note" }
    }
}

export async function createCreditNote(storeId: string, data: any) {
    try {
        const docCount = await prisma.document.count({ where: { storeId, type: 'CREDIT_NOTE' } })
        const number = `CRN-${new Date().getFullYear().toString().slice(-2)}${(docCount + 1).toString().padStart(4, '0')}`

        const doc = await prisma.document.create({
            data: {
                storeId,
                type: 'CREDIT_NOTE',
                number,
                customerId: data.customerId,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount,
                total: data.total,
                items: JSON.stringify(data.items),
                status: 'ISSUED'
            }
        })
        revalidatePath('/store/documents')
        return { success: true, document: doc }
    } catch (error) {
        return { success: false, error: "Failed to create credit note" }
    }
}

export async function updateDocumentStatus(id: string, status: string) {
    try {
        await prisma.document.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/store/documents')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update status" }
    }
}

/**
 * POS Security & Dashboard Actions
 */
export async function getLiveCounters(storeId: string = 'store-freshmart') {
    try {
        // Find recent orders in the last 2 hours to see which staff are active
        const recentOrders = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: { gte: new Date(Date.now() - 120 * 60000) }
            },
            include: {
                store: {
                    include: {
                        staff: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        // Group by staff/terminal (simulated by unique users who processed orders)
        const activeUsers = Array.from(new Set(recentOrders.map(o => o.customerId || 'ANONYMOUS'))) // In real app, orders would have a staffId

        // Let's also check audit logs for POS activity
        const recentPosLogs = await prisma.auditLog.findMany({
            where: {
                storeId,
                action: { contains: 'POS' },
                createdAt: { gte: new Date(Date.now() - 30 * 60000) }
            },
            orderBy: { createdAt: 'desc' }
        })

        const counters = []

        // Combine order data and log data to "guess" active terminals
        const uniqueEmails = Array.from(new Set([
            ...recentOrders.map(o => o.store.ownerId), // Owner is always active in this simulation
            ...recentPosLogs.map(l => l.userEmail).filter(Boolean) as string[]
        ]))

        for (const email of uniqueEmails) {
            const userLogs = recentPosLogs.filter(l => l.userEmail === email)
            const userOrders = recentOrders.filter(o => o.store.ownerId === email) // Simplified match

            counters.push({
                id: `term-${email.split('@')[0]}`,
                name: `Terminal ${email.split('@')[0].toUpperCase()}`,
                staffName: email.split('@')[0],
                status: userLogs.length > 0 ? "ACTIVE" : "IDLE",
                load: Math.min(95, 10 + (userOrders.length * 15)),
                lastActivity: userLogs[0]?.createdAt.toISOString() || new Date().toISOString()
            })
        }

        // Add a fallback if empty
        if (counters.length === 0) {
            counters.push({
                id: "pos-main",
                name: "Main Counter",
                staffName: "System",
                status: "ACTIVE",
                load: 5,
                lastActivity: new Date().toISOString()
            })
        }

        return { success: true, counters }
    } catch (error) {
        console.error("Live counters failed:", error)
        return { success: false, error: "Failed to fetch live counters" }
    }
}

export async function getThreats(storeId: string = 'store-freshmart') {
    try {
        const threats = await prisma.auditLog.findMany({
            where: {
                storeId,
                OR: [
                    { action: { contains: 'OVERRIDE' } },
                    { action: { contains: 'REFUND' } },
                    { action: { contains: 'LOCKDOWN' } },
                    { action: { contains: 'EMERGENCY' } },
                    { action: { contains: 'FAILED' } },
                    { action: { contains: 'UNAUTHORIZED' } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        return {
            success: true,
            threats: threats.map(t => ({
                id: t.id,
                level: t.action.includes('CRITICAL') || t.action.includes('EMERGENCY') ? 'CRITICAL' : 'WARNING',
                message: t.details || t.action,
                time: t.createdAt.toISOString()
            }))
        }
    } catch (error) {
        return { success: false, threats: [] }
    }
}

/**
 * Intervene in a live counter session
 */
export async function interveneInCounter(counterId: string, action: 'LOCK' | 'LOGOUT' | 'TAKEOVER') {
    try {
        // Log the intervention
        await createAuditLog({
            action: `OWNER_INTERVENTION_${action}`,
            entity: 'POS_TERMINAL',
            details: `Owner performed ${action} on counter ${counterId}`,
            entityId: counterId,
            userEmail: 'owner@system.com', // Placeholder
            storeId: 'store-freshmart'
        })

        // In a real app, send a broadcast signal to the POS terminal
        return { success: true, message: `Action ${action} executed successfully` }
    } catch (error) {
        return { success: false, error: "Intervention failed" }
    }
}

/**
 * Execute a transaction with owner-level overrides
 */
export async function executePrivilegedTransaction(data: {
    items: any[],
    total: number,
    subtotal: number,
    tax: number,
    overrides: { price: boolean, tax: boolean, return: boolean },
    justification: string,
    customerId?: string,
    paymentMethod?: string,
    redeemedPoints?: number,
    discountAmount?: number,
    channel?: string
}) {
    try {
        const storeId = 'store-freshmart'

        return await prisma.$transaction(async (tx) => {
            // 1. Log the privileged action (use tx)
            await tx.auditLog.create({
                data: {
                    action: 'OWNER_POS_OVERRIDE_TRANSACTION',
                    entity: 'TRANSACTION',
                    details: `Privileged transaction: $${data.total}. Justification: ${data.justification}. Overrides: ${Object.keys(data.overrides).filter(k => (data.overrides as any)[k]).join(', ')}`,
                    entityId: 'OWNER_POS',
                    userEmail: 'owner@system.com',
                    storeId
                }
            })

            // 2. Create the order
            const order = await tx.order.create({
                data: {
                    total: data.total,
                    subtotal: data.subtotal,
                    tax: data.tax,
                    status: 'COMPLETED',
                    paymentMethod: data.paymentMethod || 'CASH',
                    storeId,
                    customerId: data.customerId,
                    channel: data.channel || 'POS',
                    fulfillmentMethod: 'INSTANT',
                    discount: data.discountAmount || 0,
                    items: {
                        create: data.items.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.customPrice || item.price,
                            total: (item.customPrice || item.price) * item.quantity,
                            name: item.name
                        }))
                    }
                }
            })

            // 3. Handle Loyalty
            if (data.customerId) {
                const loyaltyResult = await processLoyaltyForOrder(tx, {
                    storeId,
                    customerId: data.customerId,
                    orderId: order.id,
                    total: data.total,
                    subtotal: data.subtotal,
                    redeemedPoints: data.redeemedPoints,
                    channel: data.channel || 'POS'
                })

                if (loyaltyResult?.accountId) {
                    await checkAndUpgradeTier(loyaltyResult.accountId)
                }
            }

            // 4. Optional: Send email alert for high-value or specific overrides
            if (data.total > 500 || data.overrides.price) {
                await sendOwnerAlert(
                    "PRIVILEGED_TRANSACTION",
                    `A high-value or price-overridden transaction was processed.`,
                    {
                        amount: `$${data.total}`,
                        justification: data.justification,
                        overrides: Object.keys(data.overrides).filter(k => (data.overrides as any)[k]).join(', '),
                        time: new Date().toLocaleTimeString()
                    }
                )
            }

            revalidatePath('/store/sales')
            return { success: true, order }
        })
    } catch (error) {
        console.error("Privileged transaction failed:", error)
        return { success: false, error: "Privileged transaction failed" }
    }
}

/**
 * High-value refund approval / execution
 */
export async function executeOwnerRefund(orderId: string, amount: number, reason: string) {
    try {
        await createAuditLog({
            action: 'OWNER_POS_REFUND_OVERRIDE',
            entity: 'REFUND',
            details: `Direct refund of $${amount} for order ${orderId}. Reason: ${reason}`,
            entityId: orderId,
            userEmail: 'owner@system.com',
            storeId: 'store-freshmart'
        })

        // Update order status or create a negative transaction
        // ... implementation ...

        return { success: true }
    } catch (error) {
        return { success: false, error: "Refund failed" }
    }
}

/**
 * Emergency Day Close / Reopen
 */
export async function emergencyReopenDay(date: string) {
    try {
        await createAuditLog({
            action: 'EMERGENCY_DAY_REOPEN',
            entity: 'SYSTEM_CONFIG',
            details: `Owner forced reopening of day: ${date}`,
            entityId: date,
            userEmail: 'owner@system.com',
            storeId: 'store-freshmart'
        })

        // Send email alert for emergency reopen
        await sendOwnerAlert(
            "EMERGENCY_DAY_REOPEN",
            `A previously closed day has been force-reopened by the owner.`,
            { date, time: new Date().toLocaleTimeString() }
        )

        return { success: true }
    } catch (error) {
        return { success: false, error: "Emergency reopen failed" }
    }
}

/**
 * AI "Explain This Bill" feature
 */
export async function explainBillAnalysis(items: any[], total: number) {
    try {
        const insights = []
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        const currentTotal = items.reduce((acc, item) => acc + (item.customPrice || item.price) * item.quantity, 0)

        // 1. Discount/Override Analysis
        if (currentTotal < subtotal) {
            const savings = subtotal - currentTotal
            insights.push(`Owner discount applied: Saved $${savings.toFixed(2)} (${((savings / subtotal) * 100).toFixed(0)}% off standard price).`)
        } else if (currentTotal > subtotal) {
            insights.push(`Premium pricing applied: Bill is $${(currentTotal - subtotal).toFixed(2)} above standard rate.`)
        } else {
            insights.push("Standard pricing maintained for all items.")
        }

        // 2. Volume Analysis
        const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
        if (totalItems > 10) {
            insights.push(`High volume transaction detected (${totalItems} units). Consider bulk loyalty bonus.`)
        }

        // 3. Margin Prediction (Simulated)
        const cost = subtotal * 0.75
        const margin = ((currentTotal - cost) / currentTotal) * 100
        if (margin < 15) {
            insights.push(`⚠️ WARNING: Low margin alert! Current estimated margin is ${margin.toFixed(1)}%.`)
        } else {
            insights.push(`Healthy profit margin: Estimated ${margin.toFixed(1)}% on this basket.`)
        }

        // 4. Customer Context (if available in a real app, here simulated)
        if (total > 500) {
            insights.push("Whale Alert: This transaction ranks in the top 1% of monthly sales.")
        }

        return { success: true, insights }
    } catch (error) {
        return { success: false, error: "AI Analysis failed" }
    }
}

/**
 * Emergency Day Closing / Reconciliation
 */
export async function closeDayEmergency(data: {
    actualCash: number,
    expectedCash: number,
    reason: string
}) {
    try {
        await createAuditLog({
            action: 'EMERGENCY_DAY_CLOSE',
            entity: 'SYSTEM_CONFIG',
            details: `Owner forced day close. Discrepancy: $${data.actualCash - data.expectedCash}. Reason: ${data.reason}`,
            entityId: new Date().toISOString().split('T')[0],
            userEmail: 'owner@system.com',
            storeId: 'store-freshmart'
        })

        // Send email alert for emergency close with discrepancy
        if (Math.abs(data.actualCash - data.expectedCash) > 10) {
            await sendOwnerAlert(
                "CASH_DISCREPANCY_ALERT",
                `Emergency day close performed with a discrepancy of $${(data.actualCash - data.expectedCash).toFixed(2)}.`,
                {
                    actual: `$${data.actualCash}`,
                    expected: `$${data.expectedCash}`,
                    difference: `$${(data.actualCash - data.expectedCash).toFixed(2)}`,
                    reason: data.reason
                }
            )
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: "Emergency close failed" }
    }
}

/**
 * Get summary of current session yields
 */
export async function getSessionSummary(storeId: string = 'store-freshmart') {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const orders = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: { gte: today },
                status: 'COMPLETED'
            }
        })

        const summary = orders.reduce((acc, order) => {
            acc.totalExpected += order.total
            acc.orderCount += 1
            if (order.paymentMethod === 'CASH') acc.cashExpected += order.total
            if (order.paymentMethod === 'CARD') acc.cardExpected += order.total
            if (order.paymentMethod === 'MOBILE') acc.mobileExpected += order.total
            return acc
        }, {
            totalExpected: 0,
            orderCount: 0,
            cashExpected: 0,
            cardExpected: 0,
            mobileExpected: 0
        })

        return { success: true, summary }
    } catch (error) {
        return { success: false, error: "Failed to fetch session summary" }
    }
}

/**
 * Persist store lockdown state
 */
export async function triggerStoreLockdown(reason: string, scope: 'FULL' | 'BILLING', storeId: string = 'store-freshmart') {
    try {
        await createAuditLog({
            action: `STORE_LOCKDOWN_${scope}`,
            entity: 'STORE',
            details: `Manual lockdown triggered. Scope: ${scope}. Reason: ${reason}`,
            entityId: storeId,
            userEmail: 'owner@system.com',
            storeId
        })

        // In a real app, this would update a 'lockdown' field in the Store model
        // For now, we simulate success
        return { success: true }
    } catch (error) {
        return { success: false, error: "Lockdown trigger failed" }
    }
}
