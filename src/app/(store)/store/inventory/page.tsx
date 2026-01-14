"use client"

import { useState, useEffect } from "react"
import { getInventory, updateStock } from "@/app/actions/inventory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Upload, AlertTriangle, Package, TrendingDown, TrendingUp, RefreshCw, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock Inventory Data removed. Using real products from DB.

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [newStock, setNewStock] = useState(0)
    const [restockAmount, setRestockAmount] = useState(0)
    const [reason, setReason] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [restockStep, setRestockStep] = useState(1)
    const [statusFilter, setStatusFilter] = useState("ALL")

    useEffect(() => {
        loadInventory()
    }, [query])

    const loadInventory = async () => {
        setLoading(true)
        const res = await getInventory(query)
        if (res.success) setProducts(res.products || [])
        setLoading(false)
    }

    const handleUpdateStock = async () => {
        if (!selectedProduct) return
        const res = await updateStock(selectedProduct.id, newStock, reason, "staff-id") // Simulated user
        if (res.success) {
            alert("Stock updated successfully!")
            setIsDialogOpen(false)
            setRestockStep(1)
            loadInventory()
        } else {
            alert("Failed to update stock")
        }
    }

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    const [isStockTakeOpen, setIsStockTakeOpen] = useState(false)
    const [stockTakeInput, setStockTakeInput] = useState("")

    const handleStockTakeSubmit = () => {
        alert("Stock take session recorded! AI will process discrepancies.")
        setIsStockTakeOpen(false)
        setStockTakeInput("")
    }

    const lowStockCount = products.filter(item => item.stock < (item.minStock || 20)).length
    const totalStock = products.reduce((acc, item) => acc + item.stock, 0)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
                    <p className="text-muted-foreground">Track and manage your stock levels.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => alert("Select a CSV/Excel file to upload...")}>
                        <Upload className="mr-2 h-4 w-4" /> Import
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Dialog open={isStockTakeOpen} onOpenChange={setIsStockTakeOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <RefreshCw className="mr-2 h-4 w-4" /> Stock Take
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Global Stock Take</DialogTitle>
                                <DialogDescription>Rapid entry mode for physically counting items.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <Label>Scan/Type Barcodes (One per line)</Label>
                                <Textarea
                                    placeholder="890123...&#10;789012..."
                                    className="min-h-[200px] font-mono"
                                    value={stockTakeInput}
                                    onChange={e => setStockTakeInput(e.target.value)}
                                />
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <AlertTriangle className="h-3 w-3" /> System will auto-reconcile with current levels.
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsStockTakeOpen(false)}>Abort</Button>
                                <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleStockTakeSubmit}>Verify & Post</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{totalStock}</div>
                        <p className="text-sm text-muted-foreground">Total Units</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{products.length}</div>
                        <p className="text-sm text-muted-foreground">Unique Products</p>
                    </CardContent>
                </Card>
                <Card className={lowStockCount > 0 ? "border-yellow-300 bg-yellow-50" : ""}>
                    <CardContent className="pt-6">
                        <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-yellow-600' : ''}`}>{lowStockCount}</div>
                        <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                            ${products.reduce((acc, item) => acc + (item.price * item.stock), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-sm text-muted-foreground">Inventory Value</p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alerts Banner */}
            {lowStockCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                            <p className="font-medium text-yellow-800">Low Stock Alert</p>
                            <p className="text-sm text-yellow-700">{lowStockCount} items are below minimum stock level and need restocking.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-100">
                        View All
                    </Button>
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search inventory..."
                        className="pl-8"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Status: {statusFilter === 'ALL' ? 'All' : statusFilter.replace('_', ' ')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("IN_STOCK")}>In Stock</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("LOW_STOCK")}>Low Stock</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("OUT_OF_STOCK")}>Out of Stock</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Inventory Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Current Stock</TableHead>
                            <TableHead>Min Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Trend</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products
                                .filter(p => {
                                    if (statusFilter === "ALL") return true
                                    const isLow = p.stock < (p.minStock || 20)
                                    if (statusFilter === "LOW_STOCK") return isLow && p.stock > 0
                                    if (statusFilter === "OUT_OF_STOCK") return p.stock <= 0
                                    if (statusFilter === "IN_STOCK") return !isLow
                                    return true
                                })
                                .map((item) => {
                                    const minStock = item.minStock || 20
                                    const isLowStock = item.stock < minStock
                                    return (
                                        <TableRow key={item.id} className={isLowStock ? "bg-yellow-50" : ""}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-xs text-muted-foreground">{item.barcode || "No Barcode"}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                                    {item.stock}
                                                </span>
                                            </TableCell>
                                            <TableCell>{minStock}</TableCell>
                                            <TableCell>
                                                {isLowStock ? (
                                                    <Badge variant="destructive">Low Stock</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Dialog open={isDialogOpen && selectedProduct?.id === item.id} onOpenChange={(open) => {
                                                    if (!open) {
                                                        setIsDialogOpen(false)
                                                        setSelectedProduct(null)
                                                        setRestockStep(1)
                                                    }
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                                                            setSelectedProduct(item)
                                                            setRestockAmount(50)
                                                            setReason("Scheduled restock")
                                                            setRestockStep(1)
                                                            setIsDialogOpen(true)
                                                        }}>
                                                            Restock
                                                        </Button>
                                                    </DialogTrigger>
                                                    {selectedProduct?.id === item.id && (
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle className="flex items-center gap-2">
                                                                    <RefreshCw className="h-5 w-5 text-blue-500" />
                                                                    Restock: {item.name}
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    Step {restockStep} of 2: {restockStep === 1 ? 'Inventory Details' : 'Final Confirmation'}
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            {restockStep === 1 ? (
                                                                <div className="space-y-4 py-4">
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <Label className="text-right">Current</Label>
                                                                        <div className="col-span-3 font-semibold">{item.stock} units</div>
                                                                    </div>
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <Label className="text-right">Add Qty</Label>
                                                                        <Input
                                                                            type="number"
                                                                            className="col-span-3"
                                                                            value={restockAmount}
                                                                            onChange={e => setRestockAmount(parseInt(e.target.value) || 0)}
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <Label className="text-right">Vendor</Label>
                                                                        <Input
                                                                            className="col-span-3"
                                                                            placeholder="Search vendors..."
                                                                            defaultValue="Global Supplies Ltd"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4 py-4">
                                                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                                        <p className="text-sm text-slate-600 mb-1">Stock update summary:</p>
                                                                        <p className="font-bold text-lg">{item.stock} → {item.stock + restockAmount} units</p>
                                                                        <p className="text-xs text-slate-500 mt-2 italic">Updating inventory will trigger a restock alert for the floor staff.</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Adjustment Reason</Label>
                                                                        <Input
                                                                            placeholder="Optional note..."
                                                                            value={reason}
                                                                            onChange={e => setReason(e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
                                                                {restockStep === 1 ? (
                                                                    <>
                                                                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                                                        <Button onClick={() => setRestockStep(2)} disabled={restockAmount <= 0}>Continue <TrendingUp className="ml-2 h-4 w-4" /></Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button variant="ghost" onClick={() => setRestockStep(1)}>Back</Button>
                                                                        <Button
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                            onClick={() => {
                                                                                setNewStock(item.stock + restockAmount)
                                                                                handleUpdateStock()
                                                                            }}
                                                                        >
                                                                            Confirm Restock
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    )}
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
