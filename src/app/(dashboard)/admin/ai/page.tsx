"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Bot, Cpu, Gauge, Lock } from "lucide-react"

export default function AIControlPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Control Center</h2>
                    <p className="text-muted-foreground">Manage global AI models, token limits, and feature availability.</p>
                </div>
                <Button>
                    <Bot className="mr-2 h-4 w-4" />
                    Rotate API Keys
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Model</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Gemini Pro</div>
                        <p className="text-xs text-muted-foreground">Primary Generator</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.2M / 5M</div>
                        <p className="text-xs text-muted-foreground">Monthly Global Cap</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Safety Filter</CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Strict</div>
                        <p className="text-xs text-muted-foreground">Global Content Policy</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Feature Toggles</CardTitle>
                        <CardDescription>Enable or disable specific AI capabilities platform-wide.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium">Product Generator</span>
                                <span className="text-xs text-muted-foreground">Auto-generate titles & descriptions</span>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium">Inventory Predictor</span>
                                <span className="text-xs text-muted-foreground">Forecast stock needs based on sales</span>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium">Fraud Detection</span>
                                <span className="text-xs text-muted-foreground">Analyze store patterns for anomalies</span>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium">Chat Assistant</span>
                                <span className="text-xs text-muted-foreground">Helpdesk bot for store owners</span>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Global Usage Limits</CardTitle>
                        <CardDescription>Set maximum AI resource allocation per store tier.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Free Tier (Tokens/Month)</span>
                                <span className="text-sm text-muted-foreground">50k</span>
                            </div>
                            <Slider defaultValue={[20]} max={100} step={1} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Requests Per Minute (Rate Limit)</span>
                                <span className="text-sm text-muted-foreground">60 RPM</span>
                            </div>
                            <Slider defaultValue={[60]} max={200} step={5} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Max Image Generations</span>
                                <span className="text-sm text-muted-foreground">5/day</span>
                            </div>
                            <Slider defaultValue={[5]} max={50} step={1} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
