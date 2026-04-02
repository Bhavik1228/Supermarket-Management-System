"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BarChart3,
    Calendar,
    Filter,
    FileText,
    Download,
    Mail,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Loader2,
    Search,
    Package,
    Users,
    Activity,
    AlertTriangle,
    Printer,
    Building2,
    TrendingUp,
    Store
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { generateReportData, getPlatformSummary } from "@/app/actions/reports"
import { ReportType, ReportFilter } from "@/types/reports"
import { cn } from "@/lib/utils"

export default function AdminReportsPage() {
    const { toast } = useToast()
    const [summary, setSummary] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<ReportFilter>({
        dateRange: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }
    })

    useEffect(() => {
        loadSummary()
    }, [])

    const loadSummary = async () => {
        setLoading(true)
        const res = await getPlatformSummary(filters)
        if (res.success) setSummary(res.data || [])
        setLoading(false)
    }

    const totalRevenue = summary.reduce((a, b) => a + (b.revenue || 0), 0)
    const bestStore = summary.length > 0 ? [...summary].sort((a, b) => (b.orders || 0) - (a.orders || 0))[0].name : "N/A"

    return (
        <div className="max-w-7xl mx-auto p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic uppercase">Platform Intelligence</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Security & Analytics Division</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50">
                        <Calendar className="mr-2 h-4 w-4" /> Global Filter
                    </Button>
                    <Button className="h-14 px-8 rounded-2xl bg-slate-900 shadow-2xl shadow-slate-200 font-bold uppercase tracking-widest text-[10px]">
                        <Activity className="mr-2 h-4 w-4" /> System Audit
                    </Button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="border-slate-100 shadow-xl rounded-[2.5rem] bg-white group hover:-translate-y-1 transition-all">
                    <CardContent className="p-8 space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">${totalRevenue.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-xl rounded-[2.5rem] bg-white group hover:-translate-y-1 transition-all">
                    <CardContent className="p-8 space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Store className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Stores</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{summary.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-xl rounded-[2.5rem] bg-white group hover:-translate-y-1 transition-all">
                    <CardContent className="p-8 space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Activity className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Leader</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter truncate">{bestStore}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-xl rounded-[2.5rem] bg-white group hover:-translate-y-1 transition-all">
                    <CardContent className="p-8 space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Status</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">Operational</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Store Performance Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3 italic">
                        <Building2 className="h-6 w-6 text-slate-400" /> Managed Node Performance
                    </h2>
                    <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">View Infrastructure Map</Button>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {summary.map((store) => (
                            <Card key={store.id} className="border-slate-100 shadow-2xl shadow-slate-200/40 rounded-[3rem] overflow-hidden bg-white/50 backdrop-blur-xl">
                                <CardContent className="p-10 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{store.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store ID: {store.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[9px] uppercase tracking-widest">Active</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Rev Node</p>
                                            <p className="text-xl font-black text-slate-900">${(store.revenue || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Total Orders</p>
                                            <p className="text-xl font-black text-slate-900">{store.orders || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Button className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[9px] shadow-xl shadow-slate-200">
                                            Access Terminal
                                        </Button>
                                        <Button variant="outline" className="w-full h-12 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold uppercase tracking-widest text-[9px] hover:bg-slate-50">
                                            Generate Audit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Platform Health Logic */}
            <Card className="border-slate-900/5 bg-slate-900 text-white rounded-[4rem] p-16 overflow-hidden relative group shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                    <div className="space-y-6 max-w-2xl">
                        <div className="h-10 w-40 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                            <p className="text-[10px] font-black uppercase tracking-widest">System Integrity</p>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Global Platform Synchronization</h2>
                        <p className="text-lg text-slate-400 font-medium">Coordinate cross-store report generation and automated delivery schedules for the entire ecosystem.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Button className="h-16 px-10 rounded-[2rem] bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/50">
                            Launch Global Audit
                        </Button>
                        <Button className="h-16 px-10 rounded-[2rem] bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-xs">
                            Manage Schedules
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
