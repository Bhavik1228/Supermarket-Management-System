import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { Award, Zap, Users, Settings, Plus } from "lucide-react"
import { getLoyaltyProgram } from "@/app/actions/loyalty"

export default async function LoyaltyPage() {
    // Fetch Data
    const { program } = await getLoyaltyProgram() // Gets existing or default
    const totalAccounts = await db.loyaltyAccount.count()
    const totalTransactions = await db.loyaltyTransaction.count()

    // Calculate total points liability (optional, could be heavy)
    const pointsLiability = await db.loyaltyAccount.aggregate({
        _sum: { pointsBalance: true }
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Loyalty Program</h2>
                    <p className="text-muted-foreground">Manage tiers, rules, and rewards.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Program Status</CardTitle>
                        <Zap className={`h-4 w-4 ${program?.isActive ? 'text-green-500' : 'text-gray-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{program?.isActive ? 'Active' : 'Inactive'}</div>
                        <p className="text-xs text-muted-foreground">{program?.name}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAccounts}</div>
                        <p className="text-xs text-muted-foreground">Enrolled customers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Points Liability</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pointsLiability._sum.pointsBalance || 0}</div>
                        <p className="text-xs text-muted-foreground">Outstanding points</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">Total earn/redeem events</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tiers & Rules Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Tiers List */}
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Member Tiers</CardTitle>
                            <CardDescription>Loyalty levels and multipliers.</CardDescription>
                        </div>
                        <Button size="sm" variant="secondary">
                            <Plus className="h-4 w-4 mr-1" /> Add Tier
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {program?.tiers.map((tier) => (
                                <div key={tier.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{tier.name}</p>
                                        <p className="text-xs text-muted-foreground">Min Points: {tier.minPoints}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                                            {tier.multiplier}x Multiplier
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Automation/Rules Rules */}
                <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Earning Rules</CardTitle>
                            <CardDescription>How points are calculated.</CardDescription>
                        </div>
                        <Button size="sm" variant="ghost">Manage</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Base Earning</p>
                                    <p className="text-xs text-muted-foreground">Global rate per $1 spend</p>
                                </div>
                                <div className="text-lg font-bold">
                                    {program?.earningRate} Pts
                                </div>
                            </div>

                            {/* Dynamically list future rules here */}
                            {/* Mock Visual for generic rule */}
                            <div className="bg-muted/50 p-3 rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                                No additional rules configured
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
