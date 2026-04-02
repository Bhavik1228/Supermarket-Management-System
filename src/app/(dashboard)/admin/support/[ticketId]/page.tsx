"use client"

import { useState, useEffect } from "react"
import { getTicket, sendMessage, updateTicketStatus } from "@/app/actions/support"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Sparkles, User, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { use } from "react"

export default function TicketDetailsPage({ params: paramsPromise }: { params: Promise<{ ticketId: string }> }) {
    const params = use(paramsPromise)
    const [ticket, setTicket] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [newMessage, setNewMessage] = useState("")
    const [aiDraft, setAiDraft] = useState("")
    const [sending, setSending] = useState(false)
    const router = useRouter()

    useEffect(() => {
        loadTicket()
    }, [params.ticketId])

    const loadTicket = async () => {
        const res = await getTicket(params.ticketId)
        if (res.success) {
            setTicket(res.ticket)
        } else {
            console.error(res.error)
        }
        setLoading(false)
    }

    const handleAIDraft = () => {
        // Simulating AI draft generation - in future, connect to AI agent
        const drafts = [
            "Hello, could you please provide more details about the error you are seeing?",
            "Thank you for reaching out. We are investigating this issue and will get back to you shortly.",
            "Please try clearing your browser cache and trying again. Let us know if the issue persists."
        ]
        setAiDraft(drafts[Math.floor(Math.random() * drafts.length)])
    }

    const handleSend = async () => {
        if (!newMessage && !aiDraft) return
        setSending(true)
        const content = newMessage || aiDraft

        const res = await sendMessage(params.ticketId, content, true) // true = isStaff
        if (res.success) {
            setNewMessage("")
            setAiDraft("")
            loadTicket() // Refresh messages
        } else {
            alert("Failed to send message")
        }
        setSending(false)
    }

    const handleStatusUpdate = async (status: string) => {
        await updateTicketStatus(params.ticketId, status)
        loadTicket()
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-lg font-medium text-muted-foreground">Ticket not found</p>
                <Link href="/admin/support">
                    <Button variant="link">Go back</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/support">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">{ticket.subject}</h2>
                    <p className="text-muted-foreground">Ticket #{ticket.id.slice(0, 8)} • Opened by {ticket.user?.name || "Unknown"}</p>
                </div>
                <Badge variant={ticket.status === 'OPEN' ? 'destructive' : 'secondary'}>{ticket.status}</Badge>
                <Badge variant="outline">{ticket.priority}</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Chat Area */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Conversation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-2">
                            {ticket.messages.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No messages yet.</p>
                            ) : (
                                ticket.messages.map((msg: any) => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.isStaff ? 'justify-end' : ''}`}>
                                        <div className={`flex items-start gap-3 max-w-[80%] ${msg.isStaff ? 'flex-row-reverse' : ''}`}>
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${msg.isStaff ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                {msg.isStaff ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                            </div>
                                            <div className={`rounded-lg p-3 ${msg.isStaff ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                <p className="text-sm">{msg.message}</p>
                                                <p className={`text-xs mt-1 ${msg.isStaff ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* AI Draft Preview */}
                        {aiDraft && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2 text-purple-700 mb-2">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-sm font-medium">AI Draft</span>
                                </div>
                                <p className="text-sm text-purple-900">{aiDraft}</p>
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={handleSend} disabled={sending}>Use & Send</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setAiDraft("")}>Discard</Button>
                                </div>
                            </div>
                        )}

                        {/* Reply Input */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type your reply..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1"
                                disabled={sending}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <Button variant="outline" onClick={handleAIDraft} disabled={sending}>
                                <Sparkles className="h-4 w-4 mr-2" /> AI Draft
                            </Button>
                            <Button onClick={handleSend} disabled={sending}>
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm font-medium">{ticket.user?.name || "Unknown"}</p>
                                <p className="text-sm text-muted-foreground">{ticket.user?.email || "No email"}</p>
                                <p className="text-xs text-muted-foreground mt-1">Role: {ticket.user?.role}</p>
                            </div>
                            <Link href={`/admin/impersonate?userId=${ticket.userId}`}>
                                <Button variant="outline" size="sm" className="w-full mt-2">
                                    <User className="h-4 w-4 mr-2" /> Impersonate User
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {ticket.status !== 'IN_PROGRESS' && (
                                <Button variant="outline" className="w-full" onClick={() => handleStatusUpdate('IN_PROGRESS')}>
                                    Mark as In Progress
                                </Button>
                            )}
                            {ticket.status !== 'RESOLVED' && (
                                <Button variant="outline" className="w-full text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleStatusUpdate('RESOLVED')}>
                                    Mark as Resolved
                                </Button>
                            )}
                            {ticket.status !== 'CLOSED' && (
                                <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleStatusUpdate('CLOSED')}>
                                    Close Ticket
                                </Button>
                            )}
                            {ticket.status !== 'OPEN' && (
                                <Button variant="ghost" className="w-full" onClick={() => handleStatusUpdate('OPEN')}>
                                    Re-open Ticket
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
