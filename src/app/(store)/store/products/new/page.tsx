"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowLeft, Sparkles, Save, Loader2, Package, DollarSign,
    Tag, FileText, Lightbulb, CheckCircle2, Barcode
} from "lucide-react"
import Link from "next/link"

export default function AddProductPage() {
    const router = useRouter()
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [productName, setProductName] = useState("")
    const [category, setCategory] = useState("")
    const [formData, setFormData] = useState({
        description: "",
        shortDescription: "",
        price: "",
        sku: "",
        barcode: "",
        stock: "",
        tags: "",
        storageInstructions: "",
        shelfLife: ""
    })
    const [aiSuggestions, setAiSuggestions] = useState<any>(null)

    const generateWithAI = async () => {
        if (!productName) {
            alert("Please enter a product name first")
            return
        }

        setIsGenerating(true)
        try {
            const res = await fetch('/api/ai/product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productName, category })
            })

            const data = await res.json()

            if (data.success) {
                setAiSuggestions(data.data)
                // Auto-fill form with AI suggestions
                setFormData({
                    description: data.data.description || "",
                    shortDescription: data.data.shortDescription || "",
                    price: data.data.suggestedPrice?.toString() || "",
                    sku: `SKU-${Date.now().toString().slice(-6)}`,
                    barcode: "",
                    stock: "100",
                    tags: data.data.tags?.join(", ") || "",
                    storageInstructions: data.data.storageInstructions || "",
                    shelfLife: data.data.shelfLife || ""
                })
                setCategory(data.data.category || category)
            } else {
                alert("Failed to generate. Please try again.")
            }
        } catch (error) {
            console.error(error)
            alert("Error generating product details")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        // In production, save to database
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
        alert("Product saved successfully!")
        router.push("/store/products")
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/store/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
                    <p className="text-muted-foreground">Use AI to auto-generate product details</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* AI Assistant Panel */}
                <Card className="lg:col-span-1 border-2 border-dashed border-purple-200 bg-purple-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <Sparkles className="h-5 w-5" />
                            AI Product Assistant
                        </CardTitle>
                        <CardDescription>
                            Enter a product name and let AI fill in the details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="aiProductName">Product Name</Label>
                            <Input
                                id="aiProductName"
                                placeholder="e.g., Organic Honey 500g"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aiCategory">Category (optional)</Label>
                            <Input
                                id="aiCategory"
                                placeholder="e.g., Pantry, Dairy..."
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={generateWithAI}
                            disabled={isGenerating || !productName}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate with AI
                                </>
                            )}
                        </Button>

                        {aiSuggestions && (
                            <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 text-green-600 mb-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">AI Suggestions Applied!</span>
                                </div>
                                {aiSuggestions.nutritionHighlights && (
                                    <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-1">Nutrition Highlights:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {aiSuggestions.nutritionHighlights.map((item: string, i: number) => (
                                                <span key={i} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Product Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                        <CardDescription>
                            {aiSuggestions ? "Review and edit AI-generated details" : "Fill in product information manually or use AI"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="Product name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Category"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shortDesc">Short Description</Label>
                            <Input
                                id="shortDesc"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                placeholder="Brief product description"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Full Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed product description..."
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="SKU-000000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Initial Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    placeholder="100"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="barcode">Barcode (Scan or Type)</Label>
                            <div className="relative">
                                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="barcode"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                    className="pl-9 pr-16"
                                    placeholder="Scan barcode..."
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs font-bold text-slate-500 hover:text-slate-900"
                                    onClick={() => document.getElementById('barcode')?.focus()}
                                >
                                    SCAN
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="organic, natural, healthy"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="storage">Storage Instructions</Label>
                                <Input
                                    id="storage"
                                    value={formData.storageInstructions}
                                    onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                                    placeholder="Store in cool, dry place"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shelfLife">Shelf Life</Label>
                                <Input
                                    id="shelfLife"
                                    value={formData.shelfLife}
                                    onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                                    placeholder="12 months"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Link href="/store/products">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                            <Button onClick={handleSave} disabled={isSaving || !productName || !formData.price}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Product
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
