"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Loader2, ArrowLeft, Receipt, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { createInvoice, createQuotation, createProformaInvoice, createDeliveryNote } from "@/app/actions/documents"
import { useToast } from "@/components/ui/use-toast"

interface LineItem {
    name: string
    quantity: number
    price: number
    tax: number
}

function CreateDocumentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const docType = searchParams.get('type') || 'invoice'
    const isQuotation = docType === 'quotation'
    const isProforma = docType === 'proforma'
    const isDeliveryNote = docType === 'delivery-note'

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Customer Info
    const [customerName, setCustomerName] = useState("")
    const [customerEmail, setCustomerEmail] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [customerAddress, setCustomerAddress] = useState("")

    // Document Info
    const [notes, setNotes] = useState("")
    const [validityDays, setValidityDays] = useState("30")
    const [dueDays, setDueDays] = useState("30")

    // Line Items
    const [items, setItems] = useState<LineItem[]>([
        { name: "", quantity: 1, price: 0, tax: 0 }
    ])

    const storeId = "store-freshmart"

    const handleAddItem = () => {
        setItems([...items, { name: "", quantity: 1, price: 0, tax: 0 }])
    }

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...items]
        // @ts-ignore
        newItems[index][field] = value
        setItems(newItems)
    }

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const totalTax = items.reduce((sum, item) => sum + (item.quantity * item.price * item.tax / 100), 0)
    const total = subtotal + totalTax

    const handleSubmit = async () => {
        // Validation
        if (!customerName.trim()) {
            toast({ title: "Validation Error", description: "Customer name is required", variant: "destructive" })
            return
        }

        const validItems = items.filter(item => item.name.trim() && item.quantity > 0 && item.price > 0)
        if (validItems.length === 0) {
            toast({ title: "Validation Error", description: "At least one valid item is required", variant: "destructive" })
            return
        }

        setIsSubmitting(true)

        const data = {
            customerName,
            customerEmail: customerEmail || undefined,
            customerPhone: customerPhone || undefined,
            customerAddress: customerAddress || undefined,
            items: validItems,
            notes: notes || undefined,
        }

        let res
        if (isQuotation) {
            const validUntil = new Date()
            validUntil.setDate(validUntil.getDate() + parseInt(validityDays))
            res = await createQuotation(storeId, { ...data, validUntil })
        } else if (isProforma) {
            res = await createProformaInvoice(storeId, { ...data, subtotal, tax: totalTax, total })
        } else if (isDeliveryNote) {
            res = await createDeliveryNote(storeId, { ...data, subtotal })
        } else {
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + parseInt(dueDays))
            res = await createInvoice(storeId, { ...data, dueDate })
        }

        setIsSubmitting(false)

        if (res.success) {
            toast({ title: "Success", description: `${isQuotation ? 'Quotation' : 'Invoice'} created successfully` })
            router.push('/store/documents')
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/store/documents">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isQuotation ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {isQuotation ? (
                            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                        ) : (
                            <Receipt className="h-6 w-6 text-green-600" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Create {isQuotation ? 'Quotation' : isProforma ? 'Proforma Invoice' : isDeliveryNote ? 'Delivery Note' : 'Invoice'}
                        </h2>
                        <p className="text-muted-foreground">
                            {isQuotation
                                ? 'Generate a price quote for your customer'
                                : 'Bill your customer for products or services'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Customer Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                    <CardDescription>Enter the customer information for this {isQuotation ? 'quotation' : 'invoice'}.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="customerName">Customer Name *</Label>
                        <Input
                            id="customerName"
                            placeholder="John Doe or ABC Company"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                            id="customerEmail"
                            type="email"
                            placeholder="customer@example.com"
                            value={customerEmail}
                            onChange={e => setCustomerEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerPhone">Phone</Label>
                        <Input
                            id="customerPhone"
                            placeholder="+1 234 567 8900"
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerAddress">Address</Label>
                        <Input
                            id="customerAddress"
                            placeholder="123 Main St, City, Country"
                            value={customerAddress}
                            onChange={e => setCustomerAddress(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                    <CardDescription>Add products or services to this {isQuotation ? 'quotation' : 'invoice'}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Item Description</TableHead>
                                <TableHead className="w-[15%]">Qty</TableHead>
                                <TableHead className="w-[15%]">Price</TableHead>
                                <TableHead className="w-[15%]">Tax %</TableHead>
                                <TableHead className="w-[15%] text-right">Total</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Input
                                            placeholder="Product or service name"
                                            value={item.name}
                                            onChange={e => handleItemChange(index, 'name', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.price}
                                            onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={item.tax}
                                            onChange={e => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-semibold">
                                        ${(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button variant="outline" className="mt-4" onClick={handleAddItem}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </CardContent>
            </Card>

            {/* Summary & Options */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>{isQuotation ? 'Valid For (Days)' : 'Payment Due (Days)'}</Label>
                            <Select
                                value={isQuotation ? validityDays : dueDays}
                                onValueChange={val => isQuotation ? setValidityDays(val) : setDueDays(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 days</SelectItem>
                                    <SelectItem value="14">14 days</SelectItem>
                                    <SelectItem value="30">30 days</SelectItem>
                                    <SelectItem value="60">60 days</SelectItem>
                                    <SelectItem value="90">90 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Additional notes or terms..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-mono">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-mono">${totalTax.toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="font-mono">${total.toFixed(2)}</span>
                        </div>
                        <Button
                            className="w-full mt-4"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create {isQuotation ? 'Quotation' : 'Invoice'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}

export default function CreateDocumentPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <CreateDocumentContent />
        </Suspense>
    )
}
