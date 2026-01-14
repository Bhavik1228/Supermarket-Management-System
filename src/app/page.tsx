import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Zap, BarChart3, Globe, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center space-y-8 bg-gradient-to-b from-white to-gray-50">
        <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            The Ultimate <span className="text-primary">Free</span><br />
            Supermarket Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage unlimited stores, inventory, and sales with our robust, AI-powered platform.
            Zero subscriptions. Zero commissions. 100% Free.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Link href="/register/store">
            <Button size="lg" className="h-12 px-8 text-lg gap-2">
              Start for Free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white" id="features">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Everything You Need to Scale</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From single mom-and-pop shops to multi-branch retail empires, MarketPulse adapts to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast POS</h3>
              <p className="text-muted-foreground">
                Process sales in seconds with our optimized Point of Sale interface. Barcode scanning support included.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Real-time insights into sales, inventory, and staff performance. Make data-driven decisions.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multi-Store Sync</h3>
              <p className="text-muted-foreground">
                Manage multiple branches from a single dashboard. Inventory and sales sync automatically.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Role-based access control, audit logs, and secure data encryption keep your business safe.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Completely Free</h3>
              <p className="text-muted-foreground">
                No hidden fees. We are supported by optional ads and community donations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold text-white tracking-tight">MarketPulse</span>
            <p className="mt-4 max-w-sm">
              The world's most advanced free supermarket management system. Empowering retailers everywhere.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          © {new Date().getFullYear()} MarketPulse. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
