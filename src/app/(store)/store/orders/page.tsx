"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Clock, CheckCircle, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock Orders
const orders = [
    { id: "ORD-001", customer: "Walk-in Customer", items: 5, total: 45.99, status: "completed", time: "10:30 AM" },
    { id: "ORD-002", customer: "John Smith", items: 3, total: 23.50, status: "completed", time: "10:15 AM" },
    { id: "ORD-003", customer: "Walk-in Customer", items: 8, total: 89.99, status: "processing", time: "10:00 AM" },
    { id: "ORD-004", customer: "Sarah Johnson", items: 2, total: 15.00, status: "completed", time: "9:45 AM" },
]

const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    processing: "bg-yellow-100 text-yellow-800",
    pending: "bg-blue-100 text-blue-800",
}

export default function OrdersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                    <p className="text-muted-foreground">Today's transactions and order history.</p>
                </div>
                <Button>
                    <ShoppingCart className="mr-2 h-4 w-4" /> New Order (POS)
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-sm text-muted-foreground">Orders Today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">$1,234</div>
                        <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">87</div>
                        <p className="text-sm text-muted-foreground">Items Sold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">$51.42</div>
                        <p className="text-sm text-muted-foreground">Average Order</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono">{order.id}</TableCell>
                                <TableCell>{order.customer}</TableCell>
                                <TableCell>{order.items}</TableCell>
                                <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </TableCell>
                                <TableCell>{order.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
