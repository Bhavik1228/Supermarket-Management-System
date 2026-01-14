"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDailySalesSummary, SalesSummary } from "@/app/actions/reports"
import { Printer, RefreshCw, Calendar, DollarSign, CreditCard, Banknote } from "lucide-react"

export default function ReportsPage() {
    const [summary, setSummary] = useState<SalesSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchReport = async () => {
        setIsLoading(true)
        try {
            const res = await getDailySalesSummary()
            if (res.success && res.data) {
                setSummary(res.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReport()
    }, [])

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Report...</div>
    }

    if (!summary) return <div>Failed to load data.</div>

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">End of Day Report (Z-Report)</h1>
                    <p className="text-muted-foreground">Summary for {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchReport}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print Report
                    </Button>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold">Z-REPORT</h1>
                <p>Fresh Mart Supermarket</p>
                <p className="text-sm text-gray-500">{new Date().toLocaleString()}</p>
                <div className="border-b-2 border-dashed border-gray-300 my-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">${summary.totalSales.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{summary.transactionCount} transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tax Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summary.totalTax.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Discounts Given</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">-${summary.totalDiscount.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Breakdown</CardTitle>
                        <CardDescription>Sales by payment method</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary.paymentMethods.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
                            ) : (
                                summary.paymentMethods.map((pm) => (
                                    <div key={pm.method} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {pm.method === 'cash' ? <Banknote className="h-5 w-5 text-green-600" /> : <CreditCard className="h-5 w-5 text-blue-600" />}
                                            <div>
                                                <p className="font-medium capitalize">{pm.method}</p>
                                                <p className="text-xs text-muted-foreground">{pm.count} orders</p>
                                            </div>
                                        </div>
                                        <div className="font-bold">${pm.amount.toFixed(2)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle>Cash Management</CardTitle>
                        <CardDescription>Verify physical cash in drawer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-yellow-900">Expected Cash</span>
                                <span className="font-bold text-xl text-yellow-900">
                                    ${(summary.paymentMethods.find(p => p.method === 'cash')?.amount || 0).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-yellow-700">
                                Please count the physical cash in the drawer. If it does not match this amount, please log a variance in the Audit Log.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Print Only Footer */}
            <div className="hidden print:block mt-8 text-center text-sm">
                <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                <p>Printed by: Manager</p>
                <p>Signature: ______________________</p>
            </div>
        </div>
    )
}
