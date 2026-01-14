"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    ShoppingCart, Search, Plus, Minus, Trash2, CreditCard,
    Banknote, Barcode, X, Check, LogOut
} from "lucide-react"
import Link from "next/link"

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

// Mock Products
const products = [
    { id: "1", name: "Organic Apples", price: 4.99, barcode: "1234567890123", category: "Fruits" },
    { id: "2", name: "Whole Milk 1L", price: 2.49, barcode: "1234567890124", category: "Dairy" },
    { id: "3", name: "Bread Loaf", price: 3.29, barcode: "1234567890125", category: "Bakery" },
    { id: "4", name: "Free Range Eggs", price: 5.99, barcode: "1234567890126", category: "Dairy" },
    { id: "5", name: "Orange Juice 1L", price: 3.99, barcode: "1234567890127", category: "Beverages" },
    { id: "6", name: "Cheddar Cheese", price: 6.49, barcode: "1234567890128", category: "Dairy" },
    { id: "7", name: "Bananas", price: 1.99, barcode: "1234567890129", category: "Fruits" },
    { id: "8", name: "Greek Yogurt", price: 4.29, barcode: "1234567890130", category: "Dairy" },
]

export default function StaffPOSPage() {
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [barcodeInput, setBarcodeInput] = useState("")
    const [showCheckout, setShowCheckout] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null)
    const [cashReceived, setCashReceived] = useState("")
    const [staffName] = useState("Mike Johnson")

    const addToCart = (product: typeof products[0]) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
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

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
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

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax
    const change = cashReceived ? parseFloat(cashReceived) - total : 0

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const completeSale = () => {
        alert(`Sale completed!\nTotal: $${total.toFixed(2)}\nCashier: ${staffName}`)
        setCart([])
        setShowCheckout(false)
        setPaymentMethod(null)
        setCashReceived("")
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 rounded-lg mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Fresh Mart - POS Terminal</h1>
                    <p className="text-sm opacity-90">Cashier: {staffName}</p>
                </div>
                <Link href="/login">
                    <Button variant="secondary" size="sm">
                        <LogOut className="mr-2 h-4 w-4" /> End Shift
                    </Button>
                </Link>
            </div>

            <div className="flex gap-4 h-[calc(100vh-140px)]">
                {/* Products */}
                <div className="flex-1 flex flex-col bg-white rounded-lg p-4">
                    {/* Barcode */}
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Barcode className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Scan barcode..."
                                className="pl-10 text-lg h-12"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-3 rounded-lg border-2 bg-white hover:border-primary hover:bg-primary/5 transition-all text-left"
                                >
                                    <p className="font-medium text-sm truncate">{product.name}</p>
                                    <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart */}
                <div className="w-80 bg-white rounded-lg flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" /> Cart
                            <Badge variant="outline" className="ml-auto">{cart.length}</Badge>
                        </h2>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-2">
                        {cart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                                <div>
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>Scan items to add</p>
                                </div>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Totals */}
                    <div className="p-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax (10%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold border-t pt-2">
                            <span>Total</span>
                            <span className="text-primary">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Checkout */}
                    <div className="p-4 border-t">
                        {!showCheckout ? (
                            <Button className="w-full h-14 text-lg" disabled={cart.length === 0} onClick={() => setShowCheckout(true)}>
                                <CreditCard className="mr-2 h-5 w-5" /> Pay Now
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} className="h-10" onClick={() => setPaymentMethod('cash')}>
                                        <Banknote className="mr-1 h-4 w-4" /> Cash
                                    </Button>
                                    <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} className="h-10" onClick={() => setPaymentMethod('card')}>
                                        <CreditCard className="mr-1 h-4 w-4" /> Card
                                    </Button>
                                </div>
                                {paymentMethod === 'cash' && (
                                    <>
                                        <Input type="number" placeholder="Cash received" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="h-10" />
                                        {parseFloat(cashReceived) >= total && <div className="text-center py-1 bg-green-100 rounded text-green-700 font-bold">Change: ${change.toFixed(2)}</div>}
                                    </>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={() => { setShowCheckout(false); setPaymentMethod(null); setCashReceived("") }}>
                                        <X className="mr-1 h-4 w-4" /> Cancel
                                    </Button>
                                    <Button className="bg-green-600 hover:bg-green-700" disabled={!paymentMethod || (paymentMethod === 'cash' && parseFloat(cashReceived) < total)} onClick={completeSale}>
                                        <Check className="mr-1 h-4 w-4" /> Done
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
