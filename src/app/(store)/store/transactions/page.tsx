"use client"

import { useState, useEffect } from "react"
import { getTransactions } from "@/app/actions/transactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Eye, RotateCcw, Printer, ShoppingCart, Wallet, Receipt as ReceiptIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Receipt } from "@/components/pos/Receipt"
import { useRef } from "react"
import { useReactToPrint } from "react-to-print"

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [query, setQuery] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isReceiptOpen, setIsReceiptOpen] = useState(false)

    // Receipt Print Logic
    const receiptRef = useRef<HTMLDivElement>(null)
    const reactToPrintFn = useReactToPrint({ contentRef: receiptRef })
    const handlePrint = () => { if (receiptRef.current) reactToPrintFn() }

    useEffect(() => {
        loadTransactions()
    }, [query])

    const loadTransactions = async () => {
        const res = await getTransactions(query)
        if (res.success) setTransactions(res.orders || [])
    }

    return (
        <div className="space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section with stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Transactions</h2>
                    <p className="text-slate-500 font-medium">Detailed audit of all POS operational yields.</p>
                </div>
                <div className="flex gap-4">
                    <Card className="px-6 py-3 bg-white shadow-sm border-slate-100 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                            <p className="text-xl font-bold text-slate-900">{transactions.length}</p>
                        </div>
                    </Card>
                    <Card className="px-6 py-3 bg-white shadow-sm border-slate-100 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
                            <p className="text-xl font-bold text-slate-900">${transactions.reduce((acc, t) => acc + t.total, 0).toFixed(2)}</p>
                        </div>
                    </Card>
                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200" onClick={loadTransactions}>
                        <RotateCcw className="h-5 w-5 text-slate-400" />
                    </Button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-slate-900" />
                <Input
                    placeholder="Search by receipt ID, customer name..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="h-14 pl-14 pr-6 rounded-2xl bg-white border-slate-200 shadow-sm transition-all focus:ring-4 focus:ring-slate-900/5 font-medium text-slate-600"
                />
            </div>

            {/* Transactions Table */}
            <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="py-5 px-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Receipt ID</TableHead>
                            <TableHead className="py-5 px-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Date & Time</TableHead>
                            <TableHead className="py-5 px-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Customer</TableHead>
                            <TableHead className="py-5 px-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Payment</TableHead>
                            <TableHead className="py-5 px-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Total Yield</TableHead>
                            <TableHead className="py-5 px-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Protocol</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((order) => (
                            <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                                <TableCell className="py-4 px-6">
                                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">#{order.id.slice(-8).toUpperCase()}</span>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm font-medium text-slate-600">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                    <span className="text-[10px] ml-2 text-slate-300 font-bold uppercase">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    {order.customer ? (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-sm">{order.customer.name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{order.customer.email}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 italic text-[10px] font-bold uppercase tracking-widest">Walk-in</span>
                                    )}
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full", order.paymentMethod === 'CASH' ? "bg-emerald-500" : "bg-blue-500")} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{order.paymentMethod}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    <span className="text-base font-extrabold text-slate-900">${order.total.toFixed(2)}</span>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 px-4 rounded-xl hover:bg-slate-900 hover:text-white transition-all group"
                                        onClick={() => {
                                            setSelectedOrder(order)
                                            setIsReceiptOpen(true)
                                        }}
                                    >
                                        <Eye className="h-4 w-4 mr-2 opacity-40 group-hover:opacity-100" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Inspect</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Receipt Viewer Dialog */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="max-w-2xl bg-white border-slate-200 rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <DialogTitle className="sr-only">Receipt Preview</DialogTitle>
                    <div className="p-8 md:p-12 flex flex-col items-center">
                        <DialogHeader className="w-full text-center mb-10">
                            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <ReceiptIcon className="h-8 w-8 text-slate-900" />
                            </div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 uppercase italic">Transaction Node Summary</DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Verified operational record</DialogDescription>
                        </DialogHeader>

                        <div className="w-full bg-slate-50 rounded-2xl p-6 md:p-10 border border-slate-100 shadow-inner mb-8 overflow-y-auto max-h-[50vh]">
                            {selectedOrder && <Receipt ref={receiptRef} order={selectedOrder} />}
                        </div>

                        <div className="flex gap-4 w-full">
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs" onClick={() => setIsReceiptOpen(false)}>Dismiss</Button>
                            <Button className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-wider text-xs shadow-xl shadow-slate-200" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" /> Export Protocol
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
