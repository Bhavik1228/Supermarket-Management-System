"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, AlertTriangle, User, Shield } from "lucide-react"

// Mock Users for Impersonation
const users = [
    { id: "user-1", name: "John Doe", email: "john@freshmart.com", role: "STORE_OWNER", store: "Fresh Mart" },
    { id: "user-2", name: "Alice Brown", email: "alice@quickstop.com", role: "STORE_OWNER", store: "Quick Stop" },
    { id: "user-3", name: "Bob Wilson", email: "bob@hypervalue.com", role: "STORE_MANAGER", store: "HyperValue" },
]

export default function ImpersonatePage() {
    const [showWarning, setShowWarning] = useState(false)
    const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null)
    const [isImpersonating, setIsImpersonating] = useState(false)

    const handleImpersonateClick = (user: typeof users[0]) => {
        setSelectedUser(user)
        setShowWarning(true)
    }

    const handleConfirmImpersonate = () => {
        setShowWarning(false)
        setIsImpersonating(true)
        // In a real app, this would set a session cookie or context for impersonation
        console.log("Now impersonating:", selectedUser?.email)
    }

    const handleStopImpersonating = () => {
        setIsImpersonating(false)
        setSelectedUser(null)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Impersonation Banner */}
            {isImpersonating && selectedUser && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-yellow-600" />
                        <div>
                            <p className="font-semibold text-yellow-800">Impersonation Mode Active</p>
                            <p className="text-sm text-yellow-700">You are viewing the system as <strong>{selectedUser.name}</strong> ({selectedUser.email})</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleStopImpersonating} className="border-yellow-500 text-yellow-700 hover:bg-yellow-200">
                        Stop Impersonating
                    </Button>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Impersonation</h2>
                    <p className="text-muted-foreground">View the system from any user's perspective for support purposes.</p>
                </div>
            </div>

            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="h-5 w-5" />
                        Important Notice
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-orange-700">
                    <p>User Impersonation is a powerful support tool. When you impersonate a user:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>All actions will be logged in the Audit Center.</li>
                        <li>The user will be notified via email that their account was accessed by support.</li>
                        <li>You will see exactly what the user sees, including their data.</li>
                        <li>Use this feature responsibly and only for legitimate support purposes.</li>
                    </ul>
                </CardContent>
            </Card>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search by name, email, or store..." className="pl-8" />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        {user.name}
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-medium">
                                        {user.role.replace("_", " ")}
                                    </span>
                                </TableCell>
                                <TableCell>{user.store}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleImpersonateClick(user)}
                                        disabled={isImpersonating}
                                    >
                                        <Eye className="h-4 w-4 mr-2" /> View As
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Warning Modal */}
            {showWarning && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Confirm Impersonation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>You are about to impersonate:</p>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="font-semibold">{selectedUser.name}</p>
                                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                This action will be logged and the user will receive an email notification.
                                Are you sure you want to continue?
                            </p>
                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setShowWarning(false)}>
                                    Cancel
                                </Button>
                                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleConfirmImpersonate}>
                                    Yes, Impersonate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
