"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RotateCcw, PackageOpen, AlertTriangle, Loader2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getTransactions, requestRefund } from "@/app/actions/transactions"
import { getPurchaseOrder } from "@/app/actions/purchase-orders"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReturnSlip } from "@/components/returns/ReturnSlip"

export default function ReturnsPage() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Returns Management</h2>
                <p className="text-muted-foreground">Process customer refunds and vendor returns.</p>
            </div>

            <Tabs defaultValue="customer" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="customer">Customer Returns</TabsTrigger>
                    <TabsTrigger value="vendor">Vendor Returns (Stock)</TabsTrigger>
                </TabsList>

                <TabsContent value="customer" className="space-y-4">
                    <CustomerReturns />
                </TabsContent>

                <TabsContent value="vendor" className="space-y-4">
                    <VendorReturns />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function CustomerReturns() {
    const [step, setStep] = useState(1)
    const [query, setQuery] = useState("")
    const [order, setOrder] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [reason, setReason] = useState("")
    const [refundMethod, setRefundMethod] = useState("CASH")
    const [isRequesting, setIsRequesting] = useState(false)
    const [isNoBill, setIsNoBill] = useState(false)
    const [showSlip, setShowSlip] = useState(false)

    const handleSearch = async () => {
        setIsLoading(true)
        const res = await getTransactions(query)
        if (res.success && res.orders && res.orders.length > 0) {
            setOrder(res.orders[0])
            setStep(2)
        } else {
            alert("Order not found")
        }
        setIsLoading(false)
    }

    const toggleItem = (item: any) => {
        const exists = selectedItems.find(i => i.id === item.id)
        if (exists) {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id))
        } else {
            setSelectedItems([...selectedItems, { ...item, returnQty: 1 }])
        }
    }

    const handleProcessReturn = async () => {
        if (!reason) return alert("Please provide a reason")
        setIsRequesting(true)
        const res = await requestRefund(order?.id || "NO_BILL", reason, "staff-id") // User ID from session normally
        setIsRequesting(false)

        if (res.success) {
            setShowSlip(true)
        } else {
            alert(res.error || "Failed to process return")
        }
    }

    const reset = () => {
        setStep(1)
        setOrder(null)
        setQuery("")
        setSelectedItems([])
        setReason("")
        setIsNoBill(false)
    }

    return (
        <div className="space-y-4">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                            {s}
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
                            {s === 1 ? 'Find' : s === 2 ? 'Select' : 'Confirm'}
                        </span>
                        {s < 3 && <div className="h-[2px] w-12 bg-muted mx-2" />}
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Step 1: Find */}
                {step === 1 && (
                    <Card className="col-span-7 border-2 border-primary/20">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter italic">Order Retrieval</CardTitle>
                            <CardDescription>Locate the original transmission record.</CardDescription>
                        </CardHeader>
                        <CardContent className="max-w-md mx-auto space-y-4 pb-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Receipt / Transaction ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="SCAN RECEIPT OR TYPE ID..."
                                        className="h-14 bg-slate-50 border-2 border-slate-200 font-black text-lg"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button size="icon" className="h-14 w-14" onClick={handleSearch} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or</span></div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-14 border-dashed border-2 hover:bg-slate-50 text-slate-600 font-bold"
                                onClick={() => {
                                    setIsNoBill(true)
                                    setStep(2)
                                }}
                            >
                                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> PROCEED WITHOUT BILL
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Select Items */}
                {step === 2 && (
                    <Card className="col-span-7 animate-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Manifest Inspection</CardTitle>
                                    <CardDescription>{isNoBill ? 'No bill provided. Scanning required.' : `Inspecting Order #${order?.id.slice(0, 8)}`}</CardDescription>
                                </div>
                                <Button variant="ghost" className="text-xs uppercase font-black tracking-widest" onClick={reset}>Cancel</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isNoBill ? (
                                <div className="space-y-4 max-w-xl mx-auto py-8">
                                    <div className="text-center space-y-2">
                                        <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertTriangle className="h-8 w-8 text-amber-600" />
                                        </div>
                                        <p className="font-black uppercase tracking-widest text-slate-900">Manual Item Verification</p>
                                        <p className="text-sm text-slate-500">Scan items individually to authorize a return without original documentation.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input placeholder="SCAN ITEM BARCODE..." className="h-14 font-black" />
                                        <Button className="h-14 px-8 bg-slate-900 text-white font-black">SCAN</Button>
                                    </div>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]"></TableHead>
                                            <TableHead>Designation</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item: any) => (
                                            <TableRow key={item.id} className={selectedItems.find(i => i.id === item.id) ? 'bg-primary/5' : ''}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 rounded border-slate-300"
                                                        checked={!!selectedItems.find(i => i.id === item.id)}
                                                        onChange={() => toggleItem(item)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-bold uppercase text-xs">{item.name}</TableCell>
                                                <TableCell className="font-mono">${item.price}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>
                                                    {selectedItems.find(i => i.id === item.id) && (
                                                        <Input
                                                            type="number"
                                                            className="w-16 h-8 text-xs font-black"
                                                            defaultValue={1}
                                                            max={item.quantity}
                                                            min={1}
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            <div className="flex justify-end pt-4">
                                <Button
                                    className="h-14 px-12 font-black uppercase tracking-widest"
                                    onClick={() => setStep(3)}
                                    disabled={!isNoBill && selectedItems.length === 0}
                                >
                                    Review Selection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div className="col-span-7 grid md:grid-cols-7 gap-6">
                        <Card className={`${showSlip ? 'md:col-span-3' : 'md:col-span-7'} animate-in slide-in-from-right-4 duration-300 overflow-hidden`}>
                            <CardHeader>
                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter italic">Final Authorization</CardTitle>
                                <CardDescription>Specify refund mechanics and finalize return.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Reason for Return</Label>
                                        <Select onValueChange={setReason}>
                                            <SelectTrigger className="h-12 font-bold">
                                                <SelectValue placeholder="SELECT CAUSE..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="defective">Defective / Non-Functional</SelectItem>
                                                <SelectItem value="wrong_item">Incorrect Item Received</SelectItem>
                                                <SelectItem value="change_of_mind">Customer Preference Change</SelectItem>
                                                <SelectItem value="expired">Near Expiry / Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Refund Displacement Method</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['CASH', 'STORE_CREDIT', 'ORIGINAL_CARD'].map(m => (
                                                <Button
                                                    key={m}
                                                    variant={refundMethod === m ? 'default' : 'outline'}
                                                    className="h-12 text-[9px] font-black"
                                                    onClick={() => setRefundMethod(m)}
                                                >
                                                    {m.replace('_', ' ')}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center text-center">
                                    <RotateCcw className="h-12 w-12 text-slate-300 mb-4" />
                                    <p className="text-sm text-slate-600 mb-1">Total Authorized Refund:</p>
                                    <p className="text-4xl font-black italic tracking-tighter text-slate-900 mb-6">
                                        ${(isNoBill ? 0 : selectedItems.reduce((acc, i) => acc + (i.price * (i.returnQty || 1)), 0)).toFixed(2)}
                                    </p>
                                    <Button
                                        className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-xl shadow-red-500/20"
                                        onClick={handleProcessReturn}
                                        disabled={isRequesting || showSlip}
                                    >
                                        {isRequesting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : showSlip ? 'AUTHORIZED' : 'EXECUTE AUTHORIZATION'}
                                    </Button>
                                    {!showSlip && <Button variant="ghost" className="mt-2 text-xs text-slate-400 font-bold" onClick={() => setStep(2)}>Adjust Selection</Button>}
                                    {showSlip && <Button variant="outline" className="mt-2 w-full font-bold" onClick={reset}>Close & Start New</Button>}
                                </div>
                            </CardContent>
                        </Card>
                        {showSlip && (
                            <div className="md:col-span-4 animate-in zoom-in-95 duration-500">
                                <ReturnSlip
                                    orderId={order?.id || "NO_BILL"}
                                    items={selectedItems}
                                    total={isNoBill ? 0 : selectedItems.reduce((acc, i) => acc + (i.price * (i.returnQty || 1)), 0)}
                                    reason={reason}
                                    type="CUSTOMER"
                                    timestamp={new Date()}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function VendorReturns() {
    const [barcode, setBarcode] = useState("")
    const [poId, setPoId] = useState("")
    const [scannedItems, setScannedItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchMode, setSearchMode] = useState<"SCAN" | "PO">("SCAN")
    const [showSlip, setShowSlip] = useState(false)
    const [reason, setReason] = useState("Damaged Stock")

    const handleScan = () => {
        if (!barcode) return
        setScannedItems([...scannedItems, {
            id: Date.now(),
            productId: "MANUAL",
            name: `Product ${barcode}`,
            qty: 1,
            reason: 'damaged'
        }])
        setBarcode("")
    }

    const handlePOSearch = async () => {
        if (!poId) return
        setIsLoading(true)
        const res = await getPurchaseOrder(poId)
        if (res.success && res.po) {
            const newItems = res.po.items.map((item: any) => ({
                id: item.id,
                productId: item.productId,
                name: item.productName,
                qty: item.quantity,
                reason: 'damaged'
            }))
            // Add unique items from PO to current manifest
            const currentIds = new Set(scannedItems.map(i => i.id))
            const filtered = newItems.filter((i: any) => !currentIds.has(i.id))
            setScannedItems([...scannedItems, ...filtered])
            setPoId("")
        } else {
            alert("Purchase Order not found")
        }
        setIsLoading(false)
    }

    return (
        <Card className="border-2 border-amber-500/20 bg-amber-50/5">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-black italic uppercase tracking-tighter italic text-amber-700">Vendor Logistics: Return Manifest</CardTitle>
                        <CardDescription>Log damaged or expired units for supplier credit.</CardDescription>
                    </div>
                    <div className="flex bg-amber-100 p-1 rounded-xl">
                        <Button
                            variant={searchMode === 'SCAN' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-lg text-[10px] font-black"
                            onClick={() => setSearchMode('SCAN')}
                        >
                            BY SCAN
                        </Button>
                        <Button
                            variant={searchMode === 'PO' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-lg text-[10px] font-black"
                            onClick={() => setSearchMode('PO')}
                        >
                            BY PO ID
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2 max-w-xl">
                    {searchMode === 'SCAN' ? (
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                            <Input
                                placeholder="SCAN VENDOR PRODUCT..."
                                className="pl-10 h-14 font-black border-2 border-amber-200 focus:border-amber-500"
                                value={barcode}
                                onChange={e => setBarcode(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleScan()}
                            />
                        </div>
                    ) : (
                        <div className="relative flex-1">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                            <Input
                                placeholder="ENTER PURCHASE ORDER ID..."
                                className="pl-10 h-14 font-black border-2 border-amber-200 focus:border-amber-500"
                                value={poId}
                                onChange={e => setPoId(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePOSearch()}
                            />
                        </div>
                    )}
                    <Button
                        className="h-14 px-8 bg-amber-600 hover:bg-amber-700 text-white font-black"
                        onClick={searchMode === 'SCAN' ? handleScan : handlePOSearch}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : searchMode === 'SCAN' ? 'ADD ITEM' : 'FETCH PO'}
                    </Button>
                </div>

                <div className="border-2 border-amber-100 rounded-[24px] overflow-hidden bg-white shadow-sm">
                    <Table>
                        <TableHeader className="bg-amber-50">
                            <TableRow>
                                <TableHead className="font-black text-amber-900 text-[10px] uppercase tracking-widest">Entry</TableHead>
                                <TableHead className="font-black text-amber-900 text-[10px] uppercase tracking-widest">Units</TableHead>
                                <TableHead className="font-black text-amber-900 text-[10px] uppercase tracking-widest">Defect Class</TableHead>
                                <TableHead className="text-right font-black text-amber-900 text-[10px] uppercase tracking-widest">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scannedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-400 italic font-medium">No items scanned or fetched for return manifestation.</TableCell>
                                </TableRow>
                            ) : (
                                scannedItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-bold flex items-center gap-3">
                                            <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                                                <PackageOpen className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span>{item.name}</span>
                                                <span className="text-[10px] text-slate-400 font-mono italic">ID: {item.productId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" defaultValue={item.qty} className="h-8 w-16 text-xs font-black" />
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">DAMAGED</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setScannedItems(scannedItems.filter(i => i.id !== item.id))}>Remove</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="font-bold text-slate-400" onClick={() => {
                        setScannedItems([])
                        setShowSlip(false)
                    }}>CLEAR ALL</Button>
                    <Button
                        className="h-14 px-12 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest"
                        onClick={() => setShowSlip(true)}
                        disabled={scannedItems.length === 0 || showSlip}
                    >
                        {showSlip ? 'MANIFEST POSTED' : 'POST MANIFEST & RECONCILE'}
                    </Button>
                </div>

                {showSlip && (
                    <div className="pt-8 animate-in zoom-in-95 duration-500">
                        <ReturnSlip
                            orderId={`VEND-${Date.now().toString().slice(-6)}`}
                            items={scannedItems.map(i => ({ ...i, price: 0 }))} // Price hidden/not applicable for vendor stock returns
                            total={0}
                            reason={"Vendor Stock Reconciliation"}
                            type="VENDOR"
                            timestamp={new Date()}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
