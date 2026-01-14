'use client'

import { useState, useEffect } from 'react'
import { getSystemStatus } from '@/app/actions/status'
import type { SystemComponent, Incident } from '@/lib/status-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    CheckCircle2,
    AlertCircle,
    XCircle,
    RotateCw,
    Info,
    Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AISupportAssistant } from '@/components/support/AISupportAssistant'

export default function PublicStatusPage() {
    const [statusData, setStatusData] = useState<{ components: SystemComponent[], incidents: Incident[] } | null>(null)
    const [lastUpdated, setLastUpdated] = useState<string>('')

    useEffect(() => {
        const fetchStatus = async () => {
            const data = await getSystemStatus()
            setStatusData(data)
            setLastUpdated(new Date().toLocaleTimeString())
        }

        fetchStatus()
        // Auto-refresh every minute
        const interval = setInterval(fetchStatus, 60000)
        return () => clearInterval(interval)
    }, [])

    if (!statusData) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <RotateCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Checking system status...</p>
            </div>
        )
    }

    // Determine overall system health
    const hasOutage = statusData.components.some(c => c.status === 'OUTAGE')
    const hasDegraded = statusData.components.some(c => c.status === 'DEGRADED')
    const overallStatus = hasOutage ? 'CRITICAL' : hasDegraded ? 'DEGRADED' : 'OPERATIONAL'

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Banner */}
            <div className={cn(
                "rounded-xl p-8 text-center border-2",
                overallStatus === 'OPERATIONAL' ? "bg-green-50 border-green-200" :
                    overallStatus === 'DEGRADED' ? "bg-yellow-50 border-yellow-200" :
                        "bg-red-50 border-red-200"
            )}>
                <div className="flex justify-center mb-4">
                    {overallStatus === 'OPERATIONAL' && <CheckCircle2 className="h-16 w-16 text-green-600" />}
                    {overallStatus === 'DEGRADED' && <AlertCircle className="h-16 w-16 text-yellow-600" />}
                    {overallStatus === 'CRITICAL' && <XCircle className="h-16 w-16 text-red-600" />}
                </div>
                <h1 className={cn(
                    "text-3xl font-bold mb-2",
                    overallStatus === 'OPERATIONAL' ? "text-green-800" :
                        overallStatus === 'DEGRADED' ? "text-yellow-800" :
                            "text-red-800"
                )}>
                    {overallStatus === 'OPERATIONAL' ? "All Systems Operational" :
                        overallStatus === 'DEGRADED' ? "Partial System Outage" :
                            "Major System Outage"}
                </h1>
                <p className={cn(
                    "text-sm font-medium opacity-80",
                    overallStatus === 'OPERATIONAL' ? "text-green-700" :
                        overallStatus === 'DEGRADED' ? "text-yellow-700" :
                            "text-red-700"
                )}>
                    Last updated: {lastUpdated}
                </p>
            </div>

            {/* Active Incidents */}
            {statusData.incidents.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Active Updates
                    </h3>
                    {statusData.incidents.map((incident) => (
                        <Card key={incident.id} className={cn(
                            "border-l-4",
                            incident.status === 'RESOLVED' ? "border-l-green-500 opacity-70" : "border-l-blue-500"
                        )}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={incident.status === 'RESOLVED' ? 'outline' : 'default'}>
                                                {incident.status}
                                            </Badge>
                                            <CardTitle className="text-base">{incident.title}</CardTitle>
                                        </div>
                                        <CardDescription>
                                            {new Date(incident.createdAt).toLocaleDateString()} at {new Date(incident.createdAt).toLocaleTimeString()}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{incident.message}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Component Status Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Platform Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {statusData.components.map((component) => (
                            <div key={component.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="font-medium">{component.name}</span>
                                <div className="flex items-center gap-2">
                                    {component.status === 'OPERATIONAL' && <span className="text-xs font-bold text-green-600">Operational</span>}
                                    {component.status === 'DEGRADED' && <span className="text-xs font-bold text-yellow-600">Degraded</span>}
                                    {(component.status === 'OUTAGE' || component.status === 'MAINTENANCE') && <span className="text-xs font-bold text-red-600">{component.status}</span>}

                                    <div className={cn(
                                        "h-3 w-3 rounded-full",
                                        component.status === 'OPERATIONAL' ? "bg-green-500" :
                                            component.status === 'DEGRADED' ? "bg-yellow-500" :
                                                "bg-red-500"
                                    )} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Need Assistance?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            If you are experiencing issues not listed here, please contact support immediately.
                        </p>
                        <div className="flex flex-col gap-2">
                            <AISupportAssistant className="w-full justify-start gap-2" variant="outline" />
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Info className="h-4 w-4" />
                                Submit Traditional Ticket
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
