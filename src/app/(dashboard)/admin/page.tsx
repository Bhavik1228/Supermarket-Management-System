import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Users, DollarSign, TrendingUp, AlertTriangle, ShieldCheck, Activity } from "lucide-react"
import { db } from "@/lib/db"

export default async function AdminDashboardPage() {
    // Real Data Fetching
    const storeCount = await db.store.count()
    const userCount = await db.user.count()

    // Real Recent Stores
    const recentStores = await db.store.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { owner: true }
    })

    // Placeholder for data not yet in DB schema (Revenue, Ads, etc.)
    // We will keep these as 0 or calculated estimates until those modules are built with DB tables.
    const adRevenue = 0
    const aiRequests = 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Real-time Data</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storeCount}</div>
                        <p className="text-xs text-muted-foreground">Registered on platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-muted-foreground">Across all roles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ad Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${adRevenue}</div>
                        <p className="text-xs text-muted-foreground">From active campaigns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{aiRequests}</div>
                        <p className="text-xs text-muted-foreground">Global usage</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Platform Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
                            No activity data available yet
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Stores</CardTitle>
                        <CardDescription>Latest registrations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentStores.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No stores registered yet.</p>
                            ) : (
                                recentStores.map((store) => (
                                    <div key={store.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Store className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{store.name}</p>
                                                <p className="text-xs text-muted-foreground">ID: {store.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                        {/* Adjust styling based on status if available, else default */}
                                        <div className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                                            {store.status || 'New'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-md font-medium">System Health</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <p className="text-xs text-muted-foreground">Operational</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-md font-medium">Fraud Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">0</div>
                        <p className="text-xs text-muted-foreground">No active alerts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-md font-medium">Trending</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">New Registrations</div>
                        <p className="text-xs text-muted-foreground">Top Activity</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
