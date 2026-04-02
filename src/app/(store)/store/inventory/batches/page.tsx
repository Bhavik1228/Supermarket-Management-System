"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Package, Calendar, Plus, Search,
    Filter, Loader2, ArrowLeft, ShieldAlert,
    Trash2, Edit3, ChevronRight, AlertCircle,
    CheckCircle2, Clock
} from "lucide-react"
import { getExpiringProducts, addProductBatch } from "@/app/actions/inventory-batches"
import { getInventory } from "@/app/actions/inventory"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BatchManagementPage() {
    const { toast } = useToast()
    const [batches, setBatches] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newBatch, setNewBatch] = useState({
        productId: "",
        batchNumber: "",
        quantity: "",
        expiryDate: "",
        costPrice: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [bRes, pRes] = await Promise.all([
            getExpiringProducts(365), // Show all batches for next year
            getInventory()
        ])
        if (bRes.success) setBatches(bRes.batches || [])
        if (pRes.success) setProducts((pRes as any).products || [])
        setLoading(false)
    }

    const handleAddBatch = async () => {
        if (!newBatch.productId || !newBatch.batchNumber || !newBatch.quantity || !newBatch.expiryDate) return
        setIsSubmitting(true)
        const res = await addProductBatch({
            ...newBatch,
            quantity: parseInt(newBatch.quantity),
            costPrice: parseFloat(newBatch.costPrice) || 0
        })
        setIsSubmitting(false)
        if (res.success) {
            toast({ title: "Batch Recorded", description: "Product batch successfully added to inventory." })
            setIsAddOpen(false)
            setNewBatch({ productId: "", batchNumber: "", quantity: "", expiryDate: "", costPrice: "" })
            loadData()
        }
    }

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/store/inventory">
                        <Button variant="ghost" size="icon" className="rounded-2xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900">Batch Sentinel</h2>
                        <p className="text-slate-500 font-medium">Precision tracking for perishable inventory.</p>
                    </div>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg gap-2">
                            <Plus className="h-5 w-5" /> New Batch Arrival
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-none shadow-2xl max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Record Batch</DialogTitle>
                            <DialogDescription>Add a new supply batch with expiration tracking.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400">Select Product</label>
                                <Select onValueChange={v => setNewBatch({ ...newBatch, productId: v })}>
                                    <SelectTrigger className="rounded-xl border-slate-100 h-11">
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Batch Number</label>
                                    <Input
                                        placeholder="LOT-123"
                                        className="rounded-xl border-slate-100 h-11"
                                        value={newBatch.batchNumber}
                                        onChange={e => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Quantity</label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        className="rounded-xl border-slate-100 h-11"
                                        value={newBatch.quantity}
                                        onChange={e => setNewBatch({ ...newBatch, quantity: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Expiry Date</label>
                                    <Input
                                        type="date"
                                        className="rounded-xl border-slate-100 h-11"
                                        value={newBatch.expiryDate}
                                        onChange={e => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Unit Cost ($)</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="rounded-xl border-slate-100 h-11"
                                        value={newBatch.costPrice}
                                        onChange={e => setNewBatch({ ...newBatch, costPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-white"
                                onClick={handleAddBatch}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "RECORD ARRIVAL"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-xl bg-indigo-600 text-white p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Package className="h-16 w-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-indigo-100">Total Batches</p>
                    <h4 className="text-3xl font-black mt-1">{batches.length}</h4>
                    <p className="text-xs text-indigo-200 mt-2 font-medium">Currently tracked</p>
                </Card>
                <Card className="border-none shadow-xl bg-orange-600 text-white p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock className="h-16 w-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-orange-100">Expiring Soon</p>
                    <h4 className="text-3xl font-black mt-1">{batches.filter(b => {
                        const days = Math.floor((new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        return days > 0 && days <= 14
                    }).length}</h4>
                    <p className="text-xs text-orange-200 mt-2 font-medium">Next 14 days</p>
                </Card>
                <Card className="border-none shadow-xl bg-rose-600 text-white p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertCircle className="h-16 w-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-rose-100">Overdue Expiries</p>
                    <h4 className="text-3xl font-black mt-1">{batches.filter(b => new Date(b.expiryDate) <= new Date()).length}</h4>
                    <p className="text-xs text-rose-200 mt-2 font-medium">Awaiting disposal</p>
                </Card>
                <Card className="border-none shadow-xl bg-emerald-600 text-white p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldAlert className="h-16 w-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-emerald-100">System Integrity</p>
                    <h4 className="text-3xl font-black mt-1">100%</h4>
                    <p className="text-xs text-emerald-200 mt-2 font-medium">Tracking coverage</p>
                </Card>
            </div>

            {/* Batch Ledger */}
            <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-800">Batch Ledger</CardTitle>
                        <CardDescription>Comprehensive list of all tracked product batches.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <Input placeholder="Search batch..." className="pl-10 h-11 w-64 rounded-xl border-slate-200 bg-white" />
                        </div>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-600">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-slate-50/30">
                        <TableRow className="hover:bg-transparent border-slate-50">
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 pl-8 h-12">Batch Info</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 h-12">Product</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 h-12">Quantity</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 h-12">Expiry</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 h-12">Status</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 h-12 text-right pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {batches.map(batch => {
                            const expiryDate = new Date(batch.expiryDate)
                            const isExpired = expiryDate <= new Date()
                            const daysLeft = Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

                            return (
                                <TableRow key={batch.id} className="group hover:bg-slate-50/30 border-slate-50">
                                    <TableCell className="pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{batch.batchNumber}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Arrived: {new Date(batch.arrivalDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-bold text-slate-700">{batch.product.name}</p>
                                        <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black">{batch.product.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900">{batch.quantity} Units</span>
                                            <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500"
                                                    style={{ width: `${(batch.quantity / batch.initialQuantity) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className={`text-sm font-black ${isExpired ? 'text-rose-600' : daysLeft < 14 ? 'text-orange-600' : 'text-slate-900'}`}>
                                            {isExpired ? 'EXPIRED' : `${daysLeft} days`}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">{expiryDate.toLocaleDateString()}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`border-none font-black text-[9px] uppercase ${isExpired ? 'bg-rose-50 text-rose-600' :
                                            daysLeft < 14 ? 'bg-orange-50 text-orange-600' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {isExpired ? 'CRITICAL' : daysLeft < 14 ? 'EXPIRING' : 'STABLE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:text-indigo-600">
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:text-rose-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
