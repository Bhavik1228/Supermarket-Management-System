"use client"

import { useState, useEffect } from "react"
import { getTransactions } from "@/app/actions/transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    DollarSign, ShoppingCart, TrendingUp, TrendingDown, Clock,
    Calendar, Download, Filter, CreditCard, Banknote, RefreshCw,
    ArrowUpRight, ArrowDownRight, Receipt
} from "lucide-react"

// Mock sales data for today
const todaySales = [
    { id: "TXN-001", time: "09:15 AM", items: 5, total: 45.99, payment: "Card", cashier: "Mike J." },
    { id: "TXN-002", time: "09:32 AM", items: 3, total: 23.50, payment: "Cash", cashier: "Mike J." },
    { id: "TXN-003", time: "10:05 AM", items: 8, total: 89.99, payment: "Card", cashier: "Sarah W." },
    { id: "TXN-004", time: "10:22 AM", items: 2, total: 15.00, payment: "Cash", cashier: "Mike J." },
    { id: "TXN-005", time: "10:45 AM", items: 12, total: 156.75, payment: "Card", cashier: "Sarah W." },
    { id: "TXN-006", time: "11:10 AM", items: 4, total: 34.25, payment: "Cash", cashier: "Mike J." },
    { id: "TXN-007", time: "11:33 AM", items: 6, total: 67.50, payment: "Card", cashier: "Sarah W." },
    { id: "TXN-008", time: "12:01 PM", items: 9, total: 112.00, payment: "Card", cashier: "Mike J." },
    { id: "TXN-009", time: "12:28 PM", items: 3, total: 28.99, payment: "Cash", cashier: "Sarah W." },
    { id: "TXN-010", time: "01:05 PM", items: 7, total: 78.50, payment: "Card", cashier: "Mike J." },
]

// Hourly breakdown
const hourlyData = [
    { hour: "9 AM", sales: 69.49, transactions: 2 },
    { hour: "10 AM", sales: 261.74, transactions: 3 },
    { hour: "11 AM", sales: 101.75, transactions: 2 },
    { hour: "12 PM", sales: 140.99, transactions: 2 },
    { hour: "1 PM", sales: 78.50, transactions: 1 },
]

export default function DailySalesPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSales()
    }, [selectedDate])

    const loadSales = async () => {
        setLoading(true)
        const res = await getTransactions() // In real app, pass date filter
        if (res.success) {
            // Filter by selected date locally for demo
            const filtered = (res.orders || []).filter((o: any) =>
                new Date(o.createdAt).toISOString().split('T')[0] === selectedDate
            )
            setTransactions(filtered)
        }
        setLoading(false)
    }

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, sale) => sum + sale.total, 0)
    const totalTransactions = transactions.length
    const totalItems = transactions.reduce((sum, sale) =>
        sum + sale.items.reduce((iSum: number, item: any) => iSum + item.quantity, 0), 0)
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const cardTotal = transactions.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0)
    const cashTotal = transactions.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Daily Sales</h2>
                    <p className="text-muted-foreground">Today's transactions and revenue breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-auto"
                    />
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={loadSales}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-green-600 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5% vs yesterday
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTransactions}</div>
                        <p className="text-xs text-green-600 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +3 vs yesterday
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                        <p className="text-xs text-muted-foreground">Across all transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${avgTransaction.toFixed(2)}</div>
                        <p className="text-xs text-red-600 flex items-center">
                            <ArrowDownRight className="h-3 w-3 mr-1" /> -2.3% vs yesterday
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Payment Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Today's revenue by payment type</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">Card Payments</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">${cardTotal.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{todaySales.filter(s => s.payment === 'Card').length} transactions</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                            <div className="flex items-center gap-3">
                                <Banknote className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Cash Payments</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">${cashTotal.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{todaySales.filter(s => s.payment === 'Cash').length} transactions</p>
                            </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="pt-2">
                            <p className="text-xs text-muted-foreground mb-2">Payment Distribution</p>
                            <div className="h-4 rounded-full bg-muted overflow-hidden flex">
                                <div className="bg-blue-500 h-full" style={{ width: `${(cardTotal / totalRevenue) * 100}%` }}></div>
                                <div className="bg-green-500 h-full" style={{ width: `${(cashTotal / totalRevenue) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                                <span className="text-blue-600">{((cardTotal / totalRevenue) * 100).toFixed(0)}% Card</span>
                                <span className="text-green-600">{((cashTotal / totalRevenue) * 100).toFixed(0)}% Cash</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hourly Breakdown */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Hourly Performance</CardTitle>
                        <CardDescription>Sales distribution throughout the day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {hourlyData.map((hour) => (
                                <div key={hour.hour} className="flex items-center gap-4">
                                    <span className="w-12 text-sm text-muted-foreground">{hour.hour}</span>
                                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                                        <div
                                            className="h-full bg-primary/80 rounded-lg flex items-center justify-end px-2"
                                            style={{ width: `${(hour.sales / 300) * 100}%` }}
                                        >
                                            <span className="text-xs text-primary-foreground font-medium">${hour.sales.toFixed(0)}</span>
                                        </div>
                                    </div>
                                    <span className="w-20 text-sm text-muted-foreground text-right">{hour.transactions} txns</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Complete list of today's sales</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Cashier</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading transactions...</TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions found for this date.</TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-mono text-sm">{sale.id.slice(0, 8)}</TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </TableCell>
                                        <TableCell>{sale.items.length}</TableCell>
                                        <TableCell className="font-semibold">${sale.total.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                sale.paymentMethod === 'card'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : 'bg-green-50 text-green-700 border-green-200'
                                            }>
                                                {sale.paymentMethod === 'card' ? <CreditCard className="h-3 w-3 mr-1" /> : <Banknote className="h-3 w-3 mr-1" />}
                                                {sale.paymentMethod}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{sale.customer?.name || "Guest"}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
