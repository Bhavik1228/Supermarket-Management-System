"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    History, Users, Award, TrendingUp, Search,
    ArrowLeft, Loader2, Download, Filter,
    CheckCircle2, AlertCircle, ShoppingBag, PlusCircle
} from "lucide-react"
import { getGlobalLoyaltyHistory, getLoyaltyAccounts, manualAdjustPoints } from "@/app/actions/loyalty"
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

export default function LoyaltyHistoryPage() {
    const { toast } = useToast()
    const [transactions, setTransactions] = useState<any[]>([])
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAdjustOpen, setIsAdjustOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<any>(null)
    const [adjustment, setAdjustment] = useState({ points: "", reason: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [hRes, aRes] = await Promise.all([
            getGlobalLoyaltyHistory(),
            getLoyaltyAccounts()
        ])
        if (hRes.success) setTransactions(hRes.transactions || [])
        if (aRes.success) setAccounts(aRes.accounts || [])
        setLoading(false)
    }

    const handleAdjust = async () => {
        if (!selectedAccount || !adjustment.points || adjustment.reason.length < 10) return
        setIsSubmitting(true)

        // Using a dummy staff ID for now, in a real app this would be the logged-in user's ID
        const res = await manualAdjustPoints(
            selectedAccount.id,
            parseInt(adjustment.points),
            adjustment.reason,
            "owner-system-id" // Placeholder
        )

        setIsSubmitting(false)
        if (res.success) {
            toast({ title: "Points Adjusted", description: "The customer's balance has been successfully updated." })
            setIsAdjustOpen(false)
            setAdjustment({ points: "", reason: "" })
            loadData()
        } else {
            toast({ variant: "destructive", title: "Adjustment Failed", description: res.error })
        }
    }

    const filteredTransactions = transactions.filter(t =>
        t.account.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/store/loyalty">
                        <Button variant="ghost" size="icon" className="rounded-2xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900">Loyalty 360 Hub</h2>
                        <p className="text-slate-500 font-medium">Audit every point. Manage every redemption.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 px-6 rounded-2xl border-slate-200 font-bold gap-2">
                        <Download className="h-4 w-4" /> Export Ledger
                    </Button>
                </div>
            </div>

            {/* Insight Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                        <History className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 font-bold uppercase text-[10px]">Movement Today</CardDescription>
                        <CardTitle className="text-3xl font-black">+{transactions.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString() && t.points > 0).reduce((acc, t) => acc + t.points, 0).toLocaleString()} pts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-500 font-medium">Total points generated today</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                        <ShoppingBag className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-indigo-100 font-bold uppercase text-[10px]">Redemption Velocity</CardDescription>
                        <CardTitle className="text-3xl font-black">{transactions.filter(t => t.type === 'REDEEM').length} claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-indigo-200 font-medium">In the last 100 activities</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl bg-white border-2 border-slate-50 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                        <Award className="h-20 w-20 text-slate-900" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 font-bold uppercase text-[10px]">Loyalty Base</CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-900">{accounts.length} units</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-500 font-medium">Total active loyalty accounts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ledger Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800">Transactional Ledger</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search ledger..."
                                    className="pl-10 h-10 w-64 rounded-xl border-slate-100 bg-white"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] pl-6">Timestamp</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px]">Customer</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px]">Type</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px]">Delta</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] text-right pr-6">Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map(t => (
                                    <TableRow key={t.id} className="group hover:bg-slate-50/50 border-slate-50">
                                        <TableCell className="pl-6">
                                            <p className="text-xs font-bold text-slate-900">{new Date(t.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleTimeString()}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                                                    {t.account.user.name[0]}
                                                </div>
                                                <p className="text-xs font-bold text-slate-700">{t.account.user.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`border-none font-black text-[9px] uppercase ${t.type === 'EARN' ? 'bg-emerald-50 text-emerald-600' :
                                                    t.type === 'REDEEM' ? 'bg-indigo-50 text-indigo-600' :
                                                        'bg-amber-50 text-amber-600'
                                                }`}>
                                                {t.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-black text-xs ${t.points > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {t.points > 0 ? '+' : ''}{t.points}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 max-w-[200px] truncate">
                                            <span className="text-[10px] text-slate-500 font-medium italic">{t.description}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* Right Column: Account Management */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800">Account Adjuster</h3>
                        <Badge className="bg-amber-500 text-white border-none font-bold">MANAGEMENT</Badge>
                    </div>

                    <Card className="border-none shadow-2xl rounded-[2rem] bg-white p-6 space-y-6">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase text-slate-400">Search Account to Adjust</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <Input placeholder="Email or Name..." className="pl-10 rounded-2xl border-slate-100" />
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {accounts.map(account => (
                                <div key={account.id} className="p-4 rounded-3xl border border-slate-50 bg-slate-50/30 flex items-center justify-between group hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-900 border border-slate-100">
                                            {account.user.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{account.user.name}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold text-[8px] h-4">
                                                    {account.pointsBalance} PTS
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 font-medium">{account.tier?.name || 'Member'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl h-10 w-10 hover:bg-white hover:text-indigo-600"
                                        onClick={() => {
                                            setSelectedAccount(account)
                                            setIsAdjustOpen(true)
                                        }}
                                    >
                                        <PlusCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="border-none shadow-xl bg-indigo-900 text-white rounded-[2rem] p-8 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h4 className="text-xl font-black">Points Inflation Audit</h4>
                        <p className="text-sm text-indigo-200 leading-relaxed italic">
                            System indicates points generation has increased **12.4%** since last week. Redemption rate remains stable at **89%**.
                        </p>
                        <div className="pt-4">
                            <Button className="w-full h-12 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-black">
                                VIEW ANALYTICS
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Adjust Points Dialog */}
            <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
                <DialogContent className="rounded-3xl border-none shadow-2xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Manual Adjustment</DialogTitle>
                        <DialogDescription>Apply manual points adjustment to **{selectedAccount?.user.name}**.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400">Current Balance</p>
                            <p className="text-lg font-black text-indigo-600">{selectedAccount?.pointsBalance} PTS</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Adjustment Delta</label>
                            <Input
                                type="number"
                                placeholder="e.g. 500 or -200"
                                className="rounded-xl border-slate-100 h-11"
                                value={adjustment.points}
                                onChange={e => setAdjustment({ ...adjustment, points: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Reason (Min 10 chars)</label>
                            <Input
                                placeholder="Customer support override..."
                                className="rounded-xl border-slate-100 h-11"
                                value={adjustment.reason}
                                onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black font-black"
                            onClick={handleAdjust}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "EXECUTE ADJUSTMENT"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
