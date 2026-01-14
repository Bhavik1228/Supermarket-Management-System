import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground">Last Updated: December 8, 2025</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
                    <p className="leading-relaxed">
                        These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you")
                        and MarketPulse ("we," "us" or "our"), concerning your access to and use of the MarketPulse website as well as any other media form,
                        media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. User Representations</h2>
                    <p className="leading-relaxed">
                        By using the Site, you represent and warrant that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>All registration information you submit will be true, accurate, current, and complete.</li>
                        <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                        <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                        <li>You are not a minor in the jurisdiction in which you reside.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. Free Service Model</h2>
                    <p className="leading-relaxed">
                        MarketPulse is provided as a free service. We reserve the right to display advertisements and accept donations to support the platform.
                        While we strive for 99.9% uptime, the service is provided "AS IS" and we are not liable for business interruptions caused by unforeseen circumstances.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Prohibited Activities</h2>
                    <p className="leading-relaxed">
                        You may not access or use the Site for any purpose other than that for which we make the Site available.
                        The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
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
