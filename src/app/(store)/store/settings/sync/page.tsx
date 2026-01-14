'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    RefreshCw,
    CheckCircle2,
    Cloud,
    ArrowUpFromLine,
    ArrowDownToLine,
    Database,
    AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DataSyncPage() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [lastSynced, setLastSynced] = useState<string>('')
    const [syncProgress, setSyncProgress] = useState(0)

    useEffect(() => {
        setLastSynced(new Date(Date.now() - 15 * 60000).toLocaleTimeString())
    }, [])

    const handleSync = () => {
        setIsSyncing(true)
        setSyncProgress(0)

        // Simulate sync process
        const interval = setInterval(() => {
            setSyncProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setIsSyncing(false)
                    setLastSynced(new Date().toLocaleTimeString())
                    return 100
                }
                return prev + 10
            })
        }, 300)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Data Synchronization</h2>
                <p className="text-muted-foreground">Manage how your store data syncs with the central platform.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Main Sync Status */}
                <Card className="md:col-span-2 bg-slate-50 border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Cloud className="h-5 w-5 text-blue-600" />
                                Cloud Sync Status
                            </CardTitle>
                            <CardDescription>
                                {isSyncing ? 'Synchronizing data...' : `Last successfully synced at ${lastSynced}`}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "h-3 w-3 rounded-full",
                                isSyncing ? "bg-blue-500 animate-pulse" : "bg-green-500"
                            )} />
                            <span className={cn(
                                "text-sm font-medium",
                                isSyncing ? "text-blue-700" : "text-green-700"
                            )}>
                                {isSyncing ? 'Syncing Running' : 'Up to Date'}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isSyncing && (
                            <div className="space-y-2 mb-4">
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                        style={{ width: `${syncProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-center text-muted-foreground">{syncProgress}% Complete</p>
                            </div>
                        )}
                        <Button
                            size="lg"
                            className="w-full sm:w-auto"
                            onClick={handleSync}
                            disabled={isSyncing}
                        >
                            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Details Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ArrowDownToLine className="h-4 w-4" />
                            Incoming Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SyncItem label="Product Catalog" status="synced" timestamp="2 mins ago" />
                        <SyncItem label="Pricing Rules" status="synced" timestamp="2 mins ago" />
                        <SyncItem label="Customer Profiles" status="pending" timestamp="15 mins ago" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ArrowUpFromLine className="h-4 w-4" />
                            Outgoing Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SyncItem label="Sales Transactions" status="synced" timestamp="Just now" />
                        <SyncItem label="Inventory Adjustments" status="synced" timestamp="Just now" />
                        <SyncItem label="Shift Logs" status="synced" timestamp="1 hour ago" />
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex gap-3 text-blue-900 text-sm">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                <p>
                    <strong>Note:</strong> Sales data is automatically synced every 5 minutes.
                    You can force a manual sync at any time if you notice discrepancies.
                </p>
            </div>
        </div>
    )
}

function SyncItem({ label, status, timestamp }: any) {
    return (
        <div className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
            <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
            {status === 'synced' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
                <RefreshCw className="h-4 w-4 text-orange-400" />
            )}
        </div>
    )
}
