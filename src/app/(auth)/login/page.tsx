"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Login failed')
                setIsLoading(false)
                return
            }

            // Store user info in localStorage (simple approach - use cookies/session in production)
            localStorage.setItem('user', JSON.stringify(data.user))

            // Check if store owner needs approval
            if (data.user.role === 'STORE_OWNER' && data.storeStatus === 'PENDING') {
                router.push('/pending')
                return
            }

            // Redirect based on role
            router.push(data.redirectTo)
        } catch (err) {
            setError('An error occurred. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full border-2 shadow-lg animate-in fade-in zoom-in duration-500">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Login to MarketPulse</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to access your dashboard
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                {/* Test Account Hint */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-800 mb-1">Test Accounts:</p>
                    <p className="text-xs text-blue-700">Admin: admin@marketpulse.com / admin123</p>
                    <p className="text-xs text-blue-700">Store: john@freshmart.com / store123</p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                <div>
                    Don't have an account?{" "}
                    <Link href="/register/store" className="underline text-primary hover:text-primary/80">
                        Register your store
                    </Link>
                </div>
                <div>
                    <Link href="/" className="hover:text-primary">
                        Back to Home
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
