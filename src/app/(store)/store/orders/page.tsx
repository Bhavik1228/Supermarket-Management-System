"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ShoppingCart,
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
    Clock,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    FileText,
    Printer,
    Mail,
    User,
    Phone,
    MapPin,
    AlertCircle,
    Loader2,
    Plus,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getOnlineOrders, updateOrderStatus, createOnlineOrder } from "@/app/actions/orders"
import { getInventory } from "@/app/actions/inventory"
import { cn } from "@/lib/utils"
import { ProfessionalDocument } from "@/components/docs/ProfessionalDocument"
import { useReactToPrint } from "react-to-print"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    'PENDING': { label: 'Pending Confirmation', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    'CONFIRMED': { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
    'PREPARING': { label: 'Preparing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package },
    'READY': { label: 'Ready for Pickup', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Package },
    'OUT_FOR_DELIVERY': { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
    'DELIVERED': { label: 'Delivered', color: 'bg-emerald-500 text-white border-emerald-600', icon: CheckCircle2 },
    'COMPLETED': { label: 'Completed', color: 'bg-slate-900 text-white border-slate-950', icon: CheckCircle2 },
    'CANCELLED': { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
}

export default function OnlineOrdersPage() {
    const { toast } = useToast()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isDocOpen, setIsDocOpen] = useState(false)
    const [docType, setDocType] = useState<'INVOICE' | 'QUOTATION' | 'DELIVERY_NOTE' | 'PROFORMA_INVOICE' | 'STATEMENT'>('INVOICE')
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [newOrder, setNewOrder] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        items: [] as any[],
        paymentMethod: "CASH_ON_DELIVERY",
        fulfillmentMethod: "DELIVERY"
    })

    const docRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({ contentRef: docRef })

    useEffect(() => {
        loadOrders()
        loadProducts()
    }, [])

    const loadProducts = async () => {
        const res = await getInventory()
        if (res.success) setProducts((res as any).products || [])
    }

    const loadOrders = async () => {
        setLoading(true)
        const res = await getOnlineOrders()
        if (res.success) setOrders(res.orders || [])
        setLoading(false)
    }

    const handleStatusChange = async (orderId: string, status: string) => {
        setIsUpdating(orderId)
        const res = await updateOrderStatus(orderId, status)
        if (res.success) {
            toast({ title: "Status Updated", description: `Order is now ${status}.` })
            loadOrders()
        } else {
            toast({ title: "Update Failed", variant: "destructive" })
        }
        setIsUpdating(null)
    }

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Online Orders</h1>
                    <p className="text-slate-500 font-medium">Lifecycle management for direct-to-consumer digital transactions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg gap-2">
                                <Phone className="h-5 w-5" /> Capture Phone Order
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
                            <div className="bg-slate-900 p-8 text-white">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black text-white">Manual Order Entry</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-medium text-base">Capture telephone or walk-in orders for delivery fulfillment.</DialogDescription>
                                </DialogHeader>
                            </div>
                            <div className="p-8 grid md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer Identity</Label>
                                        <div className="space-y-4">
                                            <Input placeholder="Full Name" className="h-12 rounded-xl border-slate-100" value={newOrder.customerName} onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })} />
                                            <Input placeholder="Email Address" className="h-12 rounded-xl border-slate-100" value={newOrder.customerEmail} onChange={e => setNewOrder({ ...newOrder, customerEmail: e.target.value })} />
                                            <Input placeholder="Phone Number" className="h-12 rounded-xl border-slate-100" value={newOrder.customerPhone} onChange={e => setNewOrder({ ...newOrder, customerPhone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Shipping Destination</Label>
                                        <textarea
                                            placeholder="Physical Address"
                                            className="w-full min-h-[100px] p-4 rounded-xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            value={newOrder.customerAddress}
                                            onChange={e => setNewOrder({ ...newOrder, customerAddress: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Order Construction</Label>
                                        <Select onValueChange={(v) => {
                                            const p = products.find(p => p.id === v)
                                            if (p) {
                                                const existing = newOrder.items.find(i => i.productId === v)
                                                if (existing) {
                                                    setNewOrder({ ...newOrder, items: newOrder.items.map(i => i.productId === v ? { ...i, quantity: i.quantity + 1 } : i) })
                                                } else {
                                                    setNewOrder({ ...newOrder, items: [...newOrder.items, { productId: p.id, name: p.name, price: p.price, quantity: 1 }] })
                                                }
                                            }
                                        }}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-100">
                                                <SelectValue placeholder="Add Products..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="space-y-2 mt-4">
                                            {newOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                        <p className="text-[10px] text-slate-400">${item.price} x {item.quantity}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                                                            setNewOrder({ ...newOrder, items: newOrder.items.filter(i => i.productId !== item.productId) })
                                                        }}>
                                                            <XCircle className="h-4 w-4 text-rose-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Projected Total</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        ${newOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}
                                    </p>
                                </div>
                                <Button
                                    className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-slate-950 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                                    onClick={async () => {
                                        if (!newOrder.customerName || !newOrder.items.length) {
                                            toast({ title: "Validation Error", description: "Customer name and at least one item required.", variant: "destructive" })
                                            return
                                        }
                                        const res = await createOnlineOrder({
                                            ...newOrder,
                                            storeId: "store-freshmart",
                                            total: newOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
                                        })
                                        if (res.success) {
                                            toast({ title: "Order Captured", description: "Manual order has been broadcasted to the fulfillment system." })
                                            setIsCreateOpen(false)
                                            setNewOrder({ customerName: "", customerEmail: "", customerPhone: "", customerAddress: "", items: [], paymentMethod: "CASH_ON_DELIVERY", fulfillmentMethod: "DELIVERY" })
                                            loadOrders()
                                        }
                                    }}
                                >
                                    BROADCAST ORDER
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search Order ID, Customer..."
                            className="pl-11 h-12 rounded-2xl bg-white border-slate-200 shadow-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200"><Filter className="h-4 w-4" /></Button>
                    <CreateOrderDialog onCreated={loadOrders} />
                </div>
            </header>

            {/* Orders Feed */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
                    <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
                    <p className="text-sm font-bold uppercase tracking-widest">Synchronizing Encrypted Feed...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center gap-6 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <ShoppingCart className="h-10 w-10" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">No Online Activity</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto">No orders match your current filter parameters or the queue is empty.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredOrders.map((order) => {
                        const status = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-slate-100', icon: Clock }
                        const StatusIcon = status.icon

                        return (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
                            >
                                <div className="flex flex-col lg:flex-row gap-10">
                                    {/* Core Info */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <Badge className={cn("px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] border", status.color)}>
                                                    <StatusIcon className="mr-2 h-3 w-3" /> {status.label}
                                                </Badge>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">ORD-{order.id.slice(-8).toUpperCase()}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-black text-slate-900 tracking-tighter">${order.total.toFixed(2)}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.paymentMethod} • {order.fulfillmentMethod}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                                    <User className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Customer Node</p>
                                                    <p className="text-sm font-bold text-slate-900">{order.customer?.name || order.customerEmail || 'Guest'}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">{order.customerPhone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                                    <MapPin className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Delivery Protocol</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">{order.customerAddress || 'Direct Pickup'}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">{order.fulfillmentMethod}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                                    <Package className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Unit Payload</p>
                                                    <p className="text-sm font-bold text-slate-900">{order.items.length} Distinct SKUs</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">{order.items.reduce((a: any, b: any) => a + b.quantity, 0)} Total Units</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Control Node */}
                                    <div className="w-full lg:w-80 flex flex-col gap-4 border-l-0 lg:border-l border-slate-100 pl-0 lg:pl-10">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lifecycle Protocol</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {order.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            className="bg-emerald-600 hover:bg-emerald-500 rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest"
                                                            onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                                            disabled={isUpdating === order.id}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="text-red-500 border-red-100 hover:bg-red-50 rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest"
                                                            onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                                            disabled={isUpdating === order.id}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {order.status === 'CONFIRMED' && (
                                                    <Button
                                                        className="col-span-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest"
                                                        onClick={() => handleStatusChange(order.id, 'PREPARING')}
                                                        disabled={isUpdating === order.id}
                                                    >
                                                        Initialize Picking
                                                    </Button>
                                                )}
                                                {order.status === 'PREPARING' && (
                                                    <Button
                                                        className="col-span-2 bg-purple-600 hover:bg-purple-500 rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest"
                                                        onClick={() => handleStatusChange(order.id, order.fulfillmentMethod === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY')}
                                                        disabled={isUpdating === order.id}
                                                    >
                                                        Finalize Package
                                                    </Button>
                                                )}
                                                {(order.status === 'OUT_FOR_DELIVERY' || order.status === 'READY') && (
                                                    <Button
                                                        className="col-span-2 bg-slate-900 hover:bg-slate-800 rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest"
                                                        onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                                                        disabled={isUpdating === order.id}
                                                    >
                                                        Confirm Fulfillment
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Document Generation</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="secondary"
                                                    className="rounded-xl h-11 text-[9px] font-bold uppercase tracking-tighter bg-slate-100 text-slate-900 border border-slate-200"
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setDocType('INVOICE')
                                                        setIsDocOpen(true)
                                                    }}
                                                >
                                                    <FileText className="mr-2 h-3.5 w-3.5" /> Invoice
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="rounded-xl h-11 text-[9px] font-bold uppercase tracking-tighter bg-slate-100 text-slate-900 border border-slate-200"
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setDocType('DELIVERY_NOTE')
                                                        setIsDocOpen(true)
                                                    }}
                                                >
                                                    <Truck className="mr-2 h-3.5 w-3.5" /> Delivery
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Document Preview Dialog */}
            <Dialog open={isDocOpen} onOpenChange={setIsDocOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-[3rem] border-slate-200 shadow-2xl overflow-hidden bg-slate-100">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Document Preview</DialogTitle>
                    </DialogHeader>
                    <div className="sticky top-0 z-50 p-6 bg-white/50 backdrop-blur-md border-b border-white/20 flex justify-between items-center shadow-sm">
                        <div className="flex gap-4 flex-wrap">
                            {(['INVOICE', 'QUOTATION', 'DELIVERY_NOTE', 'PROFORMA_INVOICE', 'STATEMENT'] as const).map(t => (
                                <Button
                                    key={t}
                                    variant="ghost"
                                    className={cn("h-10 rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest", docType === t ? "bg-slate-900 text-white shadow-xl" : "text-slate-400")}
                                    onClick={() => setDocType(t)}
                                >
                                    {t.replace(/_/g, ' ')}
                                </Button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="h-10 rounded-xl bg-white border-slate-200" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" /> Print PDF
                            </Button>
                            <Button className="h-10 rounded-xl bg-slate-900 shadow-xl shadow-slate-200">
                                <Mail className="mr-2 h-4 w-4" /> Email Customer
                            </Button>
                        </div>
                    </div>
                    <div className="p-10">
                        {selectedOrder && (
                            <div className="bg-white shadow-2xl rounded-sm mx-auto overflow-hidden">
                                <ProfessionalDocument ref={docRef} type={docType} order={selectedOrder} />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function CreateOrderDialog({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        fulfillmentMethod: "DELIVERY",
        paymentMethod: "CASH"
    })

    useEffect(() => {
        if (open) loadProducts()
    }, [open])

    async function loadProducts() {
        const res = await getInventory()
        if (res.success) setProducts(res.products || [])
    }

    const addItem = (p: any) => {
        const existing = selectedItems.find(i => i.id === p.id)
        if (existing) {
            setSelectedItems(selectedItems.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
        } else {
            setSelectedItems([...selectedItems, { ...p, quantity: 1 }])
        }
    }

    const removeItem = (id: string) => {
        setSelectedItems(selectedItems.filter(i => i.id !== id))
    }

    const total = selectedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)

    async function handleSubmit() {
        if (!formData.customerName || selectedItems.length === 0) {
            toast({ title: "Validation Error", description: "Name and items are required.", variant: "destructive" })
            return
        }

        setLoading(true)
        const res = await createOnlineOrder({
            ...formData,
            storeId: 'store-freshmart',
            items: selectedItems.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price, name: i.name })),
            total
        })

        if (res.success) {
            toast({ title: "Order Created", description: "The online order has been registered." })
            setOpen(false)
            onCreated()
            setSelectedItems([])
            setFormData({
                customerName: "",
                customerEmail: "",
                customerPhone: "",
                customerAddress: "",
                fulfillmentMethod: "DELIVERY",
                paymentMethod: "CASH"
            })
        } else {
            toast({ title: "Creation Failed", variant: "destructive" })
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={() => setOpen(true)} className="h-12 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200 px-6 font-bold uppercase tracking-widest text-[10px]">
                <Plus className="mr-2 h-4 w-4" /> Create Online Order
            </Button>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">New Online Order Protocol</DialogTitle>
                    <DialogDescription>Manually register a direct-to-consumer transaction.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-slate-400">Customer Name</Label>
                            <Input value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} placeholder="Full Name" />
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-slate-400">Email Address</Label>
                            <Input value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} placeholder="customer@email.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] font-black tracking-widest text-slate-400">Phone Protocol</Label>
                                <Input value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} placeholder="+255..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] font-black tracking-widest text-slate-400">Fulfillment</Label>
                                <Select value={formData.fulfillmentMethod} onValueChange={v => setFormData({ ...formData, fulfillmentMethod: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DELIVERY">Delivery</SelectItem>
                                        <SelectItem value="PICKUP">Pickup</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-slate-400">Delivery Address</Label>
                            <Textarea value={formData.customerAddress} onChange={e => setFormData({ ...formData, customerAddress: e.target.value })} placeholder="Street, City, Building" />
                        </div>
                    </div>

                    <div className="space-y-6 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col">
                        <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-slate-400">Order Payload</Label>

                            <div className="flex gap-2 mb-4">
                                <Select onValueChange={(val) => {
                                    const p = products.find(prod => prod.id === val)
                                    if (p) addItem(p)
                                }}>
                                    <SelectTrigger className="rounded-xl border-slate-200">
                                        <SelectValue placeholder="Add Item to Payload..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {selectedItems.map(item => (
                                    <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center group">
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Qty: {item.quantity} x ${item.price}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {selectedItems.length === 0 && (
                                    <div className="h-32 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest border border-dashed border-slate-200 rounded-2xl">
                                        Payload Empty
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Total Valuation</span>
                                <span className="text-2xl font-black text-slate-900">${total.toFixed(2)}</span>
                            </div>
                            <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase text-xs" onClick={handleSubmit} disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShoppingCart className="h-5 w-5 mr-2" />}
                                Initialize Fulfillment
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
