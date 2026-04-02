"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getFinancialReports } from "@/app/actions/accounting"
import { Loader2, Download, Printer, TrendingUp, TrendingDown, DollarSign, Wallet, Building2 } from "lucide-react"

export default function AccountingReportsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const storeId = "store-freshmart"

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const res = await getFinancialReports(storeId)
        if (res.success) {
            setData(res)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
                    <p className="text-muted-foreground">Detailed Profit & Loss and Balance Sheet statements.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Print PDF
                    </Button>
                    <Button>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="pl" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
                    <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
                </TabsList>

                <TabsContent value="pl" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.pl.totalIncome.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.pl.totalExpenses.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card className={data.pl.netIncome >= 0 ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                                <DollarSign className={`h-4 w-4 ${data.pl.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${data.pl.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${data.pl.netIncome.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Income & Expense Statement</CardTitle>
                            <CardDescription>Fiscal summary for the current period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-semibold mb-4 text-green-700 underline underline-offset-4">Income</h3>
                                    <Table>
                                        <TableBody>
                                            {data.pl.income.map((acc: any) => (
                                                <TableRow key={acc.id}>
                                                    <TableCell>{acc.code} - {acc.name}</TableCell>
                                                    <TableCell className="text-right font-mono">${acc.balance.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="font-bold bg-muted/50">
                                                <TableCell>Total Income</TableCell>
                                                <TableCell className="text-right">${data.pl.totalIncome.toLocaleString()}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-4 text-red-700 underline underline-offset-4">Expenses</h3>
                                    <Table>
                                        <TableBody>
                                            {data.pl.expenses.map((acc: any) => (
                                                <TableRow key={acc.id}>
                                                    <TableCell>{acc.code} - {acc.name}</TableCell>
                                                    <TableCell className="text-right font-mono">${acc.balance.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="font-bold bg-muted/50">
                                                <TableCell>Total Expenses</TableCell>
                                                <TableCell className="text-right">${data.pl.totalExpenses.toLocaleString()}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex justify-between items-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                                    <span className="text-lg font-bold">Net Income</span>
                                    <span className={`text-2xl font-black ${data.pl.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${data.pl.netIncome.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bs" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Assets</CardTitle>
                                <Wallet className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.balanceSheet.totalAssets.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
                                <Building2 className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.balanceSheet.totalLiabilities.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Equity</CardTitle>
                                <DollarSign className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.balanceSheet.totalEquity.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Sheet</CardTitle>
                            <CardDescription>Snapshot of financial position as of today.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Left Side: Assets */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-bold text-lg mb-2 text-blue-800">Assets</h3>
                                            <Table>
                                                <TableBody>
                                                    {data.balanceSheet.assets.map((acc: any) => (
                                                        <TableRow key={acc.id}>
                                                            <TableCell>{acc.name}</TableCell>
                                                            <TableCell className="text-right font-mono">${acc.balance.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow className="font-bold bg-blue-50">
                                                        <TableCell>Total Assets</TableCell>
                                                        <TableCell className="text-right">${data.balanceSheet.totalAssets.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Right Side: Liabilities & Equity */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-bold text-lg mb-2 text-orange-800">Liabilities</h3>
                                            <Table>
                                                <TableBody>
                                                    {data.balanceSheet.liabilities.map((acc: any) => (
                                                        <TableRow key={acc.id}>
                                                            <TableCell>{acc.name}</TableCell>
                                                            <TableCell className="text-right font-mono">${acc.balance.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow className="font-bold bg-orange-50">
                                                        <TableCell>Total Liabilities</TableCell>
                                                        <TableCell className="text-right">${data.balanceSheet.totalLiabilities.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-lg mb-2 text-purple-800">Equity</h3>
                                            <Table>
                                                <TableBody>
                                                    {data.balanceSheet.equity.map((acc: any) => (
                                                        <TableRow key={acc.id}>
                                                            <TableCell>{acc.name}</TableCell>
                                                            <TableCell className="text-right font-mono">${acc.balance.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow className="font-bold bg-purple-50">
                                                        <TableCell>Total Equity</TableCell>
                                                        <TableCell className="text-right">${data.balanceSheet.totalEquity.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className={`p-4 rounded-lg border-2 ${Math.abs(data.balanceSheet.totalAssets - (data.balanceSheet.totalLiabilities + data.balanceSheet.totalEquity)) < 1 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                            <div className="flex justify-between items-center font-bold">
                                                <span>Total Liabilities + Equity</span>
                                                <span>${(data.balanceSheet.totalLiabilities + data.balanceSheet.totalEquity).toLocaleString()}</span>
                                            </div>
                                            {Math.abs(data.balanceSheet.totalAssets - (data.balanceSheet.totalLiabilities + data.balanceSheet.totalEquity)) < 1 && (
                                                <p className="text-[10px] text-green-600 font-bold uppercase mt-1">✓ Balance Sheet Balanced</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
