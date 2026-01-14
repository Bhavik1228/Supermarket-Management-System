"use client"

import { useState, useEffect } from "react"
import { getRules, toggleRule, createRule } from "@/app/actions/automation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Plus, Zap, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AutomationPage() {
    const [rules, setRules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newRule, setNewRule] = useState({ name: "", description: "", triggerType: "SCHEDULE", actionType: "NOTIFY" })

    useEffect(() => {
        loadRules()
    }, [])

    const loadRules = async () => {
        setLoading(true)
        const res = await getRules()
        if (res.success) setRules(res.rules || [])
        setLoading(false)
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await toggleRule(id, !currentStatus)
        loadRules()
    }

    const handleCreate = async () => {
        if (!newRule.name) return
        await createRule(newRule)
        setIsCreateOpen(false)
        setNewRule({ name: "", description: "", triggerType: "SCHEDULE", actionType: "NOTIFY" }) // Reset
        loadRules()
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Platform Automation</h2>
                    <p className="text-muted-foreground">Configure automated rules for store management and system maintenance.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Automation Rule</DialogTitle>
                            <DialogDescription>Define a trigger and action.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Rule Name</Label>
                                <Input value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={newRule.description} onChange={e => setNewRule({ ...newRule, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Trigger</Label>
                                    <Select value={newRule.triggerType} onValueChange={v => setNewRule({ ...newRule, triggerType: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SCHEDULE">Schedule (Time)</SelectItem>
                                            <SelectItem value="EVENT">Event Based</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Action</Label>
                                    <Select value={newRule.actionType} onValueChange={v => setNewRule({ ...newRule, actionType: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NOTIFY">Send Notification</SelectItem>
                                            <SelectItem value="SUSPEND">Suspend Store</SelectItem>
                                            <SelectItem value="APPROVE">Approve Store</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Rule</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {loading && rules.length === 0 ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : rules.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border rounded-lg bg-card">No rules defined. Create one to get started.</div>
                ) : (
                    rules.map((rule) => (
                        <Card key={rule.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            {rule.name}
                                        </CardTitle>
                                        <CardDescription>{rule.description || "No description"}</CardDescription>
                                    </div>
                                    <Switch
                                        checked={rule.isActive}
                                        onCheckedChange={() => handleToggle(rule.id, rule.isActive)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Trigger: {rule.triggerType}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        <span>Action: {rule.actionType}</span>
                                    </div>
                                    <Badge variant={rule.isActive ? 'default' : 'secondary'} className="ml-auto">
                                        {rule.isActive ? 'Active' : 'Paused'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
