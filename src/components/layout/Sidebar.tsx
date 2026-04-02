"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Store,
    Users,
    Megaphone,
    Heart,
    Bot,
    ShieldAlert,
    Settings,
    Activity,
    LogOut,
    MessageCircle,
    Eye,
    Mail,
    BarChart3
} from "lucide-react"

const sidebarItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/stores", icon: Store, label: "Manage Stores" },
    { href: "/admin/users", icon: Users, label: "Users & Staff" },
    { href: "/admin/support", icon: MessageCircle, label: "Support Tickets" },
    { href: "/admin/ads", icon: Megaphone, label: "Ads & Sponsors" },
    { href: "/admin/donations", icon: Heart, label: "Donations" },
    { href: "/admin/ai", icon: Bot, label: "AI Control" },
    { href: "/admin/audit", icon: ShieldAlert, label: "Audit Center" },
    { href: "/admin/system-monitor", icon: Activity, label: "System Monitor" },
    { href: "/admin/status", icon: ShieldAlert, label: "Status Manager" },
    { href: "/admin/impersonate", icon: Eye, label: "Impersonate User" },
    { href: "/admin/automation", icon: Activity, label: "Automation" },
    { href: "/admin/reports", icon: BarChart3, label: "Platform Reports" },
    { href: "/admin/emails", icon: Mail, label: "Email Testing" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
]


export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl">MarketPulse</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
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
            <div className="border-t p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    )
}
