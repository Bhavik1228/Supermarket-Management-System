"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Sparkles, Loader2, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle2, Package, BarChart3, ArrowRight, RefreshCw, Lightbulb
} from "lucide-react"

// Mock inventory items
const inventoryItems = [
    { id: "1", name: "Organic Apples", currentStock: 45, avgDailySales: 12, category: "Fruits", lastRestock: "2024-12-01" },
    { id: "2", name: "Whole Milk 1L", currentStock: 23, avgDailySales: 15, category: "Dairy", lastRestock: "2024-12-05" },
    { id: "3", name: "Bread Loaf", currentStock: 8, avgDailySales: 20, category: "Bakery", lastRestock: "2024-12-07" },
    { id: "4", name: "Free Range Eggs", currentStock: 120, avgDailySales: 8, category: "Dairy", lastRestock: "2024-12-03" },
    { id: "5", name: "Orange Juice 1L", currentStock: 34, avgDailySales: 6, category: "Beverages", lastRestock: "2024-12-02" },
]

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
    const [selectedItem, setSelectedItem] = useState<typeof inventoryItems[0] | null>(null)
    const [prediction, setPrediction] = useState<Prediction | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const analyzItem = async (item: typeof inventoryItems[0]) => {
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
                        {inventoryItems.map((item) => (
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
                        ))}
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
