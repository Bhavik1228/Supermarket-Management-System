"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, BookOpen, ArrowUpRight, ArrowDownLeft, Loader2, Search, Filter } from "lucide-react"
import { getJournalEntries, getAccounts, createJournalEntry } from "@/app/actions/accounting"
import { useToast } from "@/components/ui/use-toast"

interface JournalLine {
    id: string
    accountId: string
    account?: { name: string; code: string }
    debit: number
    credit: number
}

interface JournalEntry {
    id: string
    description: string
    createdAt: Date
    lines: JournalLine[]
}

interface Account {
    id: string
    name: string
    code: string
    type: string
}

export default function JournalPage() {
    const { toast } = useToast()
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Form state for new journal entry
    const [description, setDescription] = useState("")
    const [lines, setLines] = useState<{ accountId: string; debit: number; credit: number }[]>([
        { accountId: "", debit: 0, credit: 0 },
        { accountId: "", debit: 0, credit: 0 }
    ])

    const storeId = "store-freshmart"

    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            const [entriesRes, accountsRes] = await Promise.all([
                getJournalEntries(storeId),
                getAccounts(storeId)
            ])
            if (entriesRes.success) setEntries(entriesRes.entries || [])
            if (accountsRes.success) setAccounts(accountsRes.accounts || [])
            setIsLoading(false)
        }
        loadData()
    }, [])

    const handleAddLine = () => {
        setLines([...lines, { accountId: "", debit: 0, credit: 0 }])
    }

    const handleLineChange = (index: number, field: string, value: string | number) => {
        const newLines = [...lines]
        // @ts-ignore
        newLines[index][field] = value
        setLines(newLines)
    }

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast({ title: "Validation Error", description: "Description is required", variant: "destructive" })
            return
        }

        const validLines = lines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0))
        if (validLines.length < 2) {
            toast({ title: "Validation Error", description: "At least two lines are required", variant: "destructive" })
            return
        }

        const totalDebit = validLines.reduce((sum, l) => sum + l.debit, 0)
        const totalCredit = validLines.reduce((sum, l) => sum + l.credit, 0)
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            toast({ title: "Balance Error", description: `Debits ($${totalDebit.toFixed(2)}) must equal Credits ($${totalCredit.toFixed(2)})`, variant: "destructive" })
            return
        }

        setIsSubmitting(true)
        const res = await createJournalEntry(storeId, description, validLines)
        setIsSubmitting(false)

        if (res.success) {
            toast({ title: "Success", description: "Journal entry posted successfully" })
            setIsDialogOpen(false)
            setDescription("")
            setLines([{ accountId: "", debit: 0, credit: 0 }, { accountId: "", debit: 0, credit: 0 }])
            // Reload entries
            const entriesRes = await getJournalEntries(storeId)
            if (entriesRes.success) setEntries(entriesRes.entries || [])
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const filteredEntries = entries.filter(e =>
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Journal Entries</h2>
                    <p className="text-muted-foreground">View and create double-entry bookkeeping records.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Journal Entry</DialogTitle>
                            <DialogDescription>Post a new double-entry transaction. Debits must equal credits.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    placeholder="e.g., Monthly rent payment"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Lines</label>
                                <div className="space-y-2">
                                    {lines.map((line, index) => (
                                        <div key={index} className="grid grid-cols-3 gap-2">
                                            <Select value={line.accountId} onValueChange={val => handleLineChange(index, 'accountId', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Account" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                placeholder="Debit"
                                                value={line.debit || ''}
                                                onChange={e => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Credit"
                                                value={line.credit || ''}
                                                onChange={e => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={handleAddLine}>
                                    <Plus className="mr-2 h-3 w-3" /> Add Line
                                </Button>
                            </div>
                            <div className="flex justify-between text-sm font-medium bg-muted p-3 rounded-lg">
                                <span>Total Debits: ${lines.reduce((s, l) => s + l.debit, 0).toFixed(2)}</span>
                                <span>Total Credits: ${lines.reduce((s, l) => s + l.credit, 0).toFixed(2)}</span>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post Entry
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search entries..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" /> Transaction Ledger
                    </CardTitle>
                    <CardDescription>All posted journal entries and their line items.</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredEntries.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No journal entries found</p>
                            <p className="text-sm">Create your first entry to start tracking finances.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredEntries.map(entry => (
                                <div key={entry.id} className="border rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{entry.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline">JE-{entry.id.slice(-6).toUpperCase()}</Badge>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Account</TableHead>
                                                <TableHead className="text-right">Debit</TableHead>
                                                <TableHead className="text-right">Credit</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {entry.lines.map(line => (
                                                <TableRow key={line.id}>
                                                    <TableCell className="flex items-center gap-2">
                                                        {line.debit > 0 ? (
                                                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <ArrowDownLeft className="h-4 w-4 text-red-600" />
                                                        )}
                                                        {line.account?.code} - {line.account?.name}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {line.debit > 0 ? `$${line.debit.toFixed(2)}` : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {line.credit > 0 ? `$${line.credit.toFixed(2)}` : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
