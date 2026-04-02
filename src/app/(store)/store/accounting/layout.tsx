"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function AccountingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // Check if we are in documents subpath, if so, we might not want this layout?
    // Actually this layout is for /store/accounting/*

    const tabs = [
        { name: "Overview", href: "/store/accounting" },
        { name: "Chart of Accounts", href: "/store/accounting/accounts" },
        { name: "Journal", href: "/store/accounting/journal" },
        { name: "Reports", href: "/store/accounting/reports" },
        { name: "Tax Slabs", href: "/store/accounting/tax" },
        { name: "Compliance", href: "/store/accounting/compliance" }, // Maybe separate?
    ]

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <h2 className="text-2xl font-bold tracking-tight mr-8">Financial Hub</h2>
                    <nav className="flex items-center space-x-4 lg:space-x-6">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === tab.href
                                        ? "text-primary border-b-2 border-primary pb-1"
                                        : "text-muted-foreground"
                                )}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="flex-1 p-4 pt-0">
                {children}
            </div>
        </div>
    )
}
