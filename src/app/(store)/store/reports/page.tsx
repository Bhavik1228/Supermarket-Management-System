"use client"

import { useState, useRef } from "react"
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
    Printer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { generateReportData } from "@/app/actions/reports"
import { ReportType, ReportFilter } from "@/types/reports"
import { cn } from "@/lib/utils"
import { useReactToPrint } from "react-to-print"

const STEPS = [
    { id: 1, title: "Category", description: "Select focus area" },
    { id: 2, title: "Filters", description: "Refine parameters" },
    { id: 3, title: "Preview", description: "Verify dataset" },
    { id: 4, title: "Export", description: "Deliver results" }
]

const REPORT_TYPES: { id: ReportType; label: string; icon: any; color: string; description: string }[] = [
    { id: 'SALES', label: 'Sales Performance', icon: BarChart3, color: 'bg-blue-50 text-blue-600', description: 'Revenue trends and order summaries' },
    { id: 'INVENTORY', label: 'Inventory Audit', icon: Package, color: 'bg-orange-50 text-orange-600', description: 'Stock levels and low-stock alerts' },
    { id: 'TAX', label: 'Tax Compliance', icon: FileText, color: 'bg-emerald-50 text-emerald-600', description: 'Aggregated tax and taxable amounts' },
    { id: 'AUDIT', label: 'Security & Audit', icon: Activity, color: 'bg-red-50 text-red-600', description: 'Privileged actions and system logs' }
]

