"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, MessageCircle, Loader2, Bot, Send } from "lucide-react"
import { createAITicket } from "@/app/actions/support"
import { useToast } from "@/components/ui/use-toast"

interface AISupportAssistantProps {
    variant?: "default" | "outline" | "ghost"
    className?: string
}

export function AISupportAssistant({ variant = "default", className }: AISupportAssistantProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async () => {
        if (!description.trim()) return
        setIsSubmitting(true)
        const res = await createAITicket(description)
        setIsSubmitting(false)
        if (res.success) {
            toast({ title: "Intelligence Posted", description: "Your ticket has been prioritized and drafted by AI." })
            setIsOpen(false)
            setDescription("")
        } else {
            toast({ title: "Submission Failed", description: "The AI agent could not route your request.", variant: "destructive" })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} className={className}>
                    <Sparkles className="mr-2 h-4 w-4 text-purple-500 animate-pulse" />
                    AI Support Assistant
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-slate-950 border-white/10 text-white rounded-[32px] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x" />
                <DialogHeader className="pt-6">
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Bot className="h-6 w-6 text-purple-400" />
                        Neural Support Agent
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Describe your issue in plain language. Our AI will categorize, prioritize, and route it to the elite engineering team.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                    <div className="relative">
                        <Textarea
                            placeholder="e.g. The thermal receipt printer is skipping lines during POS checkout..."
                            className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl resize-none focus:ring-purple-500/50"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                        <div className="absolute bottom-3 right-3 opacity-20">
                            <Sparkles className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <Bot className="h-4 w-4 text-purple-400" />
                        <p className="text-[10px] font-mono text-purple-300 uppercase leading-tight">
                            AI will auto-tag this ticket based on severity and technical domain for rapid resolution.
                        </p>
                    </div>
                </div>
                <DialogFooter className="pb-6">
                    <Button
                        className="w-full h-14 bg-white text-slate-950 hover:bg-slate-200 font-black uppercase tracking-widest rounded-2xl group transition-all"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !description.trim()}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Transmit Request
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
