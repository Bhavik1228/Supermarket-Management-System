"use client"

import { useState, useEffect } from "react"
import { getTaxSlabs, createTaxSlab } from "@/app/actions/accounting"
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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TaxPage() {
    const [slabs, setSlabs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast()

    // Form State
    const [newSlab, setNewSlab] = useState({ name: "", rate: "0", type: "PERCENTAGE" })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const res = await getTaxSlabs("store-freshmart")
        if (res.success && res.slabs) {
            setSlabs(res.slabs)
        }
        setLoading(false)
    }

    async function handleAdd() {
        if (!newSlab.name) return
        const rateVal = parseFloat(newSlab.rate)
        const res = await createTaxSlab("store-freshmart", { ...newSlab, rate: rateVal })
        if (res.success) {
            toast({ title: "Tax Slab Created" })
            setIsOpen(false)
            setNewSlab({ name: "", rate: "0", type: "PERCENTAGE" })
            loadData()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium">Tax Configuration</h2>
                    <p className="text-sm text-muted-foreground">Manage applicable tax rates for sales and purchases.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Tax Slab</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Tax Rule</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm">Name</label>
                                <Input className="col-span-3" value={newSlab.name} onChange={e => setNewSlab({ ...newSlab, name: e.target.value })} placeholder="e.g. VAT Standard" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm">Rate</label>
                                <Input type="number" className="col-span-3" value={newSlab.rate} onChange={e => setNewSlab({ ...newSlab, rate: e.target.value })} placeholder="0.18" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm">Type</label>
                                <Select value={newSlab.type} onValueChange={v => setNewSlab({ ...newSlab, type: v })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage (0.1 = 10%)</SelectItem>
                                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAdd}>Create Rule</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : slabs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No tax slabs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            slabs.map((slab: any) => (
                                <TableRow key={slab.id}>
                                    <TableCell className="font-medium">{slab.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{slab.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        {slab.type === 'PERCENTAGE' ? `${(slab.rate * 100).toFixed(1)}%` : `$${slab.rate}`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge className={slab.isActive ? "bg-green-500" : "bg-gray-500"}>
                                            {slab.isActive ? "Active" : "Inactive"}
                                        </Badge>
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
