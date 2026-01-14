"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Package,
    Boxes,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    LogOut,
    MessageCircle,
    Bell,
    Receipt,
    RefreshCw,
    UserCircle,
    Crown,
    Activity
} from "lucide-react"

const sidebarItems = [
    { href: "/store", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/store/owner-pos", icon: Crown, label: "Executive Terminal" },
    { href: "/store/transactions", icon: Receipt, label: "Transactions" },
    { href: "/store/returns", icon: RefreshCw, label: "Returns" },
    { href: "/store/customers", icon: UserCircle, label: "Customers" },
    { href: "/store/loyalty", icon: Crown, label: "Loyalty Program" },
    { href: "/store/products", icon: Package, label: "Products" },
    { href: "/store/inventory", icon: Boxes, label: "Inventory" },
    { href: "/store/ai-inventory", icon: BarChart3, label: "AI Predictor" },
    { href: "/store/orders", icon: ShoppingCart, label: "Online Orders" },
    { href: "/store/sales", icon: BarChart3, label: "Daily Sales" },
    { href: "/store/staff", icon: Users, label: "Staff" },
    { href: "/store/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/store/support", icon: MessageCircle, label: "Support" },
    { href: "/store/system-status", icon: Activity, label: "System Status" },
    { href: "/store/settings/sync", icon: RefreshCw, label: "Data Sync" },
    { href: "/store/settings", icon: Settings, label: "Settings" },
]

export function StoreSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-4 justify-between">
                <Link href="/store" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl">Fresh Mart</span>
                </Link>
                <button className="relative p-2 rounded-full hover:bg-accent">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || (item.href !== "/store" && pathname?.startsWith(item.href))
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t p-4 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        JD
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">Store Owner</p>
                    </div>
                </div>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    )
}
