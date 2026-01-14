"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Mail, Phone, Shield } from "lucide-react"

import { getStaff, addStaff, recommendRole } from "@/app/actions/staff"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, BrainCircuit } from "lucide-react"

// Mock Staff removed

export default function StaffPage() {
    const [staffList, setStaffList] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isAIRecommending, setIsAIRecommending] = useState(false)
    const [background, setBackground] = useState("")
    const [newStaff, setNewStaff] = useState({
        name: "",
        email: "",
        role: "STORE_STAFF",
        phone: ""
    })
    const { toast } = useToast()

    useEffect(() => {
        loadStaff()
    }, [])

    const loadStaff = async () => {
        setIsLoading(true)
        const res = await getStaff()
        setStaffList(res.staff || [])
        setIsLoading(false)
    }

    const handleAddStaff = async () => {
        const res = await addStaff(newStaff)
        if (res.success) {
            toast({ title: "Staff Added", description: `${newStaff.name} has been enrolled.` })
            setIsAddOpen(false)
            loadStaff()
        }
    }

    const handleAIOptimize = async () => {
        if (!background) return
        setIsAIRecommending(true)
        const res = await recommendRole(background)
        setIsAIRecommending(false)
        if (res.success) {
            setNewStaff({ ...newStaff, role: res.role })
            toast({ title: "AI Optimization Complete", description: `Recommended role: ${res.role}. Reason: ${res.reason}` })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Staff Command</h2>
                    <p className="text-muted-foreground">Manage your store's elite operational team.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Enroll Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Enroll New Operative</DialogTitle>
                            <DialogDescription>Add a new member to your store workforce.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <BrainCircuit className="h-3 w-3 text-purple-600" />
                                    AI Role Optimization
                                </Label>
                                <Textarea
                                    placeholder="Paste resume highlights or background..."
                                    className="bg-white"
                                    value={background}
                                    onChange={e => setBackground(e.target.value)}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                                    onClick={handleAIOptimize}
                                    disabled={isAIRecommending}
                                >
                                    {isAIRecommending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                                    Analyze & Recommend Role
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label>Designated Role</Label>
                                <Select value={newStaff.role} onValueChange={v => setNewStaff({ ...newStaff, role: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STORE_MANAGER">Store Manager</SelectItem>
                                        <SelectItem value="STORE_STAFF">General Staff</SelectItem>
                                        <SelectItem value="CASHIER">Cashier</SelectItem>
                                        <SelectItem value="STOCK_CLERK">Stock Clerk</SelectItem>
                                        <SelectItem value="INVENTORY_MANAGER">Inventory Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Abort</Button>
                            <Button onClick={handleAddStaff}>Confirm Enrollment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{staffList.length}</div>
                        <p className="text-sm text-muted-foreground">Total Staff</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                            {staffList.length}
                        </div>
                        <p className="text-sm text-muted-foreground">Active (Verified)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {[...new Set(staffList.map(s => s.role))].length || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Active Roles</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                        ) : staffList.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">No staff members enrolled yet.</TableCell></TableRow>
                        ) : staffList.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <span className="font-medium">{member.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1 uppercase text-xs font-black tracking-tighter">
                                        <Shield className="h-3 w-3 text-slate-400" /> {member.role.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="flex items-center gap-1 text-sm text-slate-500">
                                        <Mail className="h-3 w-3" /> {member.email}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="flex items-center gap-1 text-sm text-slate-500 font-mono">
                                        <Phone className="h-3 w-3" /> {member.phone || 'N/A'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ACTIVE</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="ghost">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
