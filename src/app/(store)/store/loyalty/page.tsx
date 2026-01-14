"use client"

import { useState, useEffect } from "react"
import { getLoyaltyProgram, updateProgramSettings, createTier, deleteTier } from "@/app/actions/loyalty"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Award, Crown, Settings, Plus, Trash2, Save, Loader2 } from "lucide-react"

export default function LoyaltyPage() {
    const [program, setProgram] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Settings State
    const [settings, setSettings] = useState({ currencyName: "Points", earningRate: 1.0, isActive: true })
    const [savingSettings, setSavingSettings] = useState(false)

    // Tier State
    const [isAddTierOpen, setIsAddTierOpen] = useState(false)
    const [newTier, setNewTier] = useState({ name: "", minPoints: "0", multiplier: "1.0" })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const res = await getLoyaltyProgram()
        if (res.success && res.program) {
            setProgram(res.program)
            setSettings({
                currencyName: res.program.currencyName || "Points",
                earningRate: res.program.earningRate || 1.0,
                isActive: res.program.isActive !== undefined ? res.program.isActive : true
            })
        }
        setLoading(false)
    }

    const handleSaveSettings = async () => {
        if (!program) return
        setSavingSettings(true)
        await updateProgramSettings(program.id, settings)
        setSavingSettings(false)
        alert("Settings saved!")
    }

    const handleCreateTier = async () => {
        if (!program || !newTier.name) return
        await createTier(program.id, newTier)
        setIsAddTierOpen(false)
        setNewTier({ name: "", minPoints: "0", multiplier: "1.0" })
        loadData()
    }

    const handleDeleteTier = async (id: string) => {
        if (confirm("Are you sure you want to delete this tier?")) {
            await deleteTier(id)
            loadData()
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    if (!program) return <div className="p-8 text-center">No Loyalty Program found. Please contact support.</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Loyalty Program</h2>
                <p className="text-muted-foreground">Manage tiers, earning rules, and program settings.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Program Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            General Settings
                        </CardTitle>
                        <CardDescription>Configure how customers earn points.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                            <div>
                                <p className="font-medium">Program Status</p>
                                <p className="text-sm text-muted-foreground">Enable or disable loyalty functionality</p>
                            </div>
                            <Switch
                                checked={settings.isActive}
                                onCheckedChange={checked => setSettings({ ...settings, isActive: checked })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Currency Name</Label>
                                <Input
                                    value={settings.currencyName}
                                    onChange={e => setSettings({ ...settings, currencyName: e.target.value })}
                                    placeholder="e.g. Points, Stars"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Earning Rate (Points per $1)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={settings.earningRate}
                                    onChange={e => setSettings({ ...settings, earningRate: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <Button onClick={handleSaveSettings} disabled={savingSettings} className="w-full">
                            {savingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Configuration
                        </Button>
                    </CardContent>
                </Card>

                {/* Tiers Overview */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-amber-500" />
                                    Loyalty Tiers
                                </CardTitle>
                                <CardDescription>Define progression levels and multipliers.</CardDescription>
                            </div>
                            <Dialog open={isAddTierOpen} onOpenChange={setIsAddTierOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        <Plus className="mr-2 h-4 w-4" /> Add Tier
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Tier</DialogTitle>
                                        <DialogDescription>Create a new loyalty level.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Tier Name</Label>
                                            <Input value={newTier.name} onChange={e => setNewTier({ ...newTier, name: e.target.value })} placeholder="e.g. Platinum" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Min. Points</Label>
                                                <Input type="number" value={newTier.minPoints} onChange={e => setNewTier({ ...newTier, minPoints: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Multiplier</Label>
                                                <Input type="number" step="0.1" value={newTier.multiplier} onChange={e => setNewTier({ ...newTier, multiplier: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateTier}>Create Tier</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Level Name</TableHead>
                                    <TableHead>Threshold</TableHead>
                                    <TableHead>Multiplier</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {program.tiers.map((tier: any) => (
                                    <TableRow key={tier.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Award className="h-4 w-4 text-muted-foreground" />
                                            {tier.name}
                                        </TableCell>
                                        <TableCell>{tier.minPoints} pts</TableCell>
                                        <TableCell>x{tier.multiplier}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTier(tier.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
