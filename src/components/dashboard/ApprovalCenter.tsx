"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Zap, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ApprovalCenter({ initialRequests }: { initialRequests: any[] }) {
    const [requests, setRequests] = useState(initialRequests)
    const [loading, setLoading] = useState<string | null>(null)
    const { toast } = useToast()

    const handleAction = async (id: string, action: 'APPROVE' | 'DENY') => {
        setLoading(id)
        // Simulating API call
        await new Promise(r => setTimeout(r, 1000))

        setRequests(prev => prev.filter(r => r.id !== id))
        toast({
            title: `Request ${action === 'APPROVE' ? 'Approved' : 'Denied'}`,
            description: `The POS override request has been ${action.toLowerCase()}ed.`
        })
        setLoading(null)
    }

    return (
        <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold">Approval & Override Center</CardTitle>
                    <CardDescription>Manage real-time overrides from POS</CardDescription>
                </div>
                <Badge className="bg-amber-500 text-white border-none">{requests.length} PENDING</Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 flex flex-col items-center">
                            <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">Queues cleared. No overrides requested.</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="p-4 rounded-2xl border-2 border-slate-50 bg-white shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                        <Zap className="h-5 w-5 fill-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">{req.subject}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Requested by {req.user?.name || 'Staff'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => handleAction(req.id, 'DENY')}
                                        disabled={loading === req.id}
                                    >
                                        {loading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'DENY'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="rounded-xl font-bold bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction(req.id, 'APPROVE')}
                                        disabled={loading === req.id}
                                    >
                                        {loading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'APPROVE'}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