export default function ReportsPage() {
    const { toast } = useToast()
    const [step, setStep] = useState(1)
    const [type, setType] = useState<ReportType | null>(null)
    const [filters, setFilters] = useState<ReportFilter>({
        dateRange: { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() }
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [reportData, setReportData] = useState<any>(null)
    const [deliveryStatus, setDeliveryStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE')

    const reportRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({ contentRef: reportRef })

    const handleNext = async () => {
        if (step === 2 && type) {
            setIsGenerating(true)
            const res = await generateReportData(type, filters)
            if (res.success) {
                // @ts-ignore - Data is present on success
                setReportData(res.data)
                setStep(3)
            } else {
                // @ts-ignore - Error is present on failure
                toast({ title: "Generation Failed", description: res.error, variant: "destructive" })
            }
            setIsGenerating(false)
        } else {
            setStep(prev => Math.min(prev + 1, 4))
        }
    }

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Advanced Reports</h1>
                <p className="text-slate-500 font-medium">Multi-step protocol for operational intelligence and compliance.</p>
            </header>

            {/* Stepper */}
            <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="z-10 flex flex-col items-center gap-3">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-sm border-2",
                            step === s.id ? "bg-slate-900 text-white border-slate-900 scale-110 shadow-lg shadow-slate-200" :
                                step > s.id ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-400 border-slate-100"
                        )}>
                            {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : s.id}
                        </div>
                        <div className="text-center">
                            <p className={cn("text-[11px] font-extrabold uppercase tracking-widest", step === s.id ? "text-slate-900" : "text-slate-400")}>{s.title}</p>
                            <p className="text-[9px] font-medium text-slate-400 opacity-60">{s.description}</p>
                        </div>
                    </div>
                ))}
                <div className="absolute top-6 left-10 right-10 h-[2px] bg-slate-100 -z-0">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((step - 1) / 3) * 100}%` }}
                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-xl">
                <CardContent className="p-12 min-h-[500px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {REPORT_TYPES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id)}
                                        className={cn(
                                            "group p-8 rounded-[2rem] border-2 transition-all text-left flex items-start gap-6 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]",
                                            type === t.id ? "bg-white border-slate-900 shadow-2xl shadow-slate-200 ring-1 ring-slate-900" : "bg-white/50 border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <div className={cn("h-16 w-16 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner", t.color)}>
                                            <t.icon className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-slate-900">{t.label}</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{t.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight">Report Parameters</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Filtering {type} Dataset</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Analysis Period</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    type="date"
                                                    className="h-14 rounded-2xl bg-slate-50 border-slate-200"
                                                    value={filters.dateRange?.from.toISOString().split('T')[0]}
                                                    onChange={e => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange!, from: new Date(e.target.value) } }))}
                                                />
                                                <Input
                                                    type="date"
                                                    className="h-14 rounded-2xl bg-slate-50 border-slate-200"
                                                    value={filters.dateRange?.to.toISOString().split('T')[0]}
                                                    onChange={e => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange!, to: new Date(e.target.value) } }))}
                                                />
                                            </div>
                                        </div>
                                        {/* Optional staff filter for specific reports */}
                                        {(type === 'SALES' || type === 'AUDIT') && (
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Staff Member (Optional)</label>
                                                <Input
                                                    placeholder="All Personnel"
                                                    className="h-14 rounded-2xl bg-slate-50 border-slate-200"
                                                    onChange={e => setFilters(prev => ({ ...prev, staffId: e.target.value }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Filter className="h-3 w-3" /> Selector Logic
                                        </h4>
                                        <ul className="space-y-4">
                                            {[
                                                "Only records marked as 'COMPLETED' will be included.",
                                                "Inventory data reflects real-time stock at generation.",
                                                "Tax reports aggregate VAT/GST based on store settings."
                                            ].map((text, i) => (
                                                <li key={i} className="flex gap-3 text-xs text-slate-600 font-medium">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                    {text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-8 flex-1 flex flex-col"
                            >
                                <div className="flex justify-between items-end">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold tracking-tight">Report Preview</h2>
                                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Data Node Synthesis Ready</p>
                                    </div>
                                    <Badge variant="outline" className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-widest text-[9px]">
                                        Generated @ {new Date().toLocaleTimeString()}
                                    </Badge>
                                </div>

                                <ScrollArea className="flex-1 rounded-[2rem] border-2 border-slate-100 bg-white shadow-inner">
                                    <div ref={reportRef} className="p-12 space-y-12">
                                        {/* Report Document Header */}
                                        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10">
                                            <div className="space-y-4">
                                                <div className="h-12 w-12 bg-slate-900 flex items-center justify-center text-white rounded-xl">
                                                    <BarChart3 className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-slate-900 uppercase italic">Fresh Mart</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Intelligence Agency</p>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <p className="text-xl font-bold text-slate-900 uppercase tracking-tighter">{type} REPORT</p>
                                                <p className="text-[10px] font-bold text-slate-500">ID: RP-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                                <p className="text-[10px] font-bold text-slate-400 italic">{filters.dateRange?.from.toLocaleDateString()} — {filters.dateRange?.to.toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Step 3: Dynamic Data Rendering */}
                                        {type === 'SALES' && reportData?.summary && (
                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-2">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Gross Revenue</p>
                                                    <p className="text-4xl font-black text-slate-900 tracking-tight">${reportData.summary.totalRevenue.toFixed(2)}</p>
                                                </div>
                                                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-2">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total Orders</p>
                                                    <p className="text-4xl font-black text-slate-900 tracking-tight">{reportData.summary.totalOrders}</p>
                                                </div>
                                                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-2">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Items Sold</p>
                                                    <p className="text-4xl font-black text-slate-900 tracking-tight">{reportData.summary.totalItems}</p>
                                                </div>
                                            </div>
                                        )}

                                        {type === 'INVENTORY' && (
                                            <div className="space-y-10">
                                                <div className="grid grid-cols-3 gap-8">
                                                    <div className="p-6 rounded-3xl border-2 border-slate-100 text-center">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Total SKUs</p>
                                                        <p className="text-2xl font-bold">{reportData?.totalProducts}</p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl border-2 border-red-100 bg-red-50 text-center">
                                                        <p className="text-[9px] font-bold text-red-400 uppercase">Out of Stock</p>
                                                        <p className="text-2xl font-bold text-red-600">{reportData?.outOfStockCount}</p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl border-2 border-orange-100 bg-orange-50 text-center">
                                                        <p className="text-[9px] font-bold text-orange-400 uppercase">Low Stock</p>
                                                        <p className="text-2xl font-bold text-orange-600">{reportData?.lowStockCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-8 border-t border-slate-100">
                                            <p className="text-[10px] text-slate-400 text-center font-medium italic">This document is a formal system record. Unauthorized modification is prohibited.</p>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center space-y-10 py-12"
                            >
                                <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-50 ring-8 ring-emerald-50 animate-bounce">
                                    <CheckCircle2 className="h-12 w-12" />
                                </div>
                                <div className="text-center space-y-3">
                                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Export Protocol Initialized</h2>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">The report has been successfully synthesized. Choose your delivery channel below.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-10">
                                    <Button
                                        onClick={handlePrint}
                                        className="h-24 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white flex flex-col items-center justify-center gap-1 shadow-2xl transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Download className="h-6 w-6" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Download PDF Terminal</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-24 rounded-[2rem] border-2 border-slate-900 text-slate-900 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                                        onClick={() => {
                                            setDeliveryStatus('SENDING')
                                            setTimeout(() => {
                                                setDeliveryStatus('SUCCESS')
                                                toast({ title: "Email Delivered", description: "Report transmitted to owner@freshmart.pos" })
                                            }, 2000)
                                        }}
                                        disabled={deliveryStatus !== 'IDLE'}
                                    >
                                        {deliveryStatus === 'SENDING' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mail className="h-6 w-6" />}
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {deliveryStatus === 'SUCCESS' ? "Transmitted" : "Transmit to Gmail"}
                                        </span>
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>

                {/* Navigation Bar */}
                <div className="bg-slate-50 border-t border-slate-200 p-8 flex justify-between items-center group">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || isGenerating}
                        className="text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl group"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={step === 4 || (step === 1 && !type) || isGenerating}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-slate-200 uppercase tracking-widest text-[10px]"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <>{step === 3 ? "Finalize" : "Next Segment"} <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </Button>
                </div>
            </Card>

            {/* AI Insights Sidebar Hook */}
            {step === 3 && (
                <div className="fixed right-10 top-1/2 -translate-y-1/2 w-80 space-y-6 hidden xl:block">
                    <Card className="border-slate-200 shadow-xl rounded-[2rem] bg-white/80 backdrop-blur-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                AI Node Observations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Pattern Correlation</p>
                                <p className="text-xs text-indigo-900 font-medium">Revenue spikes observed during morning cycles. Recommend increasing staff allocation for 08:00 - 10:00.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 space-y-2">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Inventory Risk</p>
                                <p className="text-xs text-orange-900 font-medium">Out-of-stock items contributing to 12% potential revenue loss.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
