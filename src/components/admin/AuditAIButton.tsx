"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Loader2 } from "lucide-react"

interface AuditAIButtonProps {
    log: any
}

export function AuditAIButton({ log }: AuditAIButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [explanation, setExplanation] = useState("")

    const handleGetExplanation = async () => {
        setLoading(true)
        try {
            // Mock AI response for now (or connect to real Gemini API if implemented)
            await new Promise(resolve => setTimeout(resolve, 1500))

            const analysis = `
**Event Analysis:** ${log.action.replace(/_/g, " ")}
**User:** ${log.userEmail || 'System'}
**Context:** This action was performed on the ${log.entity} entity.

**Implications:**
This appears to be a standard operational activity. No security risks detected.

**Recommended Action:**
No immediate action required. Monitor for frequency.
      `
            setExplanation(analysis)
        } catch (error) {
            setExplanation("Failed to generate explanation.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    title="Get AI explanation"
                    onClick={handleGetExplanation}
                >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Audit Analysis
                    </DialogTitle>
                    <DialogDescription>
                        Understanding event ID: {log.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Analyzing security logs...</p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-lg prose prose-sm max-w-none dark:bg-slate-900 dark:prose-invert whitespace-pre-line">
                            {explanation || "Click the button to analyze."}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
