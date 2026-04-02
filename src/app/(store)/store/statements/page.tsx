"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Download, FileText, Users, ShoppingCart,
    Lock, Calendar, Loader2, CheckCircle2,
    Truck, History, FileSpreadsheet, AlertCircle
} from "lucide-react"
import {
    getTransactionStatementData,
    getStaffPerformanceStatementData,
    getAuditLogStatementData,
    getSupplierStatementData,
    getInventoryValuationStatement,
    getTaxLiabilityStatement
} from "@/app/actions/statements"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"
import { StatementTemplate } from "@/components/dashboard/StatementTemplate"

export default function StatementsPage() {
    const [days, setDays] = useState("30")
    const [format, setFormat] = useState<"csv" | "pdf">("csv")
    const [generating, setGenerating] = useState<string | null>(null)
    const [previewData, setPreviewData] = useState<{ title: string, data: any[], headers: string[] } | null>(null)
    const storeId = "store-freshmart"

    const printRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({ contentRef: printRef })

    async function handleDownload(type: string) {
        setGenerating(type)
        let res: any
        const dayVal = parseInt(days)

        try {
            switch (type) {
                case 'transactions':
                    res = await getTransactionStatementData(storeId, dayVal)
                    break
                case 'staff':
                    res = await getStaffPerformanceStatementData(storeId, dayVal)
                    break
                case 'audit':
                    res = await getAuditLogStatementData(storeId, dayVal)
                    break
                case 'suppliers':
                    res = await getSupplierStatementData(storeId, dayVal)
                    break
                case 'inventory':
                    res = await getInventoryValuationStatement(storeId)
                    break
                case 'tax':
                    res = await getTaxLiabilityStatement(storeId, dayVal)
                    break
            }

            if (res?.success) {
                if (format === "csv") {
                    const blob = new Blob([res.csv], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.setAttribute('hidden', '')
                    a.setAttribute('href', url)
                    a.setAttribute('download', res.filename)
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                } else {
                    // PDF Logic: Headers and Data for the template
                    const rows = res.csv.split('\n').filter(Boolean).map((line: string) => {
                        // Simple CSV parser
                        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
                        return parts.map(p => p.replace(/^"|"$/g, ''))
                    })
                    const headers = rows[0]
                    const data = rows.slice(1).map(r => {
                        const obj: any = {}
                        headers.forEach((h: string, i: number) => obj[h] = r[i])
                        return obj
                    })

                    const title = reportTypes.find(r => r.id === type)?.title || "Business Statement"
                    setPreviewData({ title, data, headers })

                    // Trigger print after state update
                    setTimeout(() => {
                        handlePrint()
                        setPreviewData(null)
                    }, 500)
                }
            }
        } catch (error) {
            console.error("Download failed:", error)
        } finally {
            setGenerating(null)
        }
    }

    const reportTypes = [
        {
            id: 'transactions',
            title: 'Transaction Statements',
            description: 'Complete history of sales, refunds, and payment methods.',
            icon: ShoppingCart,
            color: 'bg-blue-500',
            bg: 'bg-blue-50/50'
        },
        {
            id: 'staff',
            title: 'Staff Performance',
            description: 'Sales volume and processing speed metrics per cashier.',
            icon: Users,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50/50'
        },
        {
            id: 'audit',
            title: 'Security Audit Logs',
            description: 'Registry of all privileged actions and system configuration changes.',
            icon: Lock,
            color: 'bg-indigo-500',
            bg: 'bg-indigo-50/50'
        },
        {
            id: 'suppliers',
            title: 'Supplier Overview',
            description: 'Consolidated report of vendor activity and outstanding payables.',
            icon: Truck,
            color: 'bg-amber-500',
            bg: 'bg-amber-50/50'
        },
        {
            id: 'inventory',
            title: 'Inventory Valuation',
            description: 'Current market value of all stocked items based on purchase prices.',
            icon: Package,
            color: 'bg-purple-500',
            bg: 'bg-purple-50/50'
        },
        {
            id: 'tax',
            title: 'Tax Compliance',
            description: 'Summary of taxable sales and calculated periodic liabilities.',
            icon: FileText,
            color: 'bg-rose-500',
            bg: 'bg-rose-50/50'
        }
    ]

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            {/* Executive Header */}
            <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Reporting Engine v3.0</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight leading-tight">Unified <br /> Statements Hub</h1>
                        <p className="text-slate-400 text-lg max-w-md font-medium">Export business data into high-fidelity PDF or professional CSV formats.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-black/20 shadow-2xl space-y-4 min-w-[280px]">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-tighter text-slate-400">Time Spectrum</span>
                            </div>
                            <Select value={days} onValueChange={setDays}>
                                <SelectTrigger className="w-full bg-white/10 border-white/10 h-14 rounded-2xl text-lg font-bold">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white">
                                    <SelectItem value="7" className="rounded-xl focus:bg-primary font-bold">Last 7 Days</SelectItem>
                                    <SelectItem value="30" className="rounded-xl focus:bg-primary font-bold">Last 30 Days</SelectItem>
                                    <SelectItem value="90" className="rounded-xl focus:bg-primary font-bold">Last 90 Days</SelectItem>
                                    <SelectItem value="365" className="rounded-xl focus:bg-primary font-bold">Full Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-black/20 shadow-2xl space-y-4 min-w-[280px]">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-5 w-5 text-blue-400" />
                                <span className="text-xs font-black uppercase tracking-tighter text-slate-400">Output Interface</span>
                            </div>
                            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                                <SelectTrigger className="w-full bg-white/10 border-white/10 h-14 rounded-2xl text-lg font-bold">
                                    <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white">
                                    <SelectItem value="csv" className="rounded-xl focus:bg-primary font-bold">CSV Spreadsheet</SelectItem>
                                    <SelectItem value="pdf" className="rounded-xl focus:bg-primary font-bold">PDF Document</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <AnimatePresence>
                    {reportTypes.map((report, idx) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                        >
                            <Card className={`group relative overflow-hidden rounded-[3rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 ${report.bg}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                                <CardHeader className="p-10 pb-4">
                                    <div className={`h-16 w-16 rounded-[1.5rem] ${report.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                        <report.icon className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-2xl font-black text-slate-900 mb-2">{report.title}</CardTitle>
                                    <CardDescription className="text-slate-500 text-base font-medium leading-relaxed">
                                        {report.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-10 pt-0">
                                    <div className="flex items-center gap-4 mt-6">
                                        <Button
                                            onClick={() => handleDownload(report.id)}
                                            disabled={generating !== null}
                                            className="h-14 flex-1 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm tracking-wide shadow-xl"
                                        >
                                            {generating === report.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    COMPILING...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Download className="h-5 w-5" />
                                                    GENERATE {format.toUpperCase()} STATEMENT
                                                </div>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="mt-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center gap-1.5 text-blue-500">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {format === 'csv' ? 'RFC 4180 COMPLIANT' : 'PRINT READY PDF'}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <History className="h-3 w-3 text-indigo-500" />
                                            LEGACY SUPPORT
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer Notice */}
            <div className="mt-16 bg-blue-50/30 rounded-3xl p-8 border border-blue-100 flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-blue-500 shrink-0" />
                <div className="space-y-1">
                    <p className="font-bold text-slate-800">Compliance Notice</p>
                    <p className="text-sm text-slate-600">All generated statements are cryptographically hashed for audit trail integrity. Downloads are logged in the security audit feed. For multi-year archives, please visit the <span className="text-primary font-bold cursor-pointer hover:underline">Long-term Vault</span>.</p>
                </div>
            </div>
            {/* Hidden Print Container */}
            <div className="hidden">
                {previewData && (
                    <StatementTemplate
                        ref={printRef}
                        type="statement"
                        title={previewData.title}
                        days={days}
                        data={previewData.data}
                        headers={previewData.headers}
                    />
                )}
            </div>
        </div>
    )
}
