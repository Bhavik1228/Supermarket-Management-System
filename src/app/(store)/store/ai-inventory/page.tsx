"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Sparkles, Loader2, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle2, Package, BarChart3, ArrowRight, RefreshCw, Lightbulb
} from "lucide-react"

import { getAIInventoryData } from "@/app/actions/inventory-ai"

interface Prediction {
    daysUntilStockout: number
    recommendedReorderPoint: number
    recommendedOrderQuantity: number
    riskLevel: "LOW" | "MEDIUM" | "HIGH"
    insights: string[]
    seasonalTrend: string
    recommendation: string
}

export default function AIInventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<any | null>(null)
    const [prediction, setPrediction] = useState<Prediction | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const storeId = "store-freshmart"

    useEffect(() => {
        loadProductionData()
    }, [])

    async function loadProductionData() {
        setIsLoading(true)
        const res = await getAIInventoryData(storeId)
        if (res.success && res.inventoryData) {
            setInventoryItems(res.inventoryData)
        }
        setIsLoading(false)
    }

    const analyzItem = async (item: any) => {
        setSelectedItem(item)
        setIsAnalyzing(true)
        setPrediction(null)

        try {
            const res = await fetch('/api/ai/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: item.name,
                    currentStock: item.currentStock,
                    avgDailySales: item.avgDailySales,
                    category: item.category,
                    lastRestockDate: item.lastRestock
                })
            })

            const data = await res.json()
            if (data.success) {
                setPrediction(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const riskColors = {
        LOW: "bg-green-100 text-green-800 border-green-200",
        MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
        HIGH: "bg-red-100 text-red-800 border-red-200"
    }

    const riskIcons = {
        LOW: <CheckCircle2 className="h-4 w-4" />,
        MEDIUM: <AlertTriangle className="h-4 w-4" />,
        HIGH: <AlertTriangle className="h-4 w-4" />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-purple-600" />
                        AI Inventory Predictor
                    </h2>
                    <p className="text-muted-foreground">Get AI-powered insights and reorder recommendations</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Product List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select Product to Analyze</CardTitle>
                        <CardDescription>Click on any product to get AI predictions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : inventoryItems.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No products found in inventory.
                            </div>
                        ) : (
                            inventoryItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => analyzItem(item)}
                                    className={`w-full p-4 rounded-lg border text-left transition-all hover:border-purple-300 hover:bg-purple-50/50 ${selectedItem?.id === item.id ? 'border-purple-500 bg-purple-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{item.currentStock} units</p>
                                            <p className="text-xs text-muted-foreground">~{item.avgDailySales}/day</p>
                                        </div>
                                    </div>
                                    {selectedItem?.id === item.id && isAnalyzing && (
                                        <div className="mt-2 flex items-center gap-2 text-purple-600">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">Analyzing with AI...</span>
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* AI Prediction Results */}
                <Card className="border-2 border-purple-200">
                    <CardHeader className="bg-purple-50">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            AI Analysis
                        </CardTitle>
                        <CardDescription>
                            {selectedItem ? `Predictions for ${selectedItem.name}` : 'Select a product to analyze'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {!selectedItem && (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>Select a product from the list</p>
                                    <p className="text-sm">to get AI-powered predictions</p>
                                </div>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
                                    <p className="font-medium">AI is analyzing...</p>
                                    <p className="text-sm text-muted-foreground">Crunching sales data and patterns</p>
                                </div>
                            </div>
                        )}

                        {prediction && !isAnalyzing && (
                            <div className="space-y-4">
                                {/* Risk Level Badge */}
                                <div className="flex items-center gap-3">
                                    <Badge className={`${riskColors[prediction.riskLevel]} text-sm px-3 py-1`}>
                                        {riskIcons[prediction.riskLevel]}
                                        <span className="ml-1">{prediction.riskLevel} RISK</span>
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Trend: {prediction.seasonalTrend === 'increasing' ? '📈' : prediction.seasonalTrend === 'decreasing' ? '📉' : '➡️'} {prediction.seasonalTrend}
                                    </span>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted">
                                        <p className="text-xs text-muted-foreground">Days Until Stockout</p>
                                        <p className="text-2xl font-bold">{prediction.daysUntilStockout}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted">
                                        <p className="text-xs text-muted-foreground">Reorder Point</p>
                                        <p className="text-2xl font-bold">{prediction.recommendedReorderPoint} units</p>
                                    </div>
                                </div>

                                {/* Recommended Order */}
                                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                                    <p className="text-sm font-medium text-purple-700 mb-1">Recommended Order Quantity</p>
                                    <p className="text-3xl font-bold text-purple-800">{prediction.recommendedOrderQuantity} units</p>
                                </div>

                                {/* Recommendation */}
                                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                    <div className="flex items-start gap-2">
                                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-800">AI Recommendation</p>
                                            <p className="text-sm text-blue-700">{prediction.recommendation}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Insights */}
                                {prediction.insights && prediction.insights.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Key Insights:</p>
                                        <ul className="space-y-1">
                                            {prediction.insights.map((insight, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5" />
                                                    <span>{insight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Button className="w-full mt-4" variant="outline" onClick={() => analyzItem(selectedItem!)}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Re-analyze
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
