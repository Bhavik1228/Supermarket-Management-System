import { StoreSidebar } from "@/components/layout/StoreSidebar"

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <StoreSidebar />
            <main className="flex-1 overflow-auto bg-background p-8">
                {children}
            </main>
        </div>
    )
}
