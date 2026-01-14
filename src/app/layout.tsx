import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { getSettings } from "@/app/actions/settings";
import { AlertTriangle, Lock } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketPulse - Ultimate Supermarket Management",
  description: "AI-Powered Multi-Store Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = await getSettings();

  const platformEnabled = settings?.platform_enabled !== false;
  const maintenanceMode = settings?.maintenance_mode_enabled === true;

  if (!platformEnabled) {
    return (
      <html lang="en">
        <body className={cn("min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center", geistSans.variable)}>
          <div className="max-w-md space-y-6">
            <Lock className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-4xl font-bold tracking-tighter">Access Suspended</h1>
            <p className="text-slate-400">The platform has been disabled by the system owner. Please contact support for more information.</p>
          </div>
        </body>
      </html>
    );
  }

  if (maintenanceMode) {
    return (
      <html lang="en">
        <body className={cn("min-h-screen bg-amber-50 flex items-center justify-center p-6 text-center", geistSans.variable)}>
          <div className="max-w-md space-y-6">
            <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto" />
            <h1 className="text-4xl font-bold tracking-tighter text-amber-900">Scheduled Maintenance</h1>
            <p className="text-amber-800/70 font-medium">We're performing some upgrades. We'll be back online shortly.</p>
            <div className="p-4 bg-amber-100 rounded-xl border border-amber-200 text-sm text-amber-800">
              System owners and admins can still bypass this via specific routes.
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <Navbar />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
