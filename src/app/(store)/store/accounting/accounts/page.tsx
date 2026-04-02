"use client"

import { useState, useEffect } from "react"
import { getAccounts, createAccount } from "@/app/actions/accounting"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast()

    // Form State
    const [newAccount, setNewAccount] = useState({ name: "", code: "", type: "EXPENSE" })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const res = await getAccounts("store-freshmart")
        if (res.success && res.accounts) {
            setAccounts(res.accounts)
        }
        setLoading(false)
    }

    async function handleAdd() {
        if (!newAccount.name || !newAccount.code) return
        const res = await createAccount("store-freshmart", newAccount)
        if (res.success) {
            toast({ title: "Account Created" })
            setIsOpen(false)
            setNewAccount({ name: "", code: "", type: "EXPENSE" })
            loadData()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium">Chart of Accounts</h2>
                    <p className="text-sm text-muted-foreground">Manage your detailed financial ledgers.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Ledger Account</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm">Code</label>
                                <Input className="col-span-3" value={newAccount.code} onChange={e => setNewAccount({ ...newAccount, code: e.target.value })} placeholder="e.g. 1001" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm">Name</label>
                                <Input className="col-span-3" value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })} placeholder="e.g. Petty Cash" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm">Type</label>
                                <Select value={newAccount.type} onValueChange={v => setNewAccount({ ...newAccount, type: v })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ASSET">Asset</SelectItem>
                                        <SelectItem value="LIABILITY">Liability</SelectItem>
                                        <SelectItem value="EQUITY">Equity</SelectItem>
                                        <SelectItem value="INCOME">Income</SelectItem>
                                        <SelectItem value="EXPENSE">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAdd}>Create Ledger</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : accounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No accounts found. Create one to start.
                                </TableCell>
                            </TableRow>
                        ) : (
                            accounts.map((acc: any) => (
                                <TableRow key={acc.id}>
                                    <TableCell className="font-mono">{acc.code}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{acc.type}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{acc.name}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        ${acc.balance.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
