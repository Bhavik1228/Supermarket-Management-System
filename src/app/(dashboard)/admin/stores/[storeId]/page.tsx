"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, X, Sparkles, Mail, User, Store, Calendar, FileText, Send } from "lucide-react"
import Link from "next/link"

export default function StoreDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [store, setStore] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [draftMessage, setDraftMessage] = useState("")
    const [showDraft, setShowDraft] = useState(false)
    const [draftType, setDraftType] = useState<'approve' | 'reject'>('approve')

    useEffect(() => {
        fetchStore()
    }, [params.storeId])

    const fetchStore = async () => {
        try {
            const res = await fetch(`/api/admin/stores/${params.storeId}`)
            const data = await res.json()
            setStore(data.store)
        } catch (error) {
            console.error('Failed to fetch store:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateDraft = async (action: 'approve' | 'reject') => {
        setDraftType(action)
        setShowDraft(true)
        setDraftMessage("Generating AI message...")

        try {
            const res = await fetch('/api/admin/stores/approve', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId: params.storeId, action })
            })
            const data = await res.json()
            setDraftMessage(data.draft)
        } catch (error) {
            setDraftMessage("Failed to generate draft. Please try again.")
        }
    }

    const handleAction = async (action: 'approve' | 'reject') => {
        setActionLoading(true)

        try {
            const res = await fetch('/api/admin/stores/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: params.storeId,
                    action,
                    message: draftMessage
                })
            })
            const data = await res.json()

            if (data.success) {
                alert(`Store ${action === 'approve' ? 'approved' : 'rejected'} successfully! Email sent to owner.`)
                router.push('/admin/stores')
            }
        } catch (error) {
            alert('Action failed. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!store) {
        return (
            <div className="space-y-4">
                <Link href="/admin/stores">
                    <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                </Link>
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Store not found
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        APPROVED: "bg-green-100 text-green-800 border-green-200",
        REJECTED: "bg-red-100 text-red-800 border-red-200",
        SUSPENDED: "bg-gray-100 text-gray-800 border-gray-200",
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/stores">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{store.name}</h2>
                        <p className="text-muted-foreground">Store Registration Review</p>
                    </div>
                </div>
                <Badge className={`text-sm px-3 py-1 ${statusColors[store.status]}`}>
                    {store.status}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Store Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" /> Store Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Store Name</span>
                                <span className="font-medium">{store.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Store Type</span>
                                <span className="font-medium">{store.storeType}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant="outline" className={statusColors[store.status]}>{store.status}</Badge>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Registered</span>
                                <span className="font-medium">{new Date(store.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Owner Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Owner Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Name</span>
                                <span className="font-medium">{store.owner?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Email</span>
                                <span className="font-medium">{store.owner?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Role</span>
                                <span className="font-medium">{store.owner?.role || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Panel - Only show for PENDING stores */}
            {store.status === 'PENDING' && (
                <Card className="border-2 border-dashed">
                    <CardHeader>
                        <CardTitle>Approval Decision</CardTitle>
                        <CardDescription>Review the information above and make a decision on this store registration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* AI Draft Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => generateDraft('approve')}
                                className="flex-1"
                            >
                                <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                                AI Draft: Approval Email
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => generateDraft('reject')}
                                className="flex-1"
                            >
                                <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                                AI Draft: Rejection Email
                            </Button>
                        </div>

                        {/* Draft Preview */}
                        {showDraft && (
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Draft ({draftType === 'approve' ? 'Approval' : 'Rejection'})
                                    </span>
                                    <Button size="sm" variant="ghost" onClick={() => setShowDraft(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <textarea
                                    className="w-full h-48 p-3 text-sm bg-background border rounded-md resize-none"
                                    value={draftMessage}
                                    onChange={(e) => setDraftMessage(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                onClick={() => handleAction('approve')}
                                disabled={actionLoading}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                {actionLoading ? 'Processing...' : 'Approve Store'}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleAction('reject')}
                                disabled={actionLoading}
                                className="flex-1"
                            >
                                <X className="mr-2 h-4 w-4" />
                                {actionLoading ? 'Processing...' : 'Reject Store'}
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            An email will be automatically sent to the store owner with your decision.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
