"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import {
    ShieldAlert, Zap, Monitor, ShoppingCart,
    Lock, Unlock, LogOut, ChevronRight,
    ArrowUpRight, AlertTriangle, Sparkles,
    Receipt as ReceiptIcon, Wallet, Loader2 as RefreshIcon, Search,
    ScanLine, Info, History as LucideHistory, Barcode, Plus, Minus, Trash2,
    CreditCard, Banknote, X, Check, Eye, Activity, Cpu, BarChart3, PieChart, LineChart, FileText, Printer, Mail
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerSelect } from "@/components/pos/CustomerSelect"
import { Receipt } from "@/components/pos/Receipt"
import { useReactToPrint } from "react-to-print"
import {
    getLiveCounters, interveneInCounter, executePrivilegedTransaction,
    explainBillAnalysis, closeDayEmergency, getThreats, getSessionSummary, triggerStoreLockdown
} from "@/app/actions/owner-pos"
import { ProfessionalDocument } from "@/components/docs/ProfessionalDocument"
import { createOrderWithLoyalty, getProducts } from "@/app/actions/pos"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function OwnerPOSPage() {
    const { toast } = useToast()
    const docRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({ contentRef: docRef })
    const router = useRouter()
    const [counters, setCounters] = useState<any[]>([])
    const [cart, setCart] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<'billing' | 'monitoring' | 'threats' | 'analytics'>('billing')
    const [searchQuery, setSearchQuery] = useState("")
    const [barcodeInput, setBarcodeInput] = useState("")
    const [products, setProducts] = useState<any[]>([])
    const [aiInsights, setAiInsights] = useState<string[]>([])
    const [isAiLoading, setIsAiLoading] = useState(false)

    // Standard POS States
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [redeemedPoints, setRedeemedPoints] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null)
    const [cashReceived, setCashReceived] = useState("")
    const [showCheckout, setShowCheckout] = useState(false)
    const [lastOrder, setLastOrder] = useState<any>(null)
    const [showReceiptDialog, setShowReceiptDialog] = useState(false)
    const [showQuotationDialog, setShowQuotationDialog] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, itemId: string | null }>({ isOpen: false, itemId: null })
    const [threats, setThreats] = useState<any[]>([])

    // Complex POS States
    const [reconcileStep, setReconcileStep] = useState(0) // 0: closed, 1: verify, 2: actual, 3: confirm
    const [lockdownStep, setLockdownStep] = useState(0) // 0: closed, 1: warning, 2: secure
    const [actualCash, setActualCash] = useState("")
    const [reconcileReason, setReconcileReason] = useState("")
    const [lockdownReason, setLockdownReason] = useState("")
    const [showLoyaltyConfirm, setShowLoyaltyConfirm] = useState(false)
    const [lockdownScope, setLockdownScope] = useState<"FULL" | "BILLING">("FULL")
    const [actualCard, setActualCard] = useState("")
    const [sessionSummary, setSessionSummary] = useState<any>(null)

    const [storeSettings] = useState({
        name: "Executive Fresh Mart",
        address: "42 Developer Avenue, Tech City",
        phone: "+1 (555) 987-6543"
    })

    const receiptRef = useRef<HTMLDivElement>(null)
    const reactToPrintFn = useReactToPrint({
        contentRef: receiptRef,
    })

    // Real data fetching
    useEffect(() => {
        async function load() {
            const [counterRes, productRes, threatRes] = await Promise.all([
                getLiveCounters(),
                getProducts(),
                getThreats()
            ])
            if (counterRes.success) setCounters(counterRes.counters || [])
            if (productRes.success) setProducts(productRes.products || [])
            if (threatRes.success) setThreats(threatRes.threats || [])
        }
        load()
        const interval = setInterval(load, 30000) // Auto-refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const handleIntervene = async (id: string, action: any) => {
        const res = await interveneInCounter(id, action)
        if (res.success) {
            toast({ title: "Intervention Successful", description: `Counter ${id} has been ${action.toLowerCase()}ed.` })
        }
    }

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === item.id)
            if (existing) {
                return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p)
            }
            return [...prev, { ...item, quantity: 1, customPrice: item.price }]
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

    const removeItem = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    // Memoized Display Products
    const displayProducts = useMemo(() => {
        return products.reduce((acc: any[], current) => {
            if (acc.find(p => p.name === current.name)) return acc
            return [...acc, current]
        }, [])
    }, [products])

    const handleBarcodeScan = () => {
        if (!barcodeInput) return
        const cleanInput = barcodeInput.trim().toUpperCase()
        const product = products.find(p => (p.barcode || "").toUpperCase() === cleanInput)
        if (product) {
            addToCart(product)
            setBarcodeInput("")
            toast({ title: "Item Scanned", description: `${product.name} added to cart.` })
        } else {
            toast({ title: "Not Found", description: `No item matches "${barcodeInput}".`, variant: "destructive" })
        }
    }

    // Calculations
    const { subtotal, tax, discount, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + (item.customPrice || item.price) * item.quantity, 0)
        const tx = sub * 0.1
        const disc = redeemedPoints / 100
        const tot = Math.max(0, sub + tx - disc)
        return { subtotal: sub, tax: tx, discount: disc, total: tot }
    }, [cart, redeemedPoints])

    const handleExplainBill = async () => {
        setIsAiLoading(true)
        const res = await explainBillAnalysis(cart, total)
        if (res.success) setAiInsights(res.insights || [])
        setIsAiLoading(false)
    }

    const startReconciliation = async () => {
        const res = await getSessionSummary()
        if (res.success) {
            setSessionSummary(res.summary)
            setReconcileStep(1)
        } else {
            toast({ title: "Failed to fetch session data", variant: "destructive" })
        }
    }

    const handleDayClose = async () => {
        const res = await closeDayEmergency({
            actualCash: parseFloat(actualCash) + parseFloat(actualCard || "0"),
            expectedCash: sessionSummary?.totalExpected || 0,
            reason: reconcileReason
        })
        if (res.success) {
            toast({ title: "Day Closed", description: "Reconciliation record stored successfully." })
            setReconcileStep(0)
            setActualCash("")
            setActualCard("")
            setReconcileReason("")
        }
    }

    const handleLockdown = async () => {
        const res = await triggerStoreLockdown(lockdownReason, lockdownScope)
        if (res.success) {
            toast({ title: "LOCKDOWN ACTIVE", variant: "destructive", description: `Scope: ${lockdownScope}. Protocol restricted.` })
            setLockdownStep(0)
            setLockdownReason("")
        }
    }

    const generateQuotation = () => {
        if (cart.length === 0) return toast({ title: "Cart Empty", variant: "destructive" })
        const quotation = {
            id: `QUO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            items: cart,
            total,
            subtotal,
            tax,
            discount,
            customer: selectedCustomer,
            createdAt: new Date()
        }
        setLastOrder(quotation)
        setShowQuotationDialog(true)
    }

    const completeSale = async () => {
        const saleDetails = {
            items: cart,
            total,
            subtotal,
            tax,
            paymentMethod: paymentMethod!,
            customerId: selectedCustomer?.id,
            pointsEarned: selectedCustomer ? Math.floor(total) : 0,
            redeemedPoints: redeemedPoints,
            discountAmount: discount
        }

        try {
            const isPrivileged = cart.some(item => (item.customPrice || item.price) !== item.price)
            const res = isPrivileged
                ? await executePrivilegedTransaction({ ...saleDetails, overrides: { price: true, tax: false, return: false }, justification: "Owner manual override" })
                : await createOrderWithLoyalty(saleDetails)

            if (res.success) {
                setLastOrder({ ...(res as any).order || { id: (res as any).orderId }, items: cart, total, paymentMethod: paymentMethod!, customer: selectedCustomer })
                setShowReceiptDialog(true)
                setCart([])
                setShowCheckout(false)
                setPaymentMethod(null)
                setCashReceived("")
                setSelectedCustomer(null)
                setRedeemedPoints(0)
                toast({ title: "Sale Complete" })
            } else {
                toast({ title: "Sale Failed", description: (res as any).error, variant: "destructive" })
            }
        } catch (e) {
            toast({ title: "Error", variant: "destructive" })
        }
    }

    return (
        <div className="h-[calc(100vh-4rem)] bg-[#f8fafc] flex flex-col gap-4 p-4 selection:bg-red-500/20 font-sans">
            {/* Executive Top Bar */}
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Owner POS</h2>
                    <p className="text-sm text-muted-foreground">High-privilege terminal for store management and operations.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={startReconciliation} variant="outline" size="sm">
                        <LucideHistory className="mr-2 h-4 w-4" /> Reconcile
                    </Button>
                    <Button onClick={() => setLockdownStep(1)} variant="destructive" size="sm">
                        <ShieldAlert className="mr-2 h-4 w-4" /> Lockdown
                    </Button>
                </div>
            </header>

            <Tabs
                value={activeTab}
                onValueChange={(val: any) => setActiveTab(val)}
                className="space-y-4"
            >
                <TabsList>
                    <TabsTrigger value="billing">POS Billing</TabsTrigger>
                    <TabsTrigger value="monitoring">Terminals</TabsTrigger>
                    <TabsTrigger value="threats">Security Radar</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <div className="flex-1 flex flex-col min-h-0">

                    <TabsContent value="billing" className="flex-1 flex gap-6 overflow-hidden outline-none data-[state=inactive]:hidden">
                        {/* Left Pane: discovery */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="flex-1 flex flex-col p-6 min-h-0">
                                    {/* Product Controls */}
                                    <div className="flex gap-4 mb-6">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search product database..."
                                                className="pl-9 h-11"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative w-80">
                                            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Direct scan..."
                                                className="pl-9 h-11 border-l-4 border-l-primary"
                                                value={barcodeInput}
                                                onChange={e => setBarcodeInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleBarcodeScan()}
                                            />
                                        </div>
                                    </div>

                                    <ScrollArea className="flex-1 -mr-2 pr-2">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                                            {displayProducts.filter(p =>
                                                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                p.category.toLowerCase().includes(searchQuery.toLowerCase())
                                            ).map((product) => (
                                                <Button
                                                    key={product.id}
                                                    variant="outline"
                                                    onClick={() => addToCart(product)}
                                                    className="h-auto flex flex-col items-start p-4 hover:border-primary transition-all text-left"
                                                >
                                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                                                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{product.category}</p>
                                                    <div className="mt-4 flex items-center justify-between w-full">
                                                        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                                                        <Badge variant="secondary" className="text-[10px]">{product.stock} In Stock</Badge>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            {/* AI Insights Board */}
                            <div className="bg-muted p-4 rounded-xl flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Operational Intel</h4>
                                    <p className="text-xs font-medium line-clamp-1">
                                        {aiInsights.length > 0 ? aiInsights[0] : "Monitoring active session metrics..."}
                                    </p>
                                </div>
                                <Button onClick={handleExplainBill} disabled={isAiLoading || cart.length === 0} size="sm" variant="outline">
                                    {isAiLoading ? "Analyzing..." : "Analyze Bill"}
                                </Button>
                            </div>
                        </div>

                        <Card className="w-[400px] flex flex-col rounded-xl bg-white border-slate-200 shadow-xl overflow-hidden">
                            <CardHeader className="p-6 border-b">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <ReceiptIcon className="h-5 w-5 text-primary" />
                                        <h2 className="text-lg font-bold tracking-tight">Cart Settlement</h2>
                                    </div>
                                    <Badge variant="outline" className="font-bold">
                                        {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                                    </Badge>
                                </div>
                                <CustomerSelect selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} />
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                                <ScrollArea className="flex-1 px-8 py-4">
                                    <AnimatePresence mode="popLayout">
                                        {cart.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-24 opacity-50">
                                                <ScanLine className="h-16 w-16 mb-4" />
                                                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Standby Position</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {cart.map(item => (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="group p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex-1 pr-4">
                                                                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.barcode}</p>
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-900">${((item.customPrice || item.price) * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1 bg-white rounded-lg border shadow-sm">
                                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                                                onClick={() => setDeleteConfirm({ isOpen: true, itemId: item.id })}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </ScrollArea>

                                <div className="p-6 bg-slate-50 border-t">
                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            <span>Tax (10%)</span>
                                            <span>${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-4 border-t flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Bill</span>
                                                <span className="text-3xl font-bold tracking-tight text-slate-900">${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {!showCheckout ? (
                                        <div className="space-y-4">
                                            {selectedCustomer && (
                                                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Loyalty Points</p>
                                                        <p className="text-sm font-bold text-primary">{selectedCustomer.loyaltyPoints} PTS</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-[10px] font-bold uppercase tracking-wider"
                                                        onClick={() => setShowLoyaltyConfirm(true)}
                                                    >
                                                        Redeem
                                                    </Button>
                                                </div>
                                            )}
                                            <Button
                                                className="w-full h-14 rounded-xl text-lg font-bold"
                                                disabled={cart.length === 0}
                                                onClick={() => setShowCheckout(true)}
                                            >
                                                Checkout <ChevronRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-3 gap-2 mb-2">
                                                {['CASH', 'CARD', 'MOBILE'].map(m => (
                                                    <Button
                                                        key={m}
                                                        variant={paymentMethod === m ? "default" : "outline"}
                                                        className="h-10 text-[10px] font-bold uppercase tracking-wider"
                                                        onClick={() => setPaymentMethod(m as any)}
                                                    >
                                                        {m}
                                                    </Button>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" className="h-12 flex-1 text-xs font-bold uppercase tracking-wider" onClick={() => setShowCheckout(false)}>Cancel</Button>
                                                <Button
                                                    className="h-12 flex-[2] rounded-xl font-bold uppercase tracking-wider"
                                                    disabled={!paymentMethod}
                                                    /* Complete Sale Button */ onClick={completeSale}
                                                >
                                                    Finish Sale
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-14 rounded-2xl border-2 border-slate-900 text-slate-900 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                                                    onClick={generateQuotation}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" /> Generate Quotation
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="monitoring" className="flex-1 outline-none data-[state=inactive]:hidden pt-2">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase italic mb-1">Live Terminal Stream</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Global Node Monitoring • {counters.length} Active Nodes</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-wider px-6" onClick={() => getLiveCounters().then((res: any) => res.success && setCounters(res.counters))}>
                                {/* <RefreshIcon className="mr-2 h-3.5 w-3.5" /> */} Force Sync
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {counters.map(counter => (
                                <Card key={counter.id} className="rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden bg-white">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className={cn("h-2 w-2 rounded-full", counter.status === 'ACTIVE' ? "bg-green-500" : "bg-red-500")} />
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
                                            <Monitor className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mb-1">Terminal {counter.id.slice(-4)}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <Badge variant="secondary" className="text-[10px] font-medium">Staff: {counter.staffName}</Badge>
                                            <Badge variant="outline" className="text-[10px] font-medium">Type: Standard</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                <span>Current Load</span>
                                                <span>{counter.load}%</span>
                                            </div>
                                            <Progress value={counter.load} className="h-1.5" />
                                        </div>
                                        <div className="mt-6 pt-4 border-t flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1 text-[10px] font-bold uppercase tracking-wider h-9" onClick={() => handleIntervene(counter.id, 'LOCK')}>Lock</Button>
                                            <Button variant="outline" size="sm" className="flex-1 text-[10px] font-bold uppercase tracking-wider h-9">Sync</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="threats" className="flex-1 outline-none data-[state=inactive]:hidden pt-2">
                        <div className="grid lg:grid-cols-12 gap-8">
                            {/* Threat Feed */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight">Security Radar</h2>
                                        <p className="text-sm text-muted-foreground">Real-time analysis of {threats.length} security events.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {threats.length === 0 ? (
                                        <Card className="rounded-2xl border-dashed border-2 p-24 text-center">
                                            <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6">
                                                <Check className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Active Threat Vectors Detected</p>
                                        </Card>
                                    ) : (
                                        threats.map((threat) => (
                                            <motion.div
                                                key={threat.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={cn(
                                                    "p-6 rounded-3xl border flex items-center gap-6 group transition-all",
                                                    threat.level === 'CRITICAL' ? "bg-red-50 border-red-100" : "bg-white border-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                                    threat.level === 'CRITICAL' ? "bg-red-600 text-white shadow-red-200" : "bg-slate-900 text-white shadow-slate-200"
                                                )}>
                                                    {threat.level === 'CRITICAL' ? <ShieldAlert className="h-7 w-7" /> : <Activity className="h-7 w-7" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{threat.message}</h4>
                                                        <Badge className={cn("rounded-full text-[9px] font-bold tracking-wider", threat.level === 'CRITICAL' ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500")}>
                                                            {threat.level}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        <span>Node ID: {threat.id.slice(0, 8)}</span>
                                                        <span>•</span>
                                                        <span>Timestamp: {new Date(threat.time).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" className="h-10 rounded-xl bg-slate-900 text-white font-bold text-[9px] uppercase tracking-wider px-4 shadow-lg hover:bg-red-600 transition-all">Lock Node</Button>
                                                    <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-200 font-bold text-[9px] uppercase tracking-wider px-4 bg-white">Dismiss</Button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Analysis Side Pane */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card className="rounded-2xl border-none shadow-2xl bg-slate-900 text-white overflow-hidden p-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                                <Cpu className="h-6 w-6 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Security Engine</p>
                                                <p className="text-xl font-bold italic tracking-tight">v4.2 PRO</p>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-white/5 space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                                <span className="text-slate-500">Pattern Accuracy</span>
                                                <span className="text-green-500">99.8%</span>
                                            </div>
                                            <Progress value={99.8} className="h-1.5 bg-white/5" />
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-4">
                                                <span className="text-slate-500">System Status</span>
                                                <span className="text-green-500">OPERATIONAL</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="rounded-2xl border-none shadow-xl bg-slate-50 p-8">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Vector Distribution</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Login Anomalies', val: 12, color: 'bg-red-500' },
                                            { label: 'Price Overrides', val: 4, color: 'bg-amber-500' },
                                            { label: 'System Access', val: 2, color: 'bg-indigo-500' }
                                        ].map(item => (
                                            <div key={item.label} className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                                                    <span>{item.label}</span>
                                                    <span>{item.val} events</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${(item.val / 20) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="flex-1 outline-none data-[state=inactive]:hidden pt-2">
                        <div className="space-y-8 pb-8">
                            {/* High Level Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="rounded-2xl border-none shadow-xl bg-white p-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                            <LineChart className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Velocity</span>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tight text-slate-900">$12,450.00</p>
                                    <p className="text-[10px] font-bold text-green-500 mt-2">+12.4% vs Projected</p>
                                </Card>
                                <Card className="rounded-2xl border-none shadow-xl bg-white p-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Vol</span>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tight text-slate-900">142 Units</p>
                                    <p className="text-[10px] font-bold text-indigo-500 mt-2">Peak hour recorded</p>
                                </Card>
                                <Card className="rounded-2xl border-none shadow-xl bg-white p-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">System Accuracy</span>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tight text-slate-900">99.8%</p>
                                    <p className="text-[10px] font-bold text-amber-500 mt-2">Zero false alerts</p>
                                </Card>
                                <Card className="rounded-2xl border-none shadow-xl bg-red-600 text-white p-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                                            <PieChart className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Loss Prevention</span>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tight">$2,140.00</p>
                                    <p className="text-[10px] font-bold text-white/80 mt-2">Saved via risk engine</p>
                                </Card>
                            </div>

                            {/* Deep Analysis Visuals */}
                            <div className="grid lg:grid-cols-2 gap-8">
                                <Card className="rounded-2xl border-none shadow-2xl bg-white p-10 min-h-[400px] flex flex-col">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 uppercase">Performance Metrics</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Real-time throughput analysis</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-3 w-3 rounded-full bg-indigo-500" />
                                            <div className="h-3 w-3 rounded-full bg-slate-200" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-end gap-3 pb-4">
                                        {[65, 45, 85, 30, 95, 75, 40, 60, 90, 50, 80, 70].map((h, i) => (
                                            <div key={i} className="flex-1 group relative">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    className="w-full bg-slate-100 rounded-2xl group-hover:bg-indigo-600 transition-all duration-500"
                                                />
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-300">{i + 1}h</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="rounded-2xl border-none shadow-2xl bg-white p-10 min-h-[400px]">
                                    <h3 className="text-xl font-bold text-slate-900 uppercase mb-10">Staff Efficiency Link</h3>
                                    <div className="space-y-6">
                                        {[
                                            { name: 'Terminal A', efficiency: 94, sales: 4200 },
                                            { name: 'Terminal B', efficiency: 88, sales: 3850 },
                                            { name: 'Terminal C', efficiency: 97, sales: 4400 },
                                            { name: 'Terminal D', efficiency: 76, sales: 2100 }
                                        ].map(t => (
                                            <div key={t.name} className="p-6 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.name}</span>
                                                    <span className="text-[10px] font-bold text-indigo-600">${t.sales}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Progress value={t.efficiency} className="h-2 bg-slate-200 flex-1" />
                                                    <span className="text-[10px] font-bold text-slate-400">{t.efficiency}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Light Themed Dialogs */}
            <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
                <DialogContent className="max-w-2xl bg-white border-slate-200 rounded-xl p-0 overflow-hidden shadow-xl">
                    <DialogTitle className="sr-only">POS Operation</DialogTitle>
                    <div className="p-10 flex flex-col items-center">
                        <div className="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogHeader className="text-center mb-8">
                            <DialogTitle className="text-3xl font-bold text-slate-900 tracking-tight uppercase italic leading-none">Transaction Complete</DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Order processed successfully</DialogDescription>
                        </DialogHeader>

                        <div className="w-full bg-slate-50 rounded-xl p-8 border border-slate-100 shadow-inner mb-8">
                            {lastOrder && <Receipt ref={receiptRef} order={lastOrder} store={storeSettings} />}
                        </div>

                        <div className="flex gap-4 w-full">
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-xs" onClick={() => setShowReceiptDialog(false)}>Dismiss</Button>
                            <Button className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-wider text-xs shadow-xl shadow-slate-200" onClick={() => reactToPrintFn()}>Print Receipt</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirm.isOpen} onOpenChange={(open) => !open && setDeleteConfirm({ isOpen: false, itemId: null })}>
                <DialogContent className="bg-white border-slate-200 rounded-xl p-0 overflow-hidden max-w-sm shadow-xl">
                    <DialogTitle className="sr-only">POS Operation</DialogTitle>
                    <div className="p-8">
                        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center mb-6">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight uppercase italic">Purge Item?</DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-1">Remove unit from processing buffer?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[9px]" onClick={() => setDeleteConfirm({ isOpen: false, itemId: null })}>Abort</Button>
                            <Button className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-[9px]" onClick={() => {
                                if (deleteConfirm.itemId) {
                                    removeItem(deleteConfirm.itemId)
                                    setDeleteConfirm({ isOpen: false, itemId: null })
                                }
                            }}>Purge Protocol</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reconcile Dialog (Multi-step) */}
            <Dialog open={reconcileStep > 0} onOpenChange={(open) => !open && setReconcileStep(0)}>
                <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden shadow-xl border-slate-200">
                    <DialogTitle className="sr-only">POS Operation</DialogTitle>
                    <div className="p-10">
                        {reconcileStep === 1 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-sm text-slate-400">
                                    <LucideHistory className="h-8 w-8" />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-slate-900 uppercase italic">Initiate Reconciliation</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Step 1: System Verification</DialogDescription>
                                </DialogHeader>
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expected Yield</span>
                                        <span className="text-xl font-bold text-slate-900">${sessionSummary?.totalExpected.toFixed(2) || "0.00"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recorded Orders</span>
                                        <span className="text-xl font-bold text-slate-900">{sessionSummary?.orderCount || 0} Units</span>
                                    </div>
                                    <div className="pt-2 border-t grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Cash</p>
                                            <p className="text-xs font-bold text-slate-600">${sessionSummary?.cashExpected.toFixed(2) || "0.00"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Card</p>
                                            <p className="text-xs font-bold text-slate-600">${sessionSummary?.cardExpected.toFixed(2) || "0.00"}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-wider text-xs shadow-xl shadow-slate-200" onClick={() => setReconcileStep(2)}>Enter Actuals</Button>
                            </motion.div>
                        )}
                        {reconcileStep === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <Button variant="ghost" className="p-0 h-auto text-slate-400 hover:text-slate-600 font-bold text-[9px] uppercase tracking-wider" onClick={() => setReconcileStep(1)}>← Back</Button>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-slate-900 uppercase italic">Physical Inventory</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Step 2: Asset Input</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Actual Cash</label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 font-bold text-lg focus:bg-white"
                                                value={actualCash}
                                                onChange={e => setActualCash(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Card Slips</label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 font-bold text-lg focus:bg-white"
                                                value={actualCard}
                                                onChange={e => setActualCard(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Session Notes (Optional)</label>
                                        <Input
                                            placeholder="Any discrepancies?"
                                            className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 font-bold text-sm focus:bg-white"
                                            value={reconcileReason}
                                            onChange={e => setReconcileReason(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-wider text-xs shadow-xl shadow-slate-200"
                                    disabled={!actualCash || !actualCard}
                                    onClick={() => setReconcileStep(3)}
                                >
                                    Verify Submission
                                </Button>
                            </motion.div>
                        )}
                        {reconcileStep === 3 && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-slate-900 uppercase italic">Final Protocol</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Step 3: Commit Record</DialogDescription>
                                </DialogHeader>
                                <div className="p-8 rounded-xl border-2 border-dashed border-slate-200 space-y-6 text-center bg-slate-50/30">
                                    <p className="text-sm font-bold text-slate-600">Review Variance Analysis</p>
                                    <div className="flex justify-around">
                                        <div className="text-center">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mb-1">Expected</p>
                                            <p className="text-lg font-bold text-slate-900">${sessionSummary?.totalExpected.toFixed(2) || "0.00"}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mb-1">Actual</p>
                                            <p className={cn("text-lg font-bold", (parseFloat(actualCash) + parseFloat(actualCard || "0")) !== (sessionSummary?.totalExpected || 0) ? "text-red-600" : "text-green-600")}>
                                                ${(parseFloat(actualCash) + parseFloat(actualCard || "0")).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    {(parseFloat(actualCash) + parseFloat(actualCard || "0")) !== (sessionSummary?.totalExpected || 0) && (
                                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Variance Alert: Manual Audit Required</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold text-[10px] uppercase tracking-wider" onClick={() => setReconcileStep(0)}>Abort</Button>
                                    <Button className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-[10px]" onClick={handleDayClose}>Commit Flow</Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Lockdown Dialog (Multi-step) */}
            {/* Loyalty Dialog */}
            <Dialog open={showLoyaltyConfirm} onOpenChange={setShowLoyaltyConfirm}>
                <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden shadow-xl border-slate-200">
                    <DialogTitle className="sr-only">POS Operation</DialogTitle>
                    <div className="p-10 text-center">
                        <div className="h-20 w-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-8 shadow-inner border border-amber-100/50">
                            <Sparkles className="h-10 w-10" />
                        </div>
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-3xl font-bold text-slate-900 uppercase italic tracking-tight">Redeem Rewards</DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Loyalty Asset Conversion Engine</DialogDescription>
                        </DialogHeader>

                        <div className="p-8 rounded-xl bg-slate-50 border border-slate-100 mb-8 space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span>Available Pool</span>
                                <span className="text-slate-900">{selectedCustomer?.loyaltyPoints || 0} PTS</span>
                            </div>
                            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Value Conversion</span>
                                <span className="text-xl font-bold text-green-600">${((selectedCustomer?.loyaltyPoints || 0) / 100).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                className="h-16 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-[0.2em] text-xs shadow-xl active:scale-[0.98] transition-all"
                                onClick={() => {
                                    setRedeemedPoints(selectedCustomer?.loyaltyPoints || 0)
                                    setShowLoyaltyConfirm(false)
                                    toast({ title: "Points Applied", description: "Reward value deducted from final yield." })
                                }}
                            >
                                EXECUTE CONVERSION
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-10 text-slate-400 font-bold text-[9px] uppercase tracking-wider"
                                onClick={() => setShowLoyaltyConfirm(false)}
                            >
                                Maintain Assets
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={lockdownStep > 0} onOpenChange={(open) => !open && setLockdownStep(0)}>
                <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(220,38,38,0.25)] border-red-100">
                    <DialogTitle className="sr-only">POS Operation</DialogTitle>
                    <div className="p-10">
                        {lockdownStep === 1 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="h-20 w-20 rounded-3xl bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-200 ring-8 ring-red-50 mx-auto">
                                    <ShieldAlert className="h-10 w-10" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-bold text-slate-900 uppercase italic tracking-tight leading-none">Security Override</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Lockdown Protocol</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-2">Reason</label>
                                        <Input
                                            placeholder="Threat description..."
                                            className="h-14 rounded-2xl bg-red-50/30 border-red-100 font-bold focus:bg-white"
                                            value={lockdownReason}
                                            onChange={e => setLockdownReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-2">Scope</label>
                                        <div className="flex h-14 bg-red-50/30 rounded-2xl p-1 border border-red-100">
                                            {(['FULL', 'BILLING'] as const).map(s => (
                                                <Button
                                                    key={s}
                                                    variant="ghost"
                                                    className={cn("flex-1 h-full rounded-xl text-[10px] font-bold uppercase", lockdownScope === s ? "bg-red-600 text-white shadow-md" : "text-red-400")}
                                                    onClick={() => setLockdownScope(s)}
                                                >
                                                    {s}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-sm shadow-xl shadow-red-200 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all"
                                        disabled={!lockdownReason}
                                        onClick={() => setLockdownStep(2)}
                                    >
                                        VERIFY IDENTITY & LOCK
                                    </Button>
                                    <Button variant="ghost" className="h-10 text-slate-400 font-bold text-[10px] tracking-wider uppercase" onClick={() => setLockdownStep(0)}>Cancel Protocol</Button>
                                </div>
                            </motion.div>
                        )}
                        {lockdownStep === 2 && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center">
                                <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 space-y-6">
                                    <div className="relative h-1 w-full bg-white/5 overflow-hidden rounded-full">
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "100%" }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 h-full w-1/3 bg-red-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.5em] animate-pulse">Arming Node Shields</p>
                                        <p className="text-white font-medium text-xs opacity-60">System will restrict all terminal transaction processing immediately upon confirmation.</p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-16 rounded-2xl bg-white text-black font-bold uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-[0.98] transition-all"
                                    onClick={handleLockdown}
                                >
                                    CONFIRM GLOBAL LOCKDOWN
                                </Button>
                                <Button variant="ghost" className="text-slate-400 font-bold text-[9px] uppercase tracking-wider" onClick={() => setLockdownStep(1)}>Abort</Button>
                            </motion.div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
            `}</style>

            {/* Quotation Dialog */}
            <Dialog open={showQuotationDialog} onOpenChange={setShowQuotationDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-[3rem] border-slate-200 shadow-2xl overflow-hidden bg-slate-100">
                    <DialogTitle className="sr-only">Quotation Preview</DialogTitle>
                    <div className="sticky top-0 z-50 p-6 bg-white/50 backdrop-blur-md border-b border-white/20 flex justify-between items-center shadow-sm">
                        <h2 className="text-xl font-bold tracking-tight">Quotation Preview</h2>
                        <div className="flex gap-3">
                            <Button variant="outline" className="h-10 rounded-xl bg-white border-slate-200" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" /> Print PDF
                            </Button>
                            <Button className="h-10 rounded-xl bg-slate-900 shadow-xl shadow-slate-200">
                                <Mail className="mr-2 h-4 w-4" /> Email to Customer
                            </Button>
                        </div>
                    </div>
                    <div className="p-10">
                        {lastOrder && (
                            <div className="bg-white shadow-2xl rounded-sm mx-auto overflow-hidden">
                                <ProfessionalDocument ref={docRef} type="QUOTATION" order={lastOrder} />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
