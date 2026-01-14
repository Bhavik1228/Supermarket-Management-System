"use client"

import { useState, useEffect } from "react"
import { getAuditLogs } from "@/app/actions/audit"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Info, Loader2, Download } from "lucide-react"
import { AuditAIButton } from "@/components/admin/AuditAIButton"

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            loadLogs()
        }, 500) // Debounce search
        return () => clearTimeout(timer)
    }, [query])

    const loadLogs = async () => {
        setLoading(true)
        const res = await getAuditLogs(query)
        if (res.success) setLogs(res.logs || [])
        setLoading(false)
    }

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `audit_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    const actionColors: Record<string, string> = {
        STORE_APPROVED: "bg-green-100 text-green-800",
        STORE_SUSPENDED: "bg-red-100 text-red-800",
        STORE_REJECTED: "bg-red-100 text-red-800",
        USER_LOGIN: "bg-blue-100 text-blue-800",
        USER_CREATED: "bg-purple-100 text-purple-800",
        PRODUCT_CREATED: "bg-purple-100 text-purple-800",
        TICKET_RESOLVED: "bg-yellow-100 text-yellow-800",
        SYSTEM_SEEDED: "bg-gray-100 text-gray-800",
    }

    const formatDate = (date: string) => {
        const now = new Date()
        const logDate = new Date(date)
        const isToday = now.toDateString() === logDate.toDateString()
        const time = logDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        return isToday ? `Today, ${time}` : `${logDate.toLocaleDateString()}, ${time}`
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Audit Center</h2>
                    <p className="text-muted-foreground">Complete system activity log with AI-powered explanations.</p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by action, user, or entity..."
                        className="pl-8"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[140px]">Action</TableHead>
                            <TableHead className="w-[180px]">Entity</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="w-[160px]">Time</TableHead>
                            <TableHead className="w-[80px] text-right">AI</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No audit logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}>
                                            {log.action.replace(/_/g, " ")}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {log.entity}{log.entityId ? `: ${log.entityId.slice(0, 8)}` : ''}
                                    </TableCell>
                                    <TableCell className="text-sm">{log.userEmail || 'System'}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                                        {log.details || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <AuditAIButton log={log} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <p className="font-medium text-blue-800">AI Explanation</p>
                    <p className="text-sm text-blue-700">Click the ✨ button on any log entry to get an AI-powered breakdown of what happened and recommended next steps.</p>
                </div>
            </div>
        </div>
    )
}
