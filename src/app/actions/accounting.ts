"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// --- Chart of Accounts ---

export async function getAccounts(storeId: string) {
    try {
        const accounts = await prisma.account.findMany({
            where: { storeId },
            orderBy: { code: 'asc' }
        })
        return { success: true, accounts }
    } catch (error) {
        console.error("getAccounts error:", error)
        return { success: false, error: "Failed to fetch accounts" }
    }
}

export async function createAccount(storeId: string, data: { name: string, code: string, type: string }) {
    try {
        const account = await prisma.account.create({
            data: {
                storeId,
                name: data.name,
                code: data.code,
                type: data.type
            }
        })
        revalidatePath(`/store/${storeId}/accounting/settings`)
        return { success: true, account }
    } catch (error) {
        return { success: false, error: "Failed to create account" }
    }
}

// --- Tax Slabs ---

export async function getTaxSlabs(storeId: string) {
    try {
        const slabs = await prisma.taxSlab.findMany({
            where: { storeId },
            orderBy: { rate: 'asc' }
        })
        return { success: true, slabs }
    } catch (error) {
        return { success: false, error: "Failed to fetch tax slabs" }
    }
}

export async function createTaxSlab(storeId: string, data: { name: string, rate: number, type: string }) {
    try {
        const slab = await prisma.taxSlab.create({
            data: {
                storeId,
                name: data.name,
                rate: data.rate,
                type: data.type
            }
        })
        revalidatePath(`/store/${storeId}/accounting/settings`)
        return { success: true, slab }
    } catch (error) {
        return { success: false, error: "Failed to create tax slab" }
    }
}

// --- Journal Entries ---

export async function createJournalEntry(storeId: string, description: string, lines: { accountId: string, debit: number, credit: number }[]) {
    try {
        // Validate balance
        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0)
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0)

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return { success: false, error: "Journal entry must balance" }
        }

        const entry = await prisma.journalEntry.create({
            data: {
                storeId,
                description,
                lines: {
                    create: lines.map(line => ({
                        accountId: line.accountId,
                        debit: line.debit,
                        credit: line.credit
                    }))
                }
            }
        })

        // Update account balances (naive approach, better to aggregate)
        for (const line of lines) {
            const account = await prisma.account.findUnique({ where: { id: line.accountId } })
            if (account) {
                // Update logic depends on account type (Asset diff from Liability)
                // For now, simpler access:
                let balanceChange = line.debit - line.credit
                if (['LIABILITY', 'EQUITY', 'INCOME'].includes(account.type)) {
                    balanceChange = line.credit - line.debit
                }
                await prisma.account.update({
                    where: { id: line.accountId },
                    data: { balance: { increment: balanceChange } }
                })
            }
        }

        return { success: true, entry }
    } catch (error) {
        console.error("createJournalEntry error:", error)
        return { success: false, error: "Failed to post journal entry" }
    }
}

// --- Get Journal Entries ---

export async function getJournalEntries(storeId: string) {
    try {
        const entries = await prisma.journalEntry.findMany({
            where: { storeId },
            include: {
                lines: {
                    include: {
                        account: { select: { id: true, name: true, code: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })
        return { success: true, entries }
    } catch (error) {
        console.error("getJournalEntries error:", error)
        return { success: false, error: "Failed to fetch journal entries" }
    }
}

// --- Accounting Summary (Real Data) ---

export async function getAccountingSummary(storeId: string) {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        // Current month orders
        const currentMonthOrders = await prisma.order.findMany({
            where: {
                storeId,
                status: 'COMPLETED',
                createdAt: { gte: startOfMonth }
            }
        })

        // Last month orders for comparison
        const lastMonthOrders = await prisma.order.findMany({
            where: {
                storeId,
                status: 'COMPLETED',
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        })

        const totalRevenue = currentMonthOrders.reduce((sum, o) => sum + o.total, 0)
        const totalTax = currentMonthOrders.reduce((sum, o) => sum + o.tax, 0)
        const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.total, 0)

        // Estimate expenses as 30% of revenue (placeholder until expense tracking is added)
        const expenses = totalRevenue * 0.3
        const netProfit = totalRevenue - expenses - totalTax

        const revenueChange = lastMonthRevenue > 0
            ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : "0"

        return {
            success: true,
            summary: {
                totalRevenue,
                expenses,
                netProfit,
                taxPayable: totalTax,
                revenueChange,
                ordersCount: currentMonthOrders.length
            }
        }
    } catch (error) {
        console.error("getAccountingSummary error:", error)
        return { success: false, error: "Failed to fetch accounting summary" }
    }
}

// --- Financial Reports (P&L, Balance Sheet) ---

export async function getFinancialReports(storeId: string) {
    try {
        const accounts = await prisma.account.findMany({
            where: { storeId },
            orderBy: { code: 'asc' }
        })

        // 1. Calculate P&L (Income and Expenses)
        const incomeAccounts = accounts.filter(a => a.type === 'INCOME')
        const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE')

        const totalIncome = incomeAccounts.reduce((sum, a) => sum + a.balance, 0)
        const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0)
        const netIncome = totalIncome - totalExpenses

        // 2. Calculate Balance Sheet (Assets, Liabilities, Equity)
        const assetAccounts = accounts.filter(a => a.type === 'ASSET')
        const liabilityAccounts = accounts.filter(a => a.type === 'LIABILITY')
        const equityAccounts = accounts.filter(a => a.type === 'EQUITY')

        const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0)
        const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0)
        const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0)

        return {
            success: true,
            pl: {
                income: incomeAccounts,
                expenses: expenseAccounts,
                totalIncome,
                totalExpenses,
                netIncome
            },
            balanceSheet: {
                assets: assetAccounts,
                liabilities: liabilityAccounts,
                equity: equityAccounts,
                totalAssets,
                totalLiabilities,
                totalEquity
            }
        }
    } catch (error) {
        console.error("getFinancialReports error:", error)
        return { success: false, error: "Failed to generate financial reports" }
    }
}
