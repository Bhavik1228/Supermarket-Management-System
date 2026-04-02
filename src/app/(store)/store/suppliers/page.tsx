"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus, Search, Truck, Phone, Mail, MapPin,
    MoreVertical, ExternalLink, Star, TrendingUp, AlertCircle,
    Loader2, Users, ShoppingBag
} from "lucide-react"
import { getSuppliers, createSupplier } from "@/app/actions/supplier"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const storeId = "store-freshmart"

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const res = await getSuppliers(storeId)
        if (res.success) {
            setSuppliers(res.suppliers || [])
        }
        setLoading(false)
    }

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Supplier Intelligence</h1>
                    <p className="text-slate-500 font-medium">Manage vendors, track reliability, and optimize your procurement.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Find a vendor..."
                            className="pl-10 rounded-2xl bg-slate-50 border-none h-11 focus-visible:ring-primary/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <AddSupplierDialog storeId={storeId} onCreated={loadData} />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[2rem] border-none shadow-lg bg-indigo-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-indigo-400">Total Vendors</p>
                                <p className="text-2xl font-black text-indigo-900">{suppliers.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-[2rem] border-none shadow-lg bg-emerald-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Star className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-emerald-400">Reliability</p>
                                <p className="text-2xl font-black text-emerald-900">94% AVG</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-[2rem] border-none shadow-lg bg-amber-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-amber-400">Outstanding</p>
                                <p className="text-2xl font-black text-amber-900">$12,450</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-[2rem] border-none shadow-lg bg-slate-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">PO Volume</p>
                                <p className="text-2xl font-black text-slate-900">42/mo</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Suppliers Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredSuppliers.map((supplier, idx) => (
                            <motion.div
                                key={supplier.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group rounded-[2.5rem] border-2 border-slate-50 hover:border-primary/20 hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
                                    <div className="h-2 bg-gradient-to-r from-primary/40 to-indigo-400/40" />
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-5">
                                                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 group-hover:bg-primary/5 flex items-center justify-center text-2xl font-black text-slate-400 group-hover:text-primary transition-colors">
                                                    {supplier.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{supplier.name}</h3>
                                                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 rounded-lg border-none mt-1 uppercase text-[9px] font-black tracking-widest">
                                                        {supplier.category || 'GENERAL VENDOR'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 justify-end text-emerald-600 font-black">
                                                    <Star className="h-4 w-4 fill-emerald-600" />
                                                    <span>{(supplier.reliability * 100).toFixed(0)}%</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Reliability Score</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mb-8 mt-2">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                                    <Mail className="h-4 w-4 text-slate-300" />
                                                    <span className="truncate">{supplier.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                                    <Phone className="h-4 w-4 text-slate-300" />
                                                    <span>{supplier.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                                    <MapPin className="h-4 w-4 text-slate-300" />
                                                    <span className="truncate">{supplier.address || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-emerald-600 font-bold">
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span>{supplier._count.products} Products Supplied</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Outstanding Payables</p>
                                                <p className="text-lg font-black text-slate-900">${supplier.payables.toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/store/inventory/purchase-orders?supplierId=${supplier.id}`}>
                                                    <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold border-slate-200">
                                                        PO HISTORY
                                                    </Button>
                                                </Link>
                                                <Button size="sm" className="rounded-xl h-10 px-6 font-bold bg-slate-900 hover:bg-black">
                                                    NEW ORDER
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

function AddSupplierDialog({ storeId, onCreated }: { storeId: string, onCreated: () => void }) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [category, setCategory] = useState("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit() {
        setLoading(true)
        const res = await createSupplier(storeId, { name, email, category })
        if (res.success) {
            onCreated()
            setOpen(false)
            setName("")
            setEmail("")
            setCategory("")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-11 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold px-6 shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-5 w-5" /> ONBOARD VENDOR
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Onboard New Supplier</DialogTitle>
                    <DialogDescription>Register a new vendor to start tracking procurement.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-slate-500 ml-1">Company Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-xl border-slate-100 h-12 text-lg font-medium"
                            placeholder="e.g. FreshProduce Co."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-slate-500 ml-1">Category</Label>
                        <Input
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-xl border-slate-100 h-12"
                            placeholder="e.g. Vegetables, Dairy"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-slate-500 ml-1">Contact Email</Label>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded-xl border-slate-100 h-12"
                            placeholder="vendor@example.com"
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        className="w-full h-14 rounded-2xl font-black text-lg bg-black hover:bg-slate-900"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        COMPLETE ONBOARDING
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
