"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
    FileText, FilePlus, Search, Download, Printer, Eye, Send,
    Receipt, FileSpreadsheet, FileCheck, Loader2, MoreHorizontal, Truck
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getDocuments } from "@/app/actions/documents"
import { useToast } from "@/components/ui/use-toast"

interface Document {
    id: string
    type: string
    number: string
    customerName?: string
    total: number
    status: string
    createdAt: string
}

const documentTypes = [
    { value: "all", label: "All Documents", icon: FileText },
    { value: "INVOICE", label: "Invoices", icon: Receipt },
    { value: "QUOTATION", label: "Quotations", icon: FileSpreadsheet },
    { value: "DELIVERY_NOTE", label: "Delivery Notes", icon: Truck },
    { value: "CREDIT_NOTE", label: "Credit Notes", icon: FileCheck },
]

const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SENT: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    ACCEPTED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-orange-100 text-orange-800",
    PENDING: "bg-amber-100 text-amber-800",
    ISSUED: "bg-indigo-100 text-indigo-800",
}

export default function DocumentsPage() {
    const { toast } = useToast()
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    const storeId = "store-freshmart"

    useEffect(() => {
        async function loadDocuments() {
            setIsLoading(true)
            const type = activeTab === "all" ? undefined : activeTab
            const res = await getDocuments(storeId, type)
            if (res.success) {
                setDocuments((res.documents || []) as any)
            }
            setIsLoading(false)
        }
        loadDocuments()
    }, [activeTab])

    const filteredDocuments = documents.filter(doc =>
        doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = {
        total: documents.length,
        invoices: documents.filter(d => d.type === 'INVOICE').length,
        quotations: documents.filter(d => d.type === 'QUOTATION').length,
        pending: documents.filter(d => d.status === 'SENT' || d.status === 'DRAFT').length,
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                    <p className="text-muted-foreground">Create and manage invoices, quotations, and more.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/store/documents/create?type=delivery_note">
                        <Button variant="ghost">
                            <Truck className="mr-2 h-4 w-4" /> New Delivery Note
                        </Button>
                    </Link>
                    <Link href="/store/documents/create?type=quotation">
                        <Button variant="outline">
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> New Quotation
                        </Button>
                    </Link>
                    <Link href="/store/documents/create?type=invoice">
                        <Button>
                            <FilePlus className="mr-2 h-4 w-4" /> New Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.invoices}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quotations</CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.quotations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by number or customer..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        {documentTypes.map(type => (
                            <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-1">
                                <type.icon className="h-3.5 w-3.5" />
                                {type.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Documents Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No documents found</p>
                            <p className="text-sm">Create your first invoice or quotation to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocuments.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    {doc.type === 'INVOICE' && <Receipt className="h-4 w-4 text-primary" />}
                                                    {doc.type === 'QUOTATION' && <FileSpreadsheet className="h-4 w-4 text-primary" />}
                                                    {doc.type === 'DELIVERY_NOTE' && <Truck className="h-4 w-4 text-primary" />}
                                                    {doc.type === 'CREDIT_NOTE' && <FileCheck className="h-4 w-4 text-primary" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{doc.number}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{doc.type.toLowerCase().replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{doc.customerName || 'Walk-in Customer'}</TableCell>
                                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-mono font-semibold">${doc.total.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[doc.status] || "bg-gray-100"}>{doc.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Printer className="mr-2 h-4 w-4" /> Print
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Send className="mr-2 h-4 w-4" /> Send Email
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
