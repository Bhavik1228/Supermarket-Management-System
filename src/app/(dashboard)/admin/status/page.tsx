'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { getSystemStatus, updateComponentStatus, createIncident, resolveIncident } from '@/app/actions/status'
import { generateIncidentDraft, notifyUsersOnIncident } from '@/app/actions/ai-incident'
import type { SystemComponent, Incident, ComponentStatus } from '@/lib/status-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldAlert,
    RefreshCw,
    Bot,
    Sparkles,
    Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StatusManagerPage() {
    const [statusData, setStatusData] = useState<{ components: SystemComponent[], incidents: Incident[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [isAiGenerating, setIsAiGenerating] = useState(false)

    // Incident Form State
    const [newIncident, setNewIncident] = useState<{ title: string, message: string, severity: Incident['severity'] }>({ title: '', message: '', severity: 'INFO' })
    const [notifyUsers, setNotifyUsers] = useState(true)

    const fetchStatus = useCallback(async () => {
        const data = await getSystemStatus()
        setStatusData(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    const handleComponentUpdate = (id: string, status: ComponentStatus) => {
        startTransition(async () => {
            await updateComponentStatus(id, status)
            fetchStatus()
        })
    }

    const handleCreateIncident = () => {
        if (!newIncident.title || !newIncident.message) return
        startTransition(async () => {
            const res = await createIncident(newIncident)
            if (res.success && notifyUsers) {
                // We need the full incident object, but createIncident just returns success. 
                // In a real app we'd return the object. For now we mock the ID or fetch latest.
                // We'll just pass a constructed object to the mock notifier
                await notifyUsersOnIncident({ ...newIncident, id: 'mock-id', status: 'INVESTIGATING', createdAt: '', updatedAt: '' })
            }
            setNewIncident({ title: '', message: '', severity: 'INFO' })
            fetchStatus()
        })
    }

    const handleAiDraft = async () => {
        // if (!newIncident.title && !newIncident.message) return // Allow empty prompt for random draft
        setIsAiGenerating(true)
        // Use current input as prompt
        const prompt = newIncident.title + " " + newIncident.message
        const draft = await generateIncidentDraft(prompt)
        setNewIncident(prev => ({
            ...prev,
            title: draft.title,
            message: draft.message,
            severity: draft.severity
        }))
        setIsAiGenerating(false)
    }

    const handleResolveIncident = (id: string) => {
        startTransition(async () => {
            await resolveIncident(id)
            fetchStatus()
        })
    }

    if (loading || !statusData) return <div className="p-8">Loading Status Board...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Status Manager</h2>
                <p className="text-muted-foreground">Control component status and post incidents for users.</p>
            </div>

            {/* Component Status Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statusData.components.map((component) => (
                    <Card key={component.id} className={cn(
                        "border-l-4 transition-all",
                        component.status === 'OPERATIONAL' ? "border-l-green-500" :
                            component.status === 'DEGRADED' ? "border-l-yellow-500" :
                                "border-l-red-500"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-semibold">{component.name}</CardTitle>
                            {component.status === 'OPERATIONAL' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            {component.status === 'DEGRADED' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                            {(component.status === 'OUTAGE' || component.status === 'MAINTENANCE') && <XCircle className="h-5 w-5 text-red-500" />}
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <StatusButton
                                    label="Operational"
                                    active={component.status === 'OPERATIONAL'}
                                    onClick={() => handleComponentUpdate(component.id, 'OPERATIONAL')}
                                    color="green"
                                />
                                <StatusButton
                                    label="Degraded"
                                    active={component.status === 'DEGRADED'}
                                    onClick={() => handleComponentUpdate(component.id, 'DEGRADED')}
                                    color="yellow"
                                />
                                <StatusButton
                                    label="Outage"
                                    active={component.status === 'OUTAGE'}
                                    onClick={() => handleComponentUpdate(component.id, 'OUTAGE')}
                                    color="red"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Create Incident Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Post New Incident</CardTitle>
                        <CardDescription>Notify users about an ongoing issue.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Incident Keyword (e.g., 'db slow')"
                                value={newIncident.title}
                                onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                title="Auto-complete with AI"
                                onClick={handleAiDraft}
                                disabled={isAiGenerating}
                            >
                                {isAiGenerating ? <Sparkles className="h-4 w-4 animate-spin text-purple-500" /> : <Bot className="h-4 w-4 text-purple-600" />}
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Detailed description..."
                            value={newIncident.message}
                            onChange={(e) => setNewIncident(prev => ({ ...prev, message: e.target.value }))}
                        />
                        <div className="flex gap-2">
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={newIncident.severity}
                                onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as any }))}
                            >
                                <option value="INFO">Info / Maintenance</option>
                                <option value="MINOR">Minor Issue</option>
                                <option value="MAJOR">Major Issue</option>
                                <option value="CRITICAL">Critical Outage</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="notify"
                                checked={notifyUsers}
                                onChange={(e) => setNotifyUsers(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="notify" className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Notify all users via email
                            </label>
                        </div>
                        <Button onClick={handleCreateIncident} disabled={isPending || !newIncident.title} className="w-full">
                            {isPending ? 'Posting...' : 'Post Incident'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Incident History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Incidents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
                        {statusData.incidents.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No active incidents tracked.
                            </div>
                        )}
                        {statusData.incidents.map((incident) => (
                            <div key={incident.id} className="border rounded-lg p-4 space-y-2 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={incident.status === 'RESOLVED' ? 'outline' : 'destructive'}>
                                            {incident.status}
                                        </Badge>
                                        <span className="font-semibold">{incident.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(incident.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">{incident.message}</p>
                                {incident.status !== 'RESOLVED' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => handleResolveIncident(incident.id)}
                                        disabled={isPending}
                                    >
                                        Mark Resolved
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatusButton({ label, active, onClick, color }: any) {
    const activeClassMap: Record<string, string> = {
        green: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
        yellow: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200",
        red: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
    }
    const className = color ? activeClassMap[color] : ""

    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
                active ? className : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            )}
        >
            {label}
        </button>
    )
}
