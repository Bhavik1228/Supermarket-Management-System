"use client"

import { useState, useEffect } from "react"
import { getCustomers, createCustomer } from "@/app/actions/customers"
import { manualAdjustPoints } from "@/app/actions/loyalty"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, User, ShoppingBag, CreditCard, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([])
    const [query, setQuery] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" })

    // Adjustment State
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [pointsToAdjust, setPointsToAdjust] = useState(0)
    const [adjustReason, setAdjustReason] = useState("")
    const [isAdjustOpen, setIsAdjustOpen] = useState(false)
    const [isAdjusting, setIsAdjusting] = useState(false)

    useEffect(() => {
        loadCustomers()
    }, [query])

    const loadCustomers = async () => {
        const res = await getCustomers(query)
        if (res.success) setCustomers(res.customers || [])
    }

    const handleAdjustPoints = async () => {
        if (!selectedCustomer?.LoyaltyAccount?.[0]) return
        if (adjustReason.length < 10) return alert("Reason must be at least 10 characters")

        setIsAdjusting(true)
        const res = await manualAdjustPoints(
            selectedCustomer.LoyaltyAccount[0].id,
            pointsToAdjust,
            adjustReason,
            "staff-id" // In real app, get from session
        )
        setIsAdjusting(false)

        if (res.success) {
            alert("Points adjusted successfully!")
            setIsAdjustOpen(false)
            setPointsToAdjust(0)
            setAdjustReason("")
            loadCustomers()
        } else {
            alert(res.error || "Adjustment failed")
        }
    }

    const handleCreate = async () => {
        if (!newCustomer.name || !newCustomer.phone) return alert("Name and Phone are required")
        const res = await createCustomer(newCustomer)
        if (res.success) {
            setIsAddOpen(false)
            setNewCustomer({ name: "", email: "", phone: "" })
            loadCustomers()
        } else {
            alert(res.error)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground">Manage loyalty members and store customers</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Customer</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input className="col-span-3" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Phone</Label>
                                <Input className="col-span-3" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Email</Label>
                                <Input className="col-span-3" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Save Customer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, phone or email..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customers.filter(c => c.LoyaltyAccount?.length > 0).length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Loyalty Points</TableHead>
                            <TableHead>Total Orders</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm">{customer.email}</span>
                                        <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {customer.LoyaltyAccount?.[0]?.pointsBalance || 0} pts
                                </TableCell>
                                <TableCell>{customer._count?.orders || 0}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm">View History</Button>
                                        {customer.LoyaltyAccount?.[0] && (
                                            <Dialog open={isAdjustOpen && selectedCustomer?.id === customer.id} onOpenChange={(open) => {
                                                if (!open) {
                                                    setIsAdjustOpen(false)
                                                    setSelectedCustomer(null)
                                                }
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        setSelectedCustomer(customer)
                                                        setIsAdjustOpen(true)
                                                    }}>
                                                        Adjust Points
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Adjust Points: {customer.name}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label>Amount (Negative to deduct)</Label>
                                                            <Input
                                                                type="number"
                                                                value={pointsToAdjust}
                                                                onChange={e => setPointsToAdjust(parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Reason (Min. 10 chars)</Label>
                                                            <Input
                                                                placeholder="Reason for adjustment..."
                                                                value={adjustReason}
                                                                onChange={e => setAdjustReason(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            onClick={handleAdjustPoints}
                                                            disabled={isAdjusting}
                                                        >
                                                            {isAdjusting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                            Confirm Adjustment
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
