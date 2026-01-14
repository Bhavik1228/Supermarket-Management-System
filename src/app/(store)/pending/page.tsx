"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle, CheckCircle2, Store, Mail, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function StorePendingPage() {
    const router = useRouter()
    const [checking, setChecking] = useState(false)

    const checkStatus = async () => {
        setChecking(true)
        // In production, check actual store status from API
        // For now, simulate a check
        await new Promise(resolve => setTimeout(resolve, 1500))
        setChecking(false)
        // If approved, redirect to /store
        // router.push('/store')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className="space-y-4">
                    <div className="mx-auto w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-10 w-10 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl">Store Approval Pending</CardTitle>
                    <CardDescription>
                        Your store registration is currently being reviewed by our team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-800">Verification in Progress</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    We're reviewing your business documents and information.
                                    This typically takes 1-2 business days.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 text-left">
                        <h4 className="font-medium">What happens next?</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span className="text-sm">Your application is received</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
                                <span className="text-sm font-medium">Documents under review</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Email notification on decision</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <Store className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Full access upon approval</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button onClick={checkStatus} disabled={checking} className="w-full">
                            {checking ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Checking Status...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Check Approval Status
                                </>
                            )}
                        </Button>
                        <Link href="/" className="block">
                            <Button variant="outline" className="w-full">
                                Back to Home
                            </Button>
                        </Link>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Need help? Contact <a href="mailto:support@marketpulse.com" className="underline">support@marketpulse.com</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
