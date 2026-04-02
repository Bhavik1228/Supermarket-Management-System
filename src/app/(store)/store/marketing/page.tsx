"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Megaphone, Target, Users, TrendingUp, Sparkles,
    Plus, Search, Filter, Loader2, ArrowRight,
    Eye, MousePointer2, DollarSign
} from "lucide-react"
import { getCampaigns, createCampaign, getAdPerformanceStats } from "@/app/actions/ads"
import { useToast } from "@/components/ui/use-toast"
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

export default function MarketingPage() {
    const { toast } = useToast()
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newCampaign, setNewCampaign] = useState({
        name: "",
        client: "",
        placement: "DASHBOARD_TOP",
        budget: ""
    })
    const [isLaunching, setIsLaunching] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [cRes, sRes] = await Promise.all([
            getCampaigns(),
            getAdPerformanceStats()
        ])
        if (cRes.success) setCampaigns(cRes.campaigns || [])
        if (sRes.success) setStats(sRes.stats)
        setLoading(false)
    }

    const handleLaunch = async () => {
        if (!newCampaign.name || !newCampaign.client) return
        setIsLaunching(true)
        const res = await createCampaign({
            ...newCampaign,
            budget: parseFloat(newCampaign.budget) || 0
        })
        setIsLaunching(false)
        if (res.success) {
            toast({ title: "Campaign Launched!", description: "Your new marketing campaign is now active." })
            setIsCreateOpen(false)
            setNewCampaign({ name: "", client: "", placement: "DASHBOARD_TOP", budget: "" })
            loadData()
        }
    }

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Premium Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900">Campaign Hub</h2>
                    <p className="text-slate-500 font-medium">Broadcast your brand. Drive your growth.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 gap-2">
                            <Plus className="h-5 w-5" /> Launch Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-none shadow-2xl max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Launch Ad Wizard</DialogTitle>
                            <DialogDescription>Create a high-impact advertisement for your store.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400">Campaign Name</label>
                                <Input
                                    placeholder="e.g. Summer Weekend Sale"
                                    className="rounded-xl border-slate-100 h-11"
                                    value={newCampaign.name}
                                    onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400">Client / Brand</label>
                                <Input
                                    placeholder="e.g. Coca-Cola"
                                    className="rounded-xl border-slate-100 h-11"
                                    value={newCampaign.client}
                                    onChange={e => setNewCampaign({ ...newCampaign, client: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Placement</label>
                                    <Select
                                        value={newCampaign.placement}
                                        onValueChange={v => setNewCampaign({ ...newCampaign, placement: v })}
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-100 h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DASHBOARD_TOP">Dashboard Top</SelectItem>
                                            <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                                            <SelectItem value="CHECKOUT">Checkout Screen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Budget ($)</label>
                                    <Input
                                        type="number"
                                        placeholder="500.00"
                                        className="rounded-xl border-slate-100 h-11"
                                        value={newCampaign.budget}
                                        onChange={e => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black font-bold"
                                onClick={handleLaunch}
                                disabled={isLaunching}
                            >
                                {isLaunching ? <Loader2 className="h-5 w-5 animate-spin" /> : "PROCEED TO LAUNCH"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Eye className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-indigo-100 font-bold uppercase text-[10px]">Total Breadth</CardDescription>
                        <CardTitle className="text-3xl font-black">{stats?.totalImpressions.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-indigo-200">Total Ad Impressions</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl bg-emerald-600 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <MousePointer2 className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-100 font-bold uppercase text-[10px]">Engagement</CardDescription>
                        <CardTitle className="text-3xl font-black">{stats?.totalClicks.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-emerald-200">Total Ad Clicks</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl bg-amber-600 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-100 font-bold uppercase text-[10px]">Pool Value</CardDescription>
                        <CardTitle className="text-3xl font-black">${stats?.totalBudget.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-amber-200">Total Marketing Revenue</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Megaphone className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 font-bold uppercase text-[10px]">Active Wave</CardDescription>
                        <CardTitle className="text-3xl font-black">{stats?.activeCount}/{stats?.campaignCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-500">Running Campaigns</p>
                    </CardContent>
                </Card>
            </div>

            {/* Campaign List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800">Dynamic Board</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-10 w-10">
                                <Search className="h-4 w-4 text-slate-400" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-10 w-10">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {campaigns.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                <Megaphone className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">No campaigns found. Launch your first ad.</p>
                            </div>
                        ) : (
                            campaigns.map(cam => (
                                <Card key={cam.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden group">
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <Target className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-slate-900">{cam.name}</h4>
                                                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] uppercase">{cam.status}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-400 font-medium">For {cam.client} • {cam.placement.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">${cam.revenue.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Budget</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-50 px-6 py-4 bg-slate-50/30 grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-400">Impressions</p>
                                            <p className="font-bold text-slate-700">{cam.impressions}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-400">Clicks</p>
                                            <p className="font-bold text-slate-700">{cam.clicks}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-400">Engagement</p>
                                            <p className="font-bold text-emerald-600">{cam.impressions > 0 ? ((cam.clicks / cam.impressions) * 100).toFixed(1) : 0}%</p>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Intelligence Side Column */}
                <div className="space-y-6">
                    <Card className="border-none shadow-2xl bg-indigo-900 text-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-8">
                            <CardTitle className="text-2xl font-black flex items-center gap-3">
                                <Sparkles className="h-6 w-6 text-amber-400" /> Ad Intelligence
                            </CardTitle>
                            <CardDescription className="text-indigo-300 font-medium italic">Gemini-powered placement insights</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="p-6 rounded-3xl bg-white/10 border border-white/10 space-y-3">
                                <h5 className="font-black text-white flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-400" /> Optimal Placement
                                </h5>
                                <p className="text-sm text-indigo-100 leading-relaxed">
                                    Based on current traffic patterns, ads in **DASHBOARD_TOP** are seeing a 14% higher engagement rate between 5 PM and 8 PM GMT.
                                </p>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/10 border border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-black uppercase text-indigo-300">Audience Density</p>
                                    <Badge className="bg-amber-400/20 text-amber-400 border-none font-bold">PEAK</Badge>
                                </div>
                                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 w-[85%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                                </div>
                                <p className="text-[10px] text-indigo-200">System predicts 2,400+ unique impressions in the next 4 hours.</p>
                            </div>
                            <Button className="w-full h-14 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-black text-sm uppercase tracking-widest gap-2">
                                VIEW HEATMAP <ArrowRight className="h-5 w-5" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-black text-slate-800">Top Brand Partners</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: "PepsiCo", revenue: 4500, count: 12 },
                                { name: "Unilever", revenue: 3200, count: 8 },
                                { name: "Nestle", revenue: 2100, count: 5 }
                            ].map(brand => (
                                <div key={brand.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-black text-slate-800 shadow-sm">
                                            {brand.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{brand.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{brand.count} Campaigns</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-slate-900">${brand.revenue.toLocaleString()}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
