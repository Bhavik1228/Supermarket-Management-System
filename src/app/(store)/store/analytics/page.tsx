"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStoreMetrics, getAIForecast } from "@/app/actions/analytics"
import { useState, useEffect } from "react"
import {
    BarChart3, TrendingUp, TrendingDown, DollarSign,
    ShoppingCart, Users, Package, Sparkles,
    BrainCircuit, Loader2, Info, Activity,
    Calendar, Filter, Download
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<any>(null)
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [categoryData, setCategoryData] = useState<any[]>([])
    const [aiData, setAiData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAILoading, setIsAILoading] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        const res = await getStoreMetrics()
        if (res.success) {
            setMetrics(res.metrics)
            setTopProducts(res.topProducts || [])
            setRevenueData(res.revenueData || [])
            setCategoryData(res.categoryData || [])
        }
        setIsLoading(false)
    }

    const handleAIForecast = async () => {
        setIsAILoading(true)
        const res = await getAIForecast()
        setIsAILoading(false)
        if (res.success) {
            setAiData(res)
        }
    }

    if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        Intelligence Hub <Activity className="h-8 w-8 text-indigo-600" />
                    </h2>
                    <p className="text-slate-500 font-medium">Deep performance metrics and neural forecasts for your enterprise.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl border-slate-200 h-12 px-6 font-bold gap-2">
                        <Calendar className="h-4 w-4" /> Last 14 Days
                    </Button>
                    <Button
                        className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 gap-2"
                        onClick={handleAIForecast}
                        disabled={isAILoading}
                    >
                        {isAILoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                        Generate AI Insight
                    </Button>
                </div>
            </div>

            {/* AI Insights Panel */}
            {aiData && (
                <Card className="border-none shadow-2xl bg-indigo-900 text-white overflow-hidden relative rounded-[2rem]">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="h-32 w-32" />
                    </div>
                    <CardHeader className="p-8">
                        <CardTitle className="flex items-center gap-3 text-2xl font-black">
                            <BrainCircuit className="h-6 w-6 text-indigo-400" />
                            Neural Projection: Next 7 Days
                        </CardTitle>
                        <CardDescription className="text-indigo-300 font-medium italic">Gemini-powered forecasting based on your transaction history</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-3xl bg-white/10 border border-white/10 space-y-2">
                            <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Revenue Forecast</p>
                            <p className="text-sm font-medium leading-relaxed">{aiData.prediction}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/10 border border-white/10 space-y-2">
                            <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Inventory Risks</p>
                            <p className="text-sm font-medium leading-relaxed">{aiData.risks}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/10 border border-white/10 space-y-2">
                            <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Strategic Campaign</p>
                            <p className="text-sm font-medium leading-relaxed">{aiData.campaign}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                {[
                    { title: "Total Revenue", value: `$${metrics?.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Real-time tracking" },
                    { title: "Total Orders", value: metrics?.totalOrders, icon: ShoppingCart, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Across all channels" },
                    { title: "Loyal Customers", value: metrics?.totalCustomers, icon: Users, color: "text-amber-600", bg: "bg-amber-50", desc: "Unique repeat shoppers" },
                    { title: "Units Sold", value: metrics?.totalProductsSold, icon: Package, color: "text-rose-600", bg: "bg-rose-50", desc: "Items distributed" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                            <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-emerald-500" /> {stat.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-6">
                    <CardHeader className="px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-800">Sales Trajectory</CardTitle>
                                <CardDescription className="text-slate-400 font-medium">Daily revenue overview</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                <Info className="h-4 w-4 text-slate-300" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                                    itemStyle={{ fontWeight: 800, color: '#6366f1' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-6">
                    <CardHeader className="px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-800">Category Share</CardTitle>
                                <CardDescription className="text-slate-400 font-medium">Revenue distribution by category</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                <Download className="h-4 w-4 text-slate-300" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 800 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Top Performers */}
            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-xl rounded-[2rem] bg-white">
                    <CardHeader>
                        <CardTitle className="text-xl font-black text-slate-800">High-Velocity Assets</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Highest revenue generators this cycle</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.length === 0 ? (
                                <p className="text-center text-slate-400 py-12 font-medium">No sales data available yet.</p>
                            ) : topProducts.map((product, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 border border-slate-100 group-hover:scale-110 transition-transform">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900">{product.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{product.quantity} units moved</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900">${product.revenue.toLocaleString()}</p>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase">Top Performer</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[2rem] bg-indigo-600 text-white p-8 space-y-6">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black">Velocity Report</h4>
                        <p className="text-indigo-100 font-medium mt-2 leading-relaxed">
                            Your checkout throughput is up **15%** compared to last weekend. Suggesting additional staff for peak hours (6 PM - 9 PM) to maintain customer satisfaction.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Button className="w-full h-14 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-black text-sm uppercase tracking-widest gap-2">
                            VIEW LIVE FEED <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
