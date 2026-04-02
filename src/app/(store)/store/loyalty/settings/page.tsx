"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Settings2, Plus, Sparkles, Zap, Gift,
    Coins, Trophy, Users, ShieldCheck,
    Loader2, AlertCircle, ChevronRight,
    Search, Filter, Play, Power
} from "lucide-react"
import { getAllLoyaltyPrograms, toggleProgramStatus } from "@/app/actions/loyalty"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

const PROGRAM_STYLES: Record<string, { icon: any, color: string, bg: string }> = {
    'POINTS': { icon: Coins, color: 'text-amber-500', bg: 'bg-amber-50' },
    'CASHBACK': { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    'TIERED': { icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    'GAMIFIED': { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
    'REFERRAL': { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
}

export default function LoyaltySettingsPage() {
    const { toast } = useToast()
    const [programs, setPrograms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    useEffect(() => {
        loadPrograms()
    }, [])

    const loadPrograms = async () => {
        setLoading(true)
        const res = await getAllLoyaltyPrograms()
        if (res.success) setPrograms(res.programs || [])
        setLoading(false)
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setUpdatingId(id)
        const res = await toggleProgramStatus(id, !currentStatus)
        if (res.success) {
            toast({ title: "Status Updated", description: "Program visibility changed successfully." })
            loadPrograms()
        }
        setUpdatingId(null)
    }

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 group cursor-pointer w-fit">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/70 group-hover:text-indigo-500 transition-colors">Program Configuration</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900">Loyalty Management</h1>
                    <p className="text-slate-500 font-medium text-lg">Activate and configure multiple reward mechanisms for your store.</p>
                </div>
                <Button className="h-12 px-6 rounded-2xl bg-indigo-600 border-none text-white font-bold shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 gap-2">
                    <Plus className="h-5 w-5" /> Launch New Program
                </Button>
            </div>

            {/* Program Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((prog) => {
                    const style = PROGRAM_STYLES[prog.programType] || { icon: Gift, color: 'text-slate-500', bg: 'bg-slate-50' }
                    const Icon = style.icon

                    return (
                        <Card key={prog.id} className="border-none shadow-2xl shadow-indigo-100/30 rounded-[2.5rem] bg-white overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                            <div className={`h-2 ${prog.isActive ? style.bg.replace('bg-', 'bg-').split('-')[1] + '-500' : 'bg-slate-200'}`} />
                            <CardHeader className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-4 rounded-2xl ${style.bg} ${style.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={prog.isActive}
                                            onCheckedChange={() => handleToggle(prog.id, prog.isActive)}
                                            disabled={updatingId === prog.id}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl font-black">{prog.name}</CardTitle>
                                        <Badge variant="outline" className="border-slate-100 text-[10px] font-black uppercase tracking-widest">{prog.programType}</Badge>
                                    </div>
                                    <CardDescription className="font-medium text-slate-400">{prog.description || "No description provided."}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Members</p>
                                        <p className="text-xl font-black text-slate-900">{prog._count.accounts}</p>
                                    </div>
                                    <div className={`p-4 ${style.bg} rounded-2xl border border-white/50`}>
                                        <p className={`text-[10px] font-black uppercase ${style.color} opacity-60`}>Rate</p>
                                        <p className={`text-xl font-black ${style.color}`}>{prog.earningRate}x</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                U{i}
                                            </div>
                                        ))}
                                        <div className="h-8 w-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-500">
                                            +{prog._count.accounts}
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors gap-2">
                                        Edit Details <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {/* Placeholder for expansion */}
                <Card className="border-2 border-dashed border-slate-100 shadow-none rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-indigo-200 transition-colors">
                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                        <Plus className="h-8 w-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h3 className="font-black text-slate-400 group-hover:text-indigo-600 transition-colors">Add New Reward Type</h3>
                    <p className="text-[10px] font-bold text-slate-300 uppercase mt-2">Points • Cashback • Tiers</p>
                </Card>
            </div>
        </div>
    )
}
