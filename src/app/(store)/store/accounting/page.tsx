"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Receipt, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { getAccountingSummary, getJournalEntries } from "@/app/actions/accounting"

interface AccountingSummary {
    totalRevenue: number
    expenses: number
    netProfit: number
    taxPayable: number
    revenueChange: string
    ordersCount: number
}

interface JournalEntry {
    id: string
    description: string
    createdAt: Date
    lines: { id: string; account?: { name: string }; debit: number; credit: number }[]
}

export default function AccountingDashboard() {
    const [summary, setSummary] = useState<AccountingSummary | null>(null)
    const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const storeId = "store-freshmart"

    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            const [summaryRes, entriesRes] = await Promise.all([
                getAccountingSummary(storeId),
                getJournalEntries(storeId)
            ])

            if (summaryRes.success) {
                setSummary(summaryRes.summary as AccountingSummary)
            }
            if (entriesRes.success) {
                setRecentEntries((entriesRes.entries || []).slice(0, 5))
            }
            setIsLoading(false)
        }
        loadData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const stats = summary || {
        totalRevenue: 0,
        expenses: 0,
        netProfit: 0,
        taxPayable: 0,
        revenueChange: "0",
        ordersCount: 0
    }

    const revenueChangeNum = parseFloat(stats.revenueChange)

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {revenueChangeNum >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-green-600" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-600" />
                            )}
                            <span className={revenueChangeNum >= 0 ? "text-green-600" : "text-red-600"}>
                                {revenueChangeNum >= 0 ? '+' : ''}{stats.revenueChange}%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">Estimated from revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${stats.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">After tax & expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tax Payable</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">${stats.taxPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">From {stats.ordersCount} orders</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <div className="text-center">
                                <p className="font-medium">Revenue Trend Chart</p>
                                <p className="text-sm">Data visualization coming soon</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>
                            Latest auto-posted journal entries.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentEntries.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No journal entries yet</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {recentEntries.map(entry => {
                                    const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0)
                                    const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0)
                                    const isDebit = totalDebit > totalCredit
                                    return (
                                        <div key={entry.id} className="flex items-center">
                                            <div className="ml-4 space-y-1 flex-1">
                                                <p className="text-sm font-medium leading-none">{entry.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {entry.lines.map(l => l.account?.name).filter(Boolean).join(' → ')}
                                                </p>
                                            </div>
                                            <div className={`ml-auto font-medium font-mono ${isDebit ? 'text-green-600' : 'text-red-600'}`}>
                                                {isDebit ? '+' : '-'}${Math.max(totalDebit, totalCredit).toFixed(2)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
