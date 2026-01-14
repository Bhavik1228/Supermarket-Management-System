import { StoreTable } from "@/components/admin/StoreTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Plus, Search } from "lucide-react"
import { db } from "@/lib/db"

export default async function StoresPage() {
    // Fetch real stores
    const stores = await db.store.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            owner: true // To get owner name
        }
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Store Management</h2>
                    <p className="text-muted-foreground">Manage approvals, suspensions, and store health.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search stores..." className="pl-8" />
                </div>
            </div>

            <StoreTable data={stores} />
        </div>
    )
}
