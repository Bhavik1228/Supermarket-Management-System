"use client"

import { useState, useEffect } from "react"
import { getCampaigns, getAdStats, createCampaign } from "@/app/actions/ads"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Megaphone, Plus, Search, TrendingUp, Users, Loader2 } from "lucide-react"

export default function AdsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [stats, setStats] = useState({ totalRevenue: 0, activeCount: 0, totalImpressions: 0 })
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newCampaign, setNewCampaign] = useState({ name: "", client: "", placement: "DASHBOARD_TOP" })

    useEffect(() => {
        loadData()
    }, [query])

    const loadData = async () => {
        setLoading(true)
        const [campRes, statsRes] = await Promise.all([
            getCampaigns(query),
            getAdStats()
        ])

        if (campRes.success) setCampaigns(campRes.campaigns || [])
        if (statsRes) setStats(statsRes)
        setLoading(false)
    }

    const handleCreate = async () => {
        if (!newCampaign.name || !newCampaign.client) {
            alert("Name and Client are required")
            return
        }

        await createCampaign(newCampaign)
        setIsCreateOpen(false)
        setNewCampaign({ name: "", client: "", placement: "DASHBOARD_TOP" })
        loadData()
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Ads & Sponsorships</h2>
                    <p className="text-muted-foreground">Manage platform-wide advertisements and sponsor placements.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Ad Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Campaign</DialogTitle>
                            <DialogDescription>Launch a new advertisement on the platform.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input
                                    className="col-span-3"
                                    value={newCampaign.name}
                                    onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Client</Label>
                                <Input
                                    className="col-span-3"
                                    value={newCampaign.client}
                                    onChange={e => setNewCampaign({ ...newCampaign, client: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Placement</Label>
                                <Select
                                    value={newCampaign.placement}
                                    onValueChange={v => setNewCampaign({ ...newCampaign, placement: v })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DASHBOARD_TOP">Dashboard Top</SelectItem>
                                        <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                                        <SelectItem value="CHECKOUT">Checkout Page</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Launch Campaign</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From active campaigns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeCount}</div>
                        <p className="text-xs text-muted-foreground">Running now</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">All time views</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search campaigns..."
                            className="pl-8"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign Name</TableHead>
                                <TableHead>Client/Brand</TableHead>
                                <TableHead>Placement</TableHead>
                                <TableHead>Impressions</TableHead>
                                <TableHead>Clicks</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : campaigns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No campaigns found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                campaigns.map((ad) => (
                                    <TableRow key={ad.id}>
                                        <TableCell className="font-medium">{ad.name}</TableCell>
                                        <TableCell>{ad.client}</TableCell>
                                        <TableCell>{ad.placement.replace("_", " ")}</TableCell>
                                        <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                                        <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={ad.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                {ad.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
