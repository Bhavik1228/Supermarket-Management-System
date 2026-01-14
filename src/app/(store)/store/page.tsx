import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle,
    ArrowUpRight, Sparkles, Zap, ShieldAlert,
    BarChart3, Clock, ArrowRight, CheckCircle2,
    Users, Receipt, FileText, Settings, History,
    Truck, Wallet, HardDrive, LayoutDashboard,
    Activity, Lock, ShieldCheck
} from "lucide-react"
import Link from "next/link"
import {
    getDashboardStats,
    getLiveAlerts,
    getAIInsights,
    getApprovalRequests,
    getRecentAuditLogs,
    getFinanceStats,
    getStaffPerformance,
    getCustomerLoyaltyOverview
} from "@/app/actions/dashboard"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GeneratePOButton } from "@/components/dashboard/GeneratePOButton"
import { AdCarousel } from "@/components/store/AdCarousel"

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount)
}

export default async function StoreDashboardPage() {
    const storeId = "store-freshmart"

    // Parallel data fetching for performance
    const [
        statsRes, alertsRes, insightsRes,
        approvalsRes, auditRes, financeRes,
        staffRes, loyaltyRes
    ] = await Promise.all([
        getDashboardStats(storeId),
        getLiveAlerts(storeId),
        getAIInsights(storeId),
        getApprovalRequests(storeId),
        getRecentAuditLogs(storeId),
        getFinanceStats(storeId),
        getStaffPerformance(storeId),
        getCustomerLoyaltyOverview(storeId)
    ])

    const stats = statsRes.stats || { revenue: 0, profit: 0, transactions: 0, pendingApprovals: 0, stockValue: 0 }
    const alerts = alertsRes.alerts || []
    const insights = insightsRes.insights || []
    const approvals = approvalsRes.requests || []
    const auditLogs = auditRes.logs || []
    const finance = financeRes.stats || { tax: 0, discounts: 0, netRevenue: 0, margin: "0%", marginValue: 0 }
    const staff = staffRes.staff || []
    const loyalty = loyaltyRes.stats || { totalMembers: 0, recentEnrollments: 0, activePoints: 0, redemptionRate: "0%" }

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            {/* Executive Health Ribbon */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-slate-950 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">COMMAND CENTER</h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">Sanskriti-Intelligence Business Engine v2.0</p>
                </div>

                <div className="flex flex-wrap items-center gap-10 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Gross Revenue</span>
                        <div className="text-2xl font-bold text-white tabular-nums">{formatCurrency(stats.revenue)}</div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Net Margin</span>
                        <div className="text-2xl font-bold text-blue-400 tabular-nums">{finance.margin}</div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Operations</span>
                        <div className="flex items-center gap-2">
                            <Badge className={`${stats.health === '98% HEALTH' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-transparent`}>{stats.health}</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 relative z-10">
                    <Link href="/store/owner-pos">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg ring-2 ring-primary/20">
                            <Zap className="mr-2 h-4 w-4 fill-white" /> LIVE TERMINAL
                        </Button>
                    </Link>
                </div>
            </div>

            <AdCarousel />

            <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200 h-14">
                        <TabsTrigger value="overview" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <LayoutDashboard className="h-4 w-4 mr-2" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="operations" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Activity className="h-4 w-4 mr-2" /> Operations
                        </TabsTrigger>
                        <TabsTrigger value="finance" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Wallet className="h-4 w-4 mr-2" /> Finance
                        </TabsTrigger>
                        <TabsTrigger value="governance" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <ShieldCheck className="h-4 w-4 mr-2" /> Governance
                        </TabsTrigger>
                    </TabsList>

                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/store/reports">
                            <Button variant="outline" className="rounded-xl border-slate-200">
                                <FileText className="h-4 w-4 mr-2" /> Reports
                            </Button>
                        </Link>
                        <Link href="/store/settings">
                            <Button variant="outline" className="rounded-xl border-slate-200">
                                <Settings className="h-4 w-4 mr-2" /> Config
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* --- OVERVIEW TAB --- */}
                <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-bottom-2">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Alert Center */}
                        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-red-500" /> Operational Alerts
                                </CardTitle>
                                <Badge variant="outline" className="bg-red-50 text-red-600 animate-pulse">Live</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {alerts.length === 0 ? (
                                    <p className="text-center text-slate-400 py-4">No critical issues detected.</p>
                                ) : (
                                    alerts.map(alert => (
                                        <div key={alert.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                            <div className="mt-1">
                                                {alert.type === 'CRITICAL' ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-amber-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-800">{alert.message}</p>
                                                <Link href="/store/support">
                                                    <button className="text-[10px] text-primary hover:underline font-bold mt-1">RESPOND NOW</button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Trends */}
                        <Card className="lg:col-span-2 border-none shadow-xl bg-gradient-to-br from-primary/5 to-blue-500/5">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                                    <Sparkles className="h-5 w-5 fill-primary" /> Strategic Intelligence Insights
                                </CardTitle>
                                <CardDescription>Behavioral analysis & Predictive optimization</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {insights.map(item => (
                                        <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/30 transition-all hover:shadow-lg group">
                                            <div className="flex justify-between items-center mb-3">
                                                <Badge className={`${item.impact === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} `}>
                                                    {item.impact} IMPACT
                                                </Badge>
                                            </div>
                                            <h4 className="font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                                            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{item.description}</p>
                                            <Button variant="ghost" size="sm" className="w-full text-[10px] font-black h-8 hover:bg-primary hover:text-white">AUTO-OPTIMIZE</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Snapshot Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="p-6 bg-white border-none shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center">
                                    <ShoppingCart className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Checkout Speed</p>
                                    <p className="text-xl font-black text-slate-900">2.4m avg</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-white border-none shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Member Growth</p>
                                    <p className="text-xl font-black text-slate-900">+{loyalty.recentEnrollments}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-white border-none shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">In-Stock Rate</p>
                                    <p className="text-xl font-black text-slate-900">{stats.inStockRate}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-white border-none shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sales Velocity</p>
                                    <p className="text-xl font-black text-slate-900">{stats.revenue > 1000 ? 'High' : stats.revenue > 0 ? 'Normal' : 'Low'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- OPERATIONS TAB --- */}
                <TabsContent value="operations" className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Supply Chain & Purchase Management */}
                        <Card className="border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-indigo-600" /> Supply & Purchase Flow
                                    </div>
                                    <Link href="/store/inventory/purchase-orders">
                                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer border-transparent">History</Badge>
                                    </Link>
                                </CardTitle>
                                <CardDescription>Supplier orders and inbound logistics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tighter">
                                        <span className="text-slate-500">Stock Reorder Progress</span>
                                        <span className="text-indigo-600">75%</span>
                                    </div>
                                    <Progress value={75} className="h-2 bg-slate-100" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                        <p className="text-[10px] text-indigo-400 font-black uppercase">Pending Orders</p>
                                        <p className="text-2xl font-black text-indigo-900">{stats.pendingApprovals}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-black uppercase">Due Tomorrow</p>
                                        <p className="text-2xl font-black text-slate-900">4</p>
                                    </div>
                                </div>
                                <GeneratePOButton />
                            </CardContent>
                        </Card>

                        {/* Staff & Roster Control */}
                        <Card className="border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-emerald-600" /> Human Capital Oversight
                                </CardTitle>
                                <CardDescription>Staff efficiency & attendance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {staff.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black">{member.role}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-800">{formatCurrency(member.sales)}</p>
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px]">{member.speed}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- FINANCE TAB --- */}
                <TabsContent value="finance" className="space-y-6 animate-in slide-in-from-left-4">
                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Financial Control & Compliance</CardTitle>
                            <CardDescription>Comprehensive revenue, tax, and margin analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-3 mb-8">
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-slate-400 uppercase">Gross Revenue</p>
                                    <p className="text-3xl font-black text-slate-900 tabular-nums">{formatCurrency(stats.revenue)}</p>
                                    <p className="text-[10px] text-green-600 font-bold flex items-center">
                                        <ArrowUpRight className="h-3 w-3 mr-1" /> 8.4% vs same day last week
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-slate-400 uppercase">Tax Collections</p>
                                    <p className="text-3xl font-black text-slate-900 tabular-nums">{formatCurrency(finance.tax)}</p>
                                    <p className="text-[10px] text-slate-400">Allocated for Q4 filing</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-slate-400 uppercase">Discount Volume</p>
                                    <p className="text-3xl font-black text-red-600 tabular-nums">({formatCurrency(finance.discounts)})</p>
                                    <p className="text-[10px] text-slate-400 font-bold">4.2% of total sales</p>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 border-none">
                                        <TableHead className="font-black text-[10px] uppercase text-slate-400">Indicator</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-400">Current</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-400">Projected</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-400 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-bold">Net Profit Margin (%)</TableCell>
                                        <TableCell>{finance.margin}</TableCell>
                                        <TableCell>Target: 15%</TableCell>
                                        <TableCell className="text-right">
                                            <Badge className="bg-green-100 text-green-700">STABLE</Badge>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-bold">Cash in Hand (Counter)</TableCell>
                                        <TableCell>$4,250.00</TableCell>
                                        <TableCell>$6,000.00</TableCell>
                                        <TableCell className="text-right">
                                            <Badge className="bg-amber-100 text-amber-700">COLLECT SOON</Badge>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- GOVERNANCE TAB (Approvals & Audits) --- */}
                <TabsContent value="governance" className="space-y-6 animate-in slide-in-from-bottom-4">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Approval Center */}
                        <Card className="border-none shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Approval & Override Center</CardTitle>
                                    <CardDescription>Manage real-time overrides from POS</CardDescription>
                                </div>
                                <Badge className="bg-amber-500 text-white border-none">{approvals.length} PENDING</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {approvals.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400 flex flex-col items-center">
                                            <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                                            <p className="text-sm">Queues cleared. No overrides requested.</p>
                                        </div>
                                    ) : (
                                        approvals.map(req => (
                                            <div key={req.id} className="p-4 rounded-2xl border-2 border-slate-50 bg-white shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                                        <Zap className="h-5 w-5 fill-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">{req.subject}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Requested by {req.user.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50">DENY</Button>
                                                    <Button size="sm" className="rounded-xl font-bold bg-green-600 hover:bg-green-700">APPROVE</Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Audit Feed */}
                        <Card className="border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-slate-700" /> Security Audit Feed
                                </CardTitle>
                                <CardDescription>Real-time log of privileged activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[300px] pr-4">
                                    <div className="space-y-4">
                                        {auditLogs.map(log => (
                                            <div key={log.id} className="flex gap-4 group">
                                                <div className="mt-1">
                                                    <div className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-primary transition-colors mt-1.5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm text-slate-800 font-medium"> <span className="font-bold text-slate-950">{log.action}</span> - {log.details}</p>
                                                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                                                        <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                                        <span className="flex items-center gap-1">
                                                            <History className="h-2.5 w-2.5" /> {log.userEmail}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
