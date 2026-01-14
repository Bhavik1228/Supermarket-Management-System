'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSystemMetrics, type SystemMetrics } from '@/app/actions/monitor'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Activity,
    Server,
    Users,
    Clock,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Database,
    Globe,
    ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SystemMonitorPage() {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchMetrics = useCallback(async () => {
        try {
            setRefreshing(true)
            const data = await getSystemMetrics()
            setMetrics(data)
        } catch (error) {
            console.error('Failed to fetch metrics:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchMetrics()
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000)
        return () => clearInterval(interval)
    }, [fetchMetrics])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Initializing System Monitor...</p>
                </div>
            </div>
        )
    }

    if (!metrics) return null

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Monitor</h2>
                    <p className="text-muted-foreground">Real-time platform health and performance metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-2">
                        Last updated: {metrics.lastUpdated}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchMetrics}
                        disabled={refreshing}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="CPU Load"
                    value={`${metrics.cpuUsage}%`}
                    icon={Activity}
                    status={metrics.cpuUsage > 80 ? 'danger' : metrics.cpuUsage > 60 ? 'warning' : 'success'}
                    subtext="Core utilization"
                />
                <MetricCard
                    title="Memory Usage"
                    value={`${metrics.memoryUsage}%`}
                    icon={Server}
                    status={metrics.memoryUsage > 85 ? 'danger' : metrics.memoryUsage > 70 ? 'warning' : 'success'}
                    subtext="RAM allocation"
                />
                <MetricCard
                    title="Active Users"
                    value={metrics.activeUsers.toString()}
                    icon={Users}
                    status="neutral"
                    subtext="Currently online"
                />
                <MetricCard
                    title="System Uptime"
                    value={metrics.uptime}
                    icon={Clock}
                    status="success"
                    subtext="Since last restart"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Active Alerts Section - Takes up 4 columns */}
                <Card className="md:col-span-4 border-l-4 border-l-orange-500/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-orange-500" />
                            Active Alerts
                        </CardTitle>
                        <CardDescription>Critial and warning notifications requiring attention.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {metrics.alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                                <p>No active alerts. System is healthy.</p>
                            </div>
                        ) : (
                            metrics.alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-lg border",
                                        alert.type === 'CRITICAL' ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
                                    )}
                                >
                                    <AlertTriangle className={cn(
                                        "h-5 w-5 mt-0.5",
                                        alert.type === 'CRITICAL' ? "text-red-600" : "text-orange-600"
                                    )} />
                                    <div className="flex-1">
                                        <h4 className={cn(
                                            "font-semibold text-sm",
                                            alert.type === 'CRITICAL' ? "text-red-900" : "text-orange-900"
                                        )}>
                                            {alert.message}
                                        </h4>
                                        <p className={cn(
                                            "text-xs mt-1",
                                            alert.type === 'CRITICAL' ? "text-red-700" : "text-orange-700"
                                        )}>
                                            {alert.timestamp} • Type: {alert.type}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Service Status & Recent Activity - Takes up 3 columns */}
                <div className="md:col-span-3 space-y-6">
                    {/* Service Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Service Status</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <StatusItem
                                label="API Gateway"
                                status={metrics.apiStatus === 'HEALTHY' ? 'operational' : 'degraded'}
                                icon={Globe}
                            />
                            <StatusItem
                                label="Primary Database"
                                status={metrics.dbStatus === 'CONNECTED' ? 'operational' : 'down'}
                                icon={Database}
                            />
                            <StatusItem
                                label="Email Service (Resend)"
                                status="operational"
                                icon={Server}
                            />
                        </CardContent>
                    </Card>

                    {/* Recent Logs (Simplified) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {metrics.recentActivity.map((log) => (
                                    <div key={log.id} className="flex gap-3 text-sm">
                                        <div className="min-w-fit text-xs text-muted-foreground py-0.5">
                                            {log.time}
                                        </div>
                                        <div className="border-l-2 pl-3 border-muted">
                                            <p className="font-medium">{log.message}</p>
                                            {log.user && <p className="text-xs text-muted-foreground">by {log.user}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// Sub-components for cleaner code
function MetricCard({ title, value, icon: Icon, status, subtext }: any) {
    const statusColor: Record<string, string> = {
        success: "text-green-600",
        warning: "text-orange-600",
        danger: "text-red-600",
        neutral: "text-muted-foreground"
    }
    const colorClass = statusColor[status] || "text-muted-foreground"

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", colorClass)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    {subtext}
                </p>
            </CardContent>
        </Card>
    )
}

function StatusItem({ label, status, icon: Icon }: any) {
    return (
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-full",
                    status === 'operational' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className={cn(
                    "h-2.5 w-2.5 rounded-full animate-pulse",
                    status === 'operational' ? "bg-green-500" : "bg-red-500"
                )} />
                <span className={cn(
                    "text-xs font-semibold uppercase",
                    status === 'operational' ? "text-green-600" : "text-red-600"
                )}>
                    {status}
                </span>
            </div>
        </div>
    )
}
