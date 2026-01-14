"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Plus, Send, Sparkles } from "lucide-react"
import { AISupportAssistant } from "@/components/support/AISupportAssistant"

// Mock Tickets
const tickets = [
    { id: "TKT-001", subject: "Cannot add products", status: "OPEN", date: "Today" },
    { id: "TKT-002", subject: "Payment integration issue", status: "RESOLVED", date: "Yesterday" },
]

export default function StoreSupportPage() {
    const [newMessage, setNewMessage] = useState("")

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Support</h2>
                    <p className="text-muted-foreground">Get help with your store or report issues.</p>
                </div>
                <div className="flex gap-2">
                    <AISupportAssistant />
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> New Ticket
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Ticket List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Your Tickets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs">{ticket.id}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="font-medium mt-1">{ticket.subject}</p>
                                <p className="text-xs text-muted-foreground">{ticket.date}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            TKT-001: Cannot add products
                        </CardTitle>
                        <CardDescription>Opened Today • Status: OPEN</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">JD</div>
                                <div className="bg-muted rounded-lg p-3">
                                    <p className="text-sm">Hi, I'm having trouble adding new products. When I submit the form, nothing happens.</p>
                                    <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <div className="bg-primary text-primary-foreground rounded-lg p-3">
                                    <p className="text-sm">Hi John! Thanks for reaching out. Could you tell me which browser you're using?</p>
                                    <p className="text-xs text-primary-foreground/70 mt-1">10:45 AM</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">MP</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            { q: "How do I add a new product?", a: "Go to Products > Add Product and fill in the details." },
                            { q: "How do I update stock levels?", a: "Navigate to Inventory and click 'Update Stock' on any item." },
                            { q: "How do I invite staff members?", a: "Go to Staff > Add Staff and enter their email address." },
                            { q: "Where can I see my sales reports?", a: "Visit the Analytics page for detailed sales reports." },
                        ].map((faq, i) => (
                            <div key={i} className="p-4 rounded-lg bg-muted/50">
                                <p className="font-medium">{faq.q}</p>
                                <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
