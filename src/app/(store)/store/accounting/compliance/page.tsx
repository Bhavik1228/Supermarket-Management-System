"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, ShieldCheck, AlertCircle, Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Document categories with real compliance data structure
const docCategories = [
    {
        id: "cat_registration",
        title: "Store Registration & Licensing",
        description: "Official business permits, tax IDs, and owner KYC.",
        docs: [
            { id: "reg_001", name: "Business License", status: "Active", type: "PDF", lastUpdated: "2025-01-15" },
            { id: "reg_002", name: "Tax Identification Number (TIN)", status: "Active", type: "PDF", lastUpdated: "2025-01-10" },
            { id: "reg_003", name: "Lease Agreement", status: "Expiring Soon", type: "PDF", lastUpdated: "2024-06-01", expiryDate: "2026-06-01" },
        ]
    },
    {
        id: "cat_daily_ops",
        title: "Daily Operations",
        description: "Shift logs, cleaning checklists, and opening/closing reports.",
        docs: [
            { id: "ops_001", name: "Morning Opening Checklist", status: "Daily", type: "Form", lastUpdated: "2026-01-16" },
            { id: "ops_002", name: "Shift Handover Log", status: "Daily", type: "Form", lastUpdated: "2026-01-16" },
            { id: "ops_003", name: "Cash Register Reconciliation", status: "Automated", type: "Report", lastUpdated: "2026-01-16" },
        ]
    },
    {
        id: "cat_sales",
        title: "Sales & Billing",
        description: "Invoices, quotations, and credit notes.",
        docs: [
            { id: "sale_001", name: "Tax Invoice Template", status: "Ready", type: "Template", lastUpdated: "2025-12-01" },
            { id: "sale_002", name: "Credit Note Template", status: "Ready", type: "Template", lastUpdated: "2025-12-01" },
            { id: "sale_003", name: "Quotation Template", status: "Ready", type: "Template", lastUpdated: "2025-12-01" },
        ]
    },
    {
        id: "cat_financial",
        title: "Financial Statements",
        description: "P&L, balance sheets, and tax filings.",
        docs: [
            { id: "fin_001", name: "Monthly P&L Statement", status: "Generated", type: "Report", lastUpdated: "2026-01-01" },
            { id: "fin_002", name: "Quarterly Tax Summary", status: "Pending", type: "Report", lastUpdated: "2025-10-01" },
            { id: "fin_003", name: "Annual Financial Report", status: "Not Due", type: "Report", lastUpdated: "2025-12-31" },
        ]
    }
]

export default function CompliancePage() {
    const { toast } = useToast()
    const [isExporting, setIsExporting] = useState(false)
    const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null)

    const handleExportAll = async () => {
        setIsExporting(true)

        // Simulate export - in production this would call a server action
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Generate CSV data
        const headers = ["Category", "Document Name", "Status", "Type", "Last Updated"]
        const rows = docCategories.flatMap(cat =>
            cat.docs.map(doc => [cat.title, doc.name, doc.status, doc.type, doc.lastUpdated])
        )

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n")

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `compliance_report_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setIsExporting(false)
        toast({
            title: "Export Complete",
            description: "Compliance report downloaded successfully.",
        })
    }

    const handleDownloadDoc = async (docId: string, docName: string) => {
        setDownloadingDoc(docId)

        // Simulate download
        await new Promise(resolve => setTimeout(resolve, 800))

        toast({
            title: "Document Ready",
            description: `${docName} would be downloaded in production.`,
        })

        setDownloadingDoc(null)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
            case 'Ready':
            case 'Generated':
            case 'Automated':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case 'Expiring Soon':
            case 'Pending':
                return <Clock className="h-4 w-4 text-amber-600" />
            case 'Expired':
            case 'Overdue':
                return <AlertTriangle className="h-4 w-4 text-red-600" />
            default:
                return <FileText className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'Active': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Ready': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Generated': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Automated': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            'Daily': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            'Expiring Soon': 'bg-amber-100 text-amber-800 hover:bg-amber-100',
            'Pending': 'bg-amber-100 text-amber-800 hover:bg-amber-100',
            'Not Due': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        }
        return variants[status] || 'bg-gray-100 text-gray-800'
    }

    // Calculate compliance metrics
    const allDocs = docCategories.flatMap(c => c.docs)
    const activeCount = allDocs.filter(d => ['Active', 'Ready', 'Generated', 'Automated'].includes(d.status)).length
    const pendingCount = allDocs.filter(d => ['Pending', 'Expiring Soon'].includes(d.status)).length
    const complianceScore = Math.round((activeCount / allDocs.length) * 100)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Document Compliance Center</h2>
                    <p className="text-muted-foreground">Manage adherence to regulatory standards and operational protocols.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Audit Log
                    </Button>
                    <Button onClick={handleExportAll} disabled={isExporting}>
                        {isExporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Export All
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {docCategories.map((category) => (
                    <Card key={category.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                {category.title}
                            </CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {category.docs.map((doc) => (
                                    <li key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center">
                                                {getStatusIcon(doc.status)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">{doc.type} • Updated {doc.lastUpdated}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className={getStatusBadge(doc.status)}>{doc.status}</Badge>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDownloadDoc(doc.id, doc.name)}
                                                disabled={downloadingDoc === doc.id}
                                            >
                                                {downloadingDoc === doc.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Compliance Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-8 flex-wrap">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Compliance Score</p>
                            <p className="text-4xl font-bold text-blue-900">{complianceScore}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Documents Active</p>
                            <p className="text-4xl font-bold text-green-600">{activeCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Pending Actions</p>
                            <p className="text-4xl font-bold text-amber-600">{pendingCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Next Audit</p>
                            <p className="text-4xl font-bold text-blue-900">14 Days</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
