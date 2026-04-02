"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Sparkles, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import { getProducts } from "@/app/actions/pos"
import { discoverNewProducts } from "@/app/actions/ai_discovery"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAILoading, setIsAILoading] = useState(false)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [isAIModalOpen, setIsAIModalOpen] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        async function load() {
            const res = await getProducts()
            if (res.success) {
                setProducts(res.products || [])
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            }
            setIsLoading(false)
        }
        load()
    }, [])

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.includes(searchQuery) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">Manage your store's product catalog.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={async () => {
                            setIsAILoading(true)
                            const res = await discoverNewProducts()
                            setIsAILoading(false)
                            if (res.success) {
                                setSuggestions(res.suggestions || [])
                                setIsAIModalOpen(true)
                            } else {
                                toast({ title: "AI Error", description: "Failed to generate suggestions", variant: "destructive" })
                            }
                        }}
                        disabled={isAILoading}
                    >
                        {isAILoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-500" /> : <Sparkles className="mr-2 h-4 w-4 text-purple-500" />}
                        AI Generate
                    </Button>
                    <Link href="/store/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{products.length}</div>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-sm text-muted-foreground">Categories</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">2</div>
                        <p className="text-sm text-muted-foreground">Low Stock</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">0</div>
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline">All Categories</Button>
            </div>

            {/* Products Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Barcode</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <span className="font-medium">{product.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-medium">
                                        {product.category}
                                    </span>
                                </TableCell>
                                <TableCell className="font-semibold">${product.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <span className={`${product.stock < 40 ? 'text-yellow-600' : 'text-green-600'} font-medium`}>
                                        {product.stock}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{product.barcode}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* AI Suggestions Modal */}
            <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
                <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-purple-400" />
                            Market Intel: AI Discovery
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Based on your current catalog, AI suggests these high-potential additions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        {suggestions.map((s, i) => (
                            <Card key={i} className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">{s.name}</h4>
                                            <Badge variant="outline" className="text-[8px] border-purple-500/30 text-purple-400">{s.category}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 max-w-sm">{s.reason}</p>
                                        <div className="flex gap-4 mt-2">
                                            <span className="text-[10px] font-mono text-green-400">EST PRICE: ${s.estimatedPrice}</span>
                                            <span className="text-[10px] font-mono text-slate-500 uppercase">AUDIENCE: {s.targetAudience}</span>
                                        </div>
                                    </div>
                                    <Button size="sm" className="bg-white text-slate-950 hover:bg-slate-200">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
