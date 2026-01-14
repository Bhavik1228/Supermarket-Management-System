import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const features = [
    "Multi-Store Management",
    "Real-time Inventory Tracking",
    "AI-Powered Demand Forecasting",
    "Point of Sale (POS) System",
    "Employee Management & Roles",
    "Customer Loyalty Programs",
    "Supplier & Purchase Orders",
    "Detailed Analytics & Reports",
    "Offline Mode Support",
    "E-commerce Integration",
    "Barcode Scanning",
    "Unlimited Users & Stores"
]

export default function FeaturesPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Powerful Features, Completely Free</h1>
                <p className="text-xl text-muted-foreground">
                    MarketPulse gives you enterprise-grade tools without the enterprise price tag.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-medium text-lg">{feature}</span>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center">
                <Link href="/register/store">
                    <Button size="lg" className="h-12 px-8 text-lg">
                        Start Using MarketPulse
                    </Button>
                </Link>
            </div>
        </div>
    )
}
