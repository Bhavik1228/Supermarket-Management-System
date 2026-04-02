"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    ShoppingCart, Search, Plus, Minus, Trash2, CreditCard,
    Banknote, Receipt as ReceiptIcon, Barcode, X, Check, User, RotateCcw, Eye
} from "lucide-react"
import { CustomerSelect } from "@/components/pos/CustomerSelect"
import { createOrderWithLoyalty, getProducts } from "@/app/actions/pos"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useReactToPrint } from "react-to-print"
import { Receipt } from "@/components/pos/Receipt"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

// Mock content removed


export default function POSPage() {
    const router = useRouter()

    // Redirect Store Owners to Executive Terminal automatically
    useEffect(() => {
        // In a real app, check session role. Here we simulate for the hardcoded Owner.
        const userRole = "STORE_OWNER"
        if (userRole === "STORE_OWNER") {
            router.replace("/store/owner-pos")
        }
    }, [router])

    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [barcodeInput, setBarcodeInput] = useState("")
    const [showCheckout, setShowCheckout] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null)


    const [cashReceived, setCashReceived] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string, name: string, email: string, points?: number } | null>(null)
    const [products, setProducts] = useState<any[]>([])

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, itemId: string | null }>({ isOpen: false, itemId: null })

    // Store settings (should be fetched from API/Context in real app)
    const [storeSettings] = useState({
        name: "Fresh Mart Code Store", // Example dynamic name
        address: "42 Developer Avenue, Tech City",
        phone: "+1 (555) 987-6543"
    })

    // Receipt Printing and Viewing
    const [lastOrder, setLastOrder] = useState<any>(null)
    const [showReceiptDialog, setShowReceiptDialog] = useState(false)
    const receiptRef = useRef<HTMLDivElement>(null)
    const reactToPrintFn = useReactToPrint({
        contentRef: receiptRef,
    })

    const handlePrint = () => {
        if (receiptRef.current) {
            reactToPrintFn()
        } else {
            console.error("Receipt Ref is null")
        }
    }

    useEffect(() => {
        getProducts().then(res => {
            if (res.success) setProducts(res.products || [])
        })
    }, [])

    const pointsToEarn = Math.floor(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)) // SIMPLE RULE: 1 point per $1

    const addToCart = (product: any) => {
        if (product.stock <= 0) {
            alert("Item is out of stock!")
            return
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                if (existing.quantity >= product.stock) {
                    alert("No more stock available!")
                    return prev
                }
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
        })
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta
                return newQty > 0 ? { ...item, quantity: newQty } : item
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const requestDelete = (id: string) => {
        setDeleteConfirm({ isOpen: true, itemId: id })
    }

    const confirmDelete = () => {
        if (deleteConfirm.itemId) {
            setCart(prev => prev.filter(item => String(item.id) !== String(deleteConfirm.itemId)))
            setDeleteConfirm({ isOpen: false, itemId: null })
        }
    }

    const handleBarcodeScan = () => {
        const product = products.find(p => p.barcode === barcodeInput)
        if (product) {
            addToCart(product)
            setBarcodeInput("")
        } else {
            alert("Product not found!")
        }
    }

    const [redeemedPoints, setRedeemedPoints] = useState(0)

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax
    const discount = redeemedPoints / 100 // 100 points = $1
    const total = Math.max(0, subtotal + tax - discount)
    const change = cashReceived ? parseFloat(cashReceived) - total : 0

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const completeSale = async () => {
        const saleDetails = {
            items: cart,
            total,
            subtotal,
            tax,
            paymentMethod: paymentMethod!,
            customerId: selectedCustomer?.id,
            pointsEarned: selectedCustomer ? pointsToEarn : 0,
            redeemedPoints: redeemedPoints,
            discountAmount: discount
        }

        console.log("Processing Sale:", saleDetails)

        try {
            const res = await createOrderWithLoyalty(saleDetails)

            if (res.success && res.order) {
                // Prepare data for receipt
                const orderForReceipt = {
                    id: res.order.id,
                    items: cart,
                    total,
                    subtotal,
                    tax,
                    paymentMethod: paymentMethod!,
                    customer: selectedCustomer ? {
                        name: selectedCustomer.name,
                        pointsEarned: pointsToEarn
                    } : undefined
                }

                setLastOrder(orderForReceipt)
                setShowReceiptDialog(true) // Open Dialog instead of auto-print

                // Reset State
                setCart([])
                setShowCheckout(false)
                setPaymentMethod(null)
                setCashReceived("")
                setSelectedCustomer(null)
                setRedeemedPoints(0)

                // alert("Sale Complete! Printing Receipt...") // Optional: Remove alert if auto-printing
                // Refresh product list to update stock counts
                getProducts().then(res => {
                    if (res.success) setProducts(res.products || [])
                })
            } else {
                alert("Transaction Failed: " + (res.error || "Unknown error"))
            }
        } catch (e: any) {
            console.error(e)
            alert("Transaction Failed: " + (e.message || "An unexpected error occurred."))
        }
    }

    return (
        <>
            <div className="h-[calc(100vh-4rem)] flex gap-4 animate-in fade-in duration-500">
                {/* Left Panel - Products */}
                <div className="flex-1 flex flex-col">
                    {/* Barcode Scanner */}
                    <Card className="mb-4">
                        <CardContent className="py-3">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Barcode className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Scan barcode or enter manually..."
                                        className="pl-10 text-lg"
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
                                    />
                                </div>
                                <Button onClick={handleBarcodeScan}>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Receipt Viewer Dialog */}
                    <div className="absolute top-4 right-4">
                        <Button variant="outline" size="sm" onClick={() => {
                            // Dummy order for preview
                            const dummyOrder = {
                                id: "PREVIEW-001",
                                items: cart.length > 0 ? cart : [{ name: "Sample Item", quantity: 1, price: 10.00 }],
                                total: cart.length > 0 ? total : 11.00,
                                subtotal: cart.length > 0 ? subtotal : 10.00,
                                tax: cart.length > 0 ? tax : 1.00,
                                paymentMethod: "cash",
                                customer: selectedCustomer || { name: "John Doe", pointsEarned: 10 }
                            }
                            setLastOrder(dummyOrder)
                            setShowReceiptDialog(true)
                        }}>
                            <Eye className="mr-2 h-4 w-4" /> Receipt Template
                        </Button>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all text-left"
                                >
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                                        <ShoppingCart className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="font-medium truncate">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.category} • {product.stock} in stock</p>
                                    <p className="text-lg font-bold text-primary mt-1">${product.price.toFixed(2)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Cart */}
                <Card className="w-96 flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Current Sale
                            </CardTitle>
                            <Badge variant="outline">{cart.length} items</Badge>
                        </div>
                        <div className="mt-4">
                            <CustomerSelect
                                selectedCustomer={selectedCustomer}
                                onSelect={setSelectedCustomer}
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                        {/* Cart Items */}
                        <div className="flex-1 overflow-auto space-y-2 mb-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Cart is empty</p>
                                        <p className="text-xs">Scan or select products</p>
                                    </div>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-7 w-7"
                                                onClick={() => updateQuantity(item.id, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-7 w-7"
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-red-500"
                                                onClick={() => requestDelete(item.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Totals */}
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (10%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            {selectedCustomer && (
                                <div className="flex justify-between text-sm text-amber-600 font-medium bg-amber-50 p-1 rounded">
                                    <span>Loyalty Points</span>
                                    <span>+{pointsToEarn} pts</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold border-t pt-2">
                                <span>Total</span>
                                <span className="text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Checkout Panel */}
                        {!showCheckout ? (
                            <Button
                                className="w-full mt-4 h-14 text-lg"
                                disabled={cart.length === 0}
                                onClick={() => setShowCheckout(true)}
                            >
                                <CreditCard className="mr-2 h-5 w-5" />
                                Checkout
                            </Button>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <p className="font-medium text-center">Select Payment Method</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                                        className="h-12"
                                        onClick={() => setPaymentMethod('cash')}
                                    >
                                        <Banknote className="mr-2 h-5 w-5" /> Cash
                                    </Button>
                                    <Button
                                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                        className="h-12"
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <CreditCard className="mr-2 h-5 w-5" /> Card
                                    </Button>
                                </div>

                                {/* Loyalty Redemption UI */}
                                {selectedCustomer && (selectedCustomer.points || 0) > 0 && (
                                    <div className="bg-amber-50 p-3 rounded border border-amber-200 space-y-2">
                                        <div className="flex justify-between text-sm text-amber-800 font-medium">
                                            <span>Available Points</span>
                                            <span>{selectedCustomer.points} pts (${((selectedCustomer.points || 0) / 100).toFixed(2)})</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="number"
                                                placeholder="Points to redeem"
                                                value={redeemedPoints > 0 ? redeemedPoints : ""}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0
                                                    // Limit to max points and ensuring total >= 0 (simple check)
                                                    if (val <= (selectedCustomer.points || 0)) {
                                                        setRedeemedPoints(val)
                                                    }
                                                }}
                                                className="h-9 bg-white"
                                            />
                                            <Button size="sm" variant="secondary" onClick={() => setRedeemedPoints(selectedCustomer.points || 0)}>
                                                Max
                                            </Button>
                                        </div>
                                        {redeemedPoints > 0 && (
                                            <div className="text-right text-green-600 text-sm font-bold">
                                                Discount: -${discount.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {paymentMethod === 'cash' && (
                                    <div className="space-y-2">
                                        <Input
                                            type="number"
                                            placeholder="Cash received..."
                                            value={cashReceived}
                                            onChange={(e) => setCashReceived(e.target.value)}
                                            className="text-lg h-12"
                                        />
                                        {parseFloat(cashReceived) >= total && (
                                            <div className="text-center py-2 bg-green-50 rounded-lg border border-green-200">
                                                <span className="text-green-700 font-bold">Change: ${change.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={() => {
                                        setShowCheckout(false)
                                        setPaymentMethod(null)
                                        setCashReceived("")
                                    }}>
                                        <X className="mr-2 h-4 w-4" /> Cancel
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={
                                            !paymentMethod ||
                                            (paymentMethod === 'cash' && parseFloat(cashReceived) < total)
                                        }
                                        onClick={completeSale}
                                    >
                                        <Check className="mr-2 h-4 w-4" /> Complete
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* Receipt Viewer Dialog */}
            <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Receipt Preview</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto border p-2 rounded bg-white flex justify-center">
                        {/* We render the receipt visible here for preview AND printing */}
                        {lastOrder && <Receipt ref={receiptRef} order={lastOrder} store={storeSettings} />}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>Close</Button>
                        <Button onClick={handlePrint}>
                            <ReceiptIcon className="mr-2 h-4 w-4" /> Print Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirm.isOpen} onOpenChange={(open) => !open && setDeleteConfirm({ isOpen: false, itemId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Item</DialogTitle>
                        <div className="py-4">
                            Are you sure you want to remove this item from the cart?
                        </div>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm({ isOpen: false, itemId: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
