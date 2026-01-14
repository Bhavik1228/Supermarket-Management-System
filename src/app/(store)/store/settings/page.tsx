"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Store, Bell, Shield, CreditCard } from "lucide-react"

export default function StoreSettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your store settings and preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* Store Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            Store Information
                        </CardTitle>
                        <CardDescription>Basic information about your store</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="storeName">Store Name</Label>
                                <Input id="storeName" defaultValue="Fresh Mart Supermarket" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storeType">Store Type</Label>
                                <Input id="storeType" defaultValue="Supermarket" />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Contact Email</Label>
                                <Input id="email" type="email" defaultValue="contact@freshmart.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" defaultValue="+1 234 567 890" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" defaultValue="123 Main Street, City, Country" />
                        </div>
                        <Button>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Configure how you receive alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "Low stock alerts", description: "Get notified when products are running low", enabled: true },
                                { label: "Daily sales reports", description: "Receive a summary of daily sales", enabled: true },
                                { label: "New order notifications", description: "Alert for each new order placed", enabled: false },
                            ].map((setting, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <p className="font-medium">{setting.label}</p>
                                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                                    </div>
                                    <Button variant={setting.enabled ? "default" : "outline"} size="sm">
                                        {setting.enabled ? "Enabled" : "Disabled"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                                <p className="font-medium">Change Password</p>
                                <p className="text-sm text-muted-foreground">Update your account password</p>
                            </div>
                            <Button variant="outline">Change</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                            </div>
                            <Button variant="outline">Enable</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
