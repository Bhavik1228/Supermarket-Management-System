import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last Updated: December 8, 2025</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Introduction</h2>
                    <p className="leading-relaxed">
                        Welcome to MarketPulse. We are committed to protecting your personal information and your right to privacy.
                        When you visit our website and use our services, you trust us with your personal information. We take that trust seriously.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. Information We Collect</h2>
                    <p className="leading-relaxed">
                        We collect personal information that you voluntarily provide to us when you register on the website,
                        express an interest in obtaining information about us or our products and services, when you participate in activities on the website
                        or otherwise when you contact us.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Personal Data: Name, email address, phone number, etc.</li>
                        <li>Store Data: Business name, location, inventory data, transaction logs.</li>
                        <li>Usage Data: Information about how you use our platform.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
                    <p className="leading-relaxed">
                        We use personal information collected via our website for a variety of business purposes described below:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To facilitate account creation and logon process.</li>
                        <li>To send you administrative information.</li>
                        <li>To fulfill and manage your orders and inventory.</li>
                        <li>To protect our Services (fraud monitoring and prevention).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Data Ownership</h2>
                    <p className="leading-relaxed">
                        You own your data. MarketPulse does not sell your customer data or inventory secrets to third parties.
                        We are a free platform supported by ethical advertising and voluntary donations.
                    </p>
                </section>

                <section className="pt-8 border-t mt-12">
                    <p className="italic text-muted-foreground">Signed,</p>
                    <div className="mt-4">
                        <h3 className="text-xl font-bold">Bhavik Boyapati</h3>
                        <p className="text-primary font-medium">Founder & Chief Visionary</p>
                        <p className="text-sm text-muted-foreground">MarketPulse Inc.</p>
                    </div>
                </section>

                <div className="pt-8">
                    <Link href="/">
                        <Button variant="outline">Back to Home</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
