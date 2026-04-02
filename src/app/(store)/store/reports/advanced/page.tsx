"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText, Download, TrendingUp, TrendingDown,
    BarChart3, PieChart, Users, Zap, ShieldCheck,
    ArrowUpRight, ArrowDownRight, Printer, Mail,
    Calendar, Filter, Loader2, Sparkles, ChevronRight
} from "lucide-react"
import { generateReportData } from "@/app/actions/reports"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"

export default function AdvancedReportsPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [reportType, setReportType] = useState<any>('PROFIT_LOSS')
    const [reportData, setReportData] = useState<any>(null)

    useEffect(() => {
        fetchReport()
    }, [reportType])

    const fetchReport = async () => {
        setLoading(true)
        const res = await generateReportData(reportType, {
            dateRange: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }
        })
        if (res.success) setReportData(res.data)
        setLoading(false)
    }

    const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-500">
            {/* Intel Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 group cursor-pointer w-fit">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/70 group-hover:text-indigo-500 transition-colors">Enterprise Intel Hub</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900">Advanced Analytics</h1>
                    <p className="text-slate-500 font-medium text-lg">High-fidelity financial auditing and inventory velocity tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all gap-2">
                        <Calendar className="h-4 w-4" /> Last 30 Days
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl bg-slate-900 border-none text-white font-bold shadow-xl hover:bg-black transition-all hover:scale-105 active:scale-95 gap-2">
                        <Download className="h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>

            {/* Hub Tabs */}
            <Tabs defaultValue="PROFIT_LOSS" onValueChange={setReportType} className="space-y-8">
                <TabsList className="bg-transparent border-none p-0 h-auto gap-4 flex-wrap">
                    {[
                        { id: 'PROFIT_LOSS', label: 'Profit & Loss', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { id: 'SALES', label: 'Sales Velocity', icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                        { id: 'VELOCITY', label: 'Inventory Velocity', icon: Zap, color: 'text-rose-500', bg: 'bg-rose-50' },
                        { id: 'TAX', label: 'Tax Compliance', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50' },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="h-14 px-8 rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:ring-1 data-[state=active]:ring-slate-100 border-none font-bold text-sm transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${tab.bg} ${tab.color}`}>
                                    <tab.icon className="h-4 w-4" />
                                </div>
                                {tab.label}
                            </div>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="PROFIT_LOSS" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-100">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        </div>
                    ) : reportData && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-2xl shadow-indigo-100/30 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-2xl">
                                <CardHeader className="p-10 border-b border-slate-50">
                                    <CardTitle className="text-2xl font-black">Consolidated Income Statement</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">Real-time revenue and expenditure mapping.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10">
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Base Revenue</p>
                                                <p className="text-4xl font-black text-slate-900">{formatCurrency(reportData.revenue)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Net Operational Profit</p>
                                                <p className="text-4xl font-black text-emerald-600">{formatCurrency(reportData.netProfit)}</p>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-50">
                                            <Table>
                                                <TableHeader className="bg-slate-50/50 rounded-xl overflow-hidden">
                                                    <TableRow className="border-none">
                                                        <TableHead className="font-black text-[10px] uppercase text-slate-400 h-12">Category</TableHead>
                                                        <TableHead className="font-black text-[10px] uppercase text-slate-400 h-12 text-right">Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow className="border-slate-50">
                                                        <TableCell className="font-bold py-6">Cost of Goods Sold (COGS)</TableCell>
                                                        <TableCell className="text-right font-black text-rose-500">({formatCurrency(reportData.cogs)})</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-50">
                                                        <TableCell className="font-bold py-6">Tax Provisions (VAT/Sales Tax)</TableCell>
                                                        <TableCell className="text-right font-black text-slate-900">({formatCurrency(reportData.tax)})</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-50">
                                                        <TableCell className="font-bold py-6">Marketing & Discounts</TableCell>
                                                        <TableCell className="text-right font-black text-indigo-500">({formatCurrency(reportData.discounts)})</TableCell>
                                                    </TableRow>
                                                    <TableRow className="bg-emerald-50/30 border-none mt-4 rounded-xl">
                                                        <TableCell className="font-black py-8 text-lg">EBITDA Margin</TableCell>
                                                        <TableCell className="text-right font-black text-emerald-600 text-lg">
                                                            {((reportData.netProfit / reportData.revenue) * 100).toFixed(1)}%
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-8">
                                <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-600 p-8 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                        <Sparkles className="h-24 w-24" />
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <Badge className="bg-white/20 text-white border-none font-black text-[8px] tracking-[0.2em] uppercase px-3">AI Projection</Badge>
                                        <h3 className="text-xl font-black">Dynamic Growth Ahead</h3>
                                        <p className="text-sm font-medium text-indigo-100 opacity-80 leading-relaxed">
                                            Based on current {reportData.orderCount} transaction clusters, our neural engine predicts a 14.2% margin expansion for next quarter.
                                        </p>
                                        <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white font-black rounded-xl h-11">
                                            GENERATE SIMULATION
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-8 text-white">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500">Transaction Velocity</p>
                                            <h4 className="text-2xl font-black">High Frequency</h4>
                                        </div>
                                        <div className="p-3 bg-white/10 rounded-2xl">
                                            <TrendingUp className="h-5 w-5 text-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm font-bold opacity-80">
                                            <span>Average Basket Size</span>
                                            <span>{formatCurrency(reportData.revenue / reportData.orderCount)}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="w-[65%] h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                        </div>
                                        <p className="text-[10px] text-center font-bold text-slate-500 uppercase tracking-widest">Target: $85.00/order</p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="VELOCITY" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-100">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        </div>
                    ) : reportData && Array.isArray(reportData) && (
                        <Card className="border-none shadow-2xl shadow-rose-100/30 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-2xl">
                            <CardHeader className="p-10 border-b border-slate-50">
                                <CardTitle className="text-2xl font-black">Stock Depletion Forecasting</CardTitle>
                                <CardDescription className="text-slate-500 font-medium">Predictive analysis based on 30-day moving averages.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="font-black text-[10px] uppercase text-slate-400">Inventory Node</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase text-slate-400 text-center">Daily Velocity</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase text-slate-400 text-center">Days Remaining</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase text-slate-400 text-right">Supply Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item: any, idx: number) => (
                                            <TableRow key={idx} className="border-slate-50">
                                                <TableCell className="py-6 font-bold">{item.name}</TableCell>
                                                <TableCell className="py-6 text-center font-medium text-slate-500">{item.dailyVelocity} units/day</TableCell>
                                                <TableCell className="py-6 text-center font-black text-slate-900">{item.daysRemaining} Days</TableCell>
                                                <TableCell className="py-6 text-right">
                                                    <Badge className={item.status === 'CRITICAL' ? "bg-rose-500 text-white" : item.status === 'WARNING' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}>
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
