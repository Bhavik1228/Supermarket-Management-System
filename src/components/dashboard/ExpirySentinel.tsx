"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Calendar, ArrowRight, ShieldAlert, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getExpiringProducts } from "@/app/actions/inventory-batches"
import Link from "next/link"

export function ExpirySentinelWidget() {
    const [expiring, setExpiring] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const res = await getExpiringProducts(30) // Next 30 days
        if (res.success) {
            setExpiring(res.batches || [])
        }
        setLoading(false)
    }

    if (loading) return null
    if (expiring.length === 0) return null

    const criticalCount = expiring.filter(b => {
        const days = Math.floor((new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return days <= 7
    }).length

    return (
        <Card className="border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-rose-50/50 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">Expiry Sentinel</CardTitle>
                            <CardDescription className="text-xs text-rose-500 font-bold">Proactive loss prevention system</CardDescription>
                        </div>
                    </div>
                    {criticalCount > 0 && (
                        <Badge className="bg-rose-600 text-white border-none animate-pulse px-3 py-1 font-black text-[10px]">
                            {criticalCount} CRITICAL
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {expiring.slice(0, 4).map((batch) => {
                        const expiryDate = new Date(batch.expiryDate)
                        const daysLeft = Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        const isCritical = daysLeft <= 7

                        return (
                            <div key={batch.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {batch.product.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{batch.product.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Batch: {batch.batchNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                        <Clock className={`h-3 w-3 ${isCritical ? 'text-rose-500' : 'text-slate-400'}`} />
                                        <span className={`text-xs font-black ${isCritical ? 'text-rose-600' : 'text-slate-600'}`}>
                                            {daysLeft} days left
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">{expiryDate.toLocaleDateString()}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="p-4 bg-slate-50/50">
                    <Link href="/store/inventory/batches">
                        <Button variant="ghost" className="w-full rounded-xl h-12 text-slate-500 font-black text-xs uppercase tracking-widest gap-2 hover:bg-white hover:text-indigo-600">
                            MANAGE ALL BATCHES <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
