"use client"

import { useState, useEffect } from "react"
import { getPurchaseOrders, updatePOStatus } from "@/app/actions/purchase-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Truck, Eye, FileText, ArrowLeft, MoreHorizontal, CheckCircle2, Send, XCircle, Printer } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { use } from "react"

export default function PurchaseOrdersPage() {
    const [pos, setPos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPO, setSelectedPO] = useState<any>(null)
    const { toast } = useToast()

    const searchParams = useSearchParams()
    const supplierId = searchParams.get('supplierId')

    useEffect(() => {
        loadPOs()
    }, [supplierId])

    const loadPOs = async () => {
        setLoading(true)
        const res = await getPurchaseOrders('store-freshmart', supplierId || undefined)
        if (res.success) setPos(res.pos || [])
        setLoading(false)
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const res = await updatePOStatus(id, newStatus)
        if (res.success) {
            toast({
                title: "Status Updated",
                description: `Purchase order marked as ${newStatus}`
            })
            loadPOs()
        } else {
            toast({
                title: "Error",
                description: res.error,
                variant: "destructive"
            })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700'
            case 'SENT': return 'bg-blue-100 text-blue-700'
            case 'RECEIVED': return 'bg-green-100 text-green-700'
            case 'CANCELLED': return 'bg-red-100 text-red-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/store">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
                        <p className="text-muted-foreground">Manage and track your procurement history.</p>
                    </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-indigo-600" />
                </div>
            </div>

            <Card className="border-none shadow-lg print:shadow-none print:border-none">
                <CardHeader className="print:hidden">
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>A list of all purchase orders generated for this store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead className="text-right print:hidden">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : pos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No purchase orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pos.map((po) => (
                                    <TableRow key={po.id}>
                                        <TableCell className="font-mono text-xs uppercase">{po.id}</TableCell>
                                        <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge className={`${getStatusColor(po.status)} border-transparent`}>
                                                {po.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{po.items?.length || 0} items</TableCell>
                                        <TableCell className="text-right font-bold">${po.total.toFixed(2)}</TableCell>
                                        <TableCell className="text-right print:hidden">
                                            <div className="flex justify-end gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(po.id, 'SENT')}>
                                                            <Send className="mr-2 h-4 w-4" /> Mark as Sent
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(po.id, 'RECEIVED')}>
                                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Received
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleStatusUpdate(po.id, 'CANCELLED')}>
                                                            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedPO(po)}>
                                                            <Eye className="h-4 w-4 mr-2" /> View Details
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl print:max-w-none print:shadow-none print:border-none">
                                                        <DialogHeader className="print:hidden">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <DialogTitle className="flex items-center gap-2 font-mono uppercase text-sm">
                                                                        <FileText className="h-4 w-4 text-indigo-500" />
                                                                        Order Details: {po.id}
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        Generated on {new Date(po.createdAt).toLocaleString()}
                                                                    </DialogDescription>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="font-bold gap-2 bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                                                                    onClick={() => window.print()}
                                                                >
                                                                    <Printer className="h-4 w-4" />
                                                                    PRINT / SAVE PDF
                                                                </Button>
                                                            </div>
                                                        </DialogHeader>

                                                        {/* Print Header (Only visible when printing) */}
                                                        <div className="hidden print:block text-center mb-8 border-b pb-4">
                                                            <h1 className="text-3xl font-black tracking-tighter italic">FRESHMART PURCHASE ORDER</h1>
                                                            <p className="text-sm text-slate-500 uppercase font-mono mt-2">ID: {po.id}</p>
                                                            <p className="text-xs text-slate-400 mt-1">Generated: {new Date(po.createdAt).toLocaleString()}</p>
                                                        </div>

                                                        <div className="mt-4 space-y-4">
                                                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                                                <Table>
                                                                    <TableHeader className="bg-slate-50">
                                                                        <TableRow>
                                                                            <TableHead>Product</TableHead>
                                                                            <TableHead className="text-right">Qty</TableHead>
                                                                            <TableHead className="text-right">Unit Price</TableHead>
                                                                            <TableHead className="text-right">Total</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {po.items?.map((item: any) => (
                                                                            <TableRow key={item.id}>
                                                                                <TableCell className="font-medium">{item.productName || item.product?.name || 'Item'}</TableCell>
                                                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                                                <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                                                                <TableCell className="text-right font-bold">${item.total.toFixed(2)}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>

                                                            <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl print:bg-white print:border print:border-indigo-100">
                                                                <span className="text-indigo-900 font-bold">Grand Total</span>
                                                                <span className="text-2xl font-black text-indigo-600">${po.total.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
