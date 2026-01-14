"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStoreMetrics, getAIForecast } from "@/app/actions/analytics"
import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Sparkles, BrainCircuit, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<any>(null)
    const [topProducts, setTopProducts] = useState<any[]>([])
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
            setTopProducts(res.topProducts)
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Intelligence Hub</h2>
                    <p className="text-muted-foreground">Deep performance metrics and neural forecasts.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={handleAIForecast}
                        disabled={isAILoading}
                    >
                        {isAILoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                        Generate AI Forecast
                    </Button>
                </div>
            </div>

            {/* AI Insights Panel */}
            {aiData && (
                <Card className="border-2 border-purple-500/20 bg-purple-50/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="h-24 w-24 text-purple-600" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <Sparkles className="h-5 w-5" />
                            Neural Projection: Next 7 Days
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Revenue Forecast</p>
                            <p className="text-sm font-medium">{aiData.prediction}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Inventory Risks</p>
                            <p className="text-sm font-medium">{aiData.risks}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Recommended Campaign</p>
                            <p className="text-sm font-medium">{aiData.campaign}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics?.totalRevenue?.toLocaleString()}</div>
                        <p className="text-xs text-green-600 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> Real-time tracking
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalOrders}</div>
                        <p className="text-xs text-green-600 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> Orders across all channels
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Loyal Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalCustomers}</div>
                        <p className="text-xs text-green-600 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> Unique repeat shoppers
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Items Distributed</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalProductsSold}</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <Package className="h-3 w-3 mr-1" /> Units moved
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Monthly sales performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                                <p>Sales Chart</p>
                                <p className="text-xs">(Chart integration coming soon)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performance Assets</CardTitle>
                        <CardDescription>Highest revenue generators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No sales data available yet.</p>
                            ) : topProducts.map((product, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-muted-foreground font-mono w-6">#{i + 1}</span>
                                        <span className="font-medium">{product.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${product.revenue.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">{product.quantity} units</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
