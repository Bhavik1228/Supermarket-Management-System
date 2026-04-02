'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Lock, Building2, ShieldAlert, Users, ShieldCheck, Fingerprint, Store, ReceiptText, Box, ClipboardCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Email Categories
const emailCategories = [
    {
        title: "Signup & Onboarding",
        emails: [
            { id: 'verification_code', name: 'Verification Code', desc: 'Sent during signup to verify email' },
            { id: 'signup_confirmation', name: 'Signup Received', desc: 'Confirming registration receipt' },
            { id: 'store_approval', name: 'Store Approved', desc: 'Welcome email after admin approval' },
            { id: 'store_rejection', name: 'Store Rejected', desc: 'Rejection notice with reason' },
            { id: 'document_request', name: 'Document Request', desc: 'asking for more documents' },
            { id: 'store_activation', name: 'Store Activated', desc: 'Welcome to dashboard features' },
            { id: 'onboarding_instructions', name: 'Onboarding Guide', desc: '5-step getting started guide' },
        ]
    },
    {
        title: "User Accounts & Security",
        emails: [
            { id: 'password_reset', name: 'Password Reset', desc: 'Link to reset forgotten password' },
            { id: 'password_changed', name: 'Password Changed', desc: 'Security confirmation alert' },
            { id: 'staff_invitation', name: 'Staff Invitation', desc: 'Invite new staff with temp password' },
            { id: 'staff_created', name: 'Staff Created', desc: 'Confirmation for admin creating staff' },
            { id: 'suspicious_login', name: 'Suspicious Login', desc: 'Alert for unrecognized device' },
            { id: 'account_deactivated', name: 'Account Deactivated', desc: 'Notice of account suspension' },
            { id: 'role_change', name: 'Role Updated', desc: 'Notification of permission change' },
        ]
    },
    {
        title: "Loyalty & Rewards",
        emails: [
            { id: 'loyalty_enrollment', name: 'Loyalty Enrollment', desc: 'Welcome to loyalty program' },
            { id: 'loyalty_points_earned', name: 'Points Earned', desc: 'Notification of points earned' },
            { id: 'loyalty_tier_upgrade', name: 'Tier Upgrade', desc: 'Congratulations on tier upgrade' },
            { id: 'loyalty_points_expiring', name: 'Points Expiring', desc: 'Warning about expiring points' },
            { id: 'loyalty_referral_reward', name: 'Referral Reward', desc: 'Bonus for successful referral' },
            { id: 'customer_loyalty_statement', name: 'Loyalty Statement', desc: 'Summary of member points & tier' },
        ]
    },
    {
        title: "Inventory & Operations",
        emails: [
            { id: 'low_stock_alert', name: 'Low Stock Alert', desc: 'Notify inventory when product is low' },
            { id: 'out_of_stock_alert', name: 'Out of Stock Alert', desc: 'Critical alert for sold-out items' },
            { id: 'stock_restock_success', name: 'Restock Success', desc: 'Confirmation of new inventory arrival' },
            { id: 'inventory_audit_request', name: 'Audit Request', desc: 'Request count for specific area' },
            { id: 'price_change_notice', name: 'Price Change Notice', desc: 'Inform staff of updated pricing' },
            { id: 'po_generated', name: 'PO Generated', desc: 'Auto-generated purchase order for low stock' },
            { id: 'po_status_update', name: 'PO Status Update', desc: 'Notification when PO status changes' },
            { id: 'return_processed', name: 'Return Processed', desc: 'Alert for processed return & stock adjustment' },
        ]
    },
    {
        title: "Orders & Refunds",
        emails: [
            { id: 'customer_order_confirmation', name: 'Order Receipt', desc: 'Digital receipt for customer purchase' },
            { id: 'order_status_update', name: 'Order Status Update', desc: 'Notification of online order stage change' },
            { id: 'refund_confirmation', name: 'Refund Receipt', desc: 'Confirmation of processed refund' },
            { id: 'new_review_notification', name: 'New Feedback', desc: 'Alert for new customer review' },
            { id: 'high_value_return_alert', name: 'High-Value Return', desc: 'Executive alert for large refunds' },
            { id: 'refund_request_alert', name: 'Refund Authorization Req', desc: 'Urgent alert for pending refund requests' },
        ]
    },
    {
        title: "Executive & System Alerts",
        emails: [
            { id: 'owner_critical_alert', name: 'Critical Alert', desc: 'Urgent notification for owners' },
            { id: 'daily_digest', name: 'Daily Digest', desc: 'Summary of daily store performance' },
            { id: 'store_performance_notice', name: 'Store Performance Notice', desc: 'Notify managers of system slowdowns' },
            { id: 'store_usage_spike', name: 'Store Usage Spike Alert', desc: 'Alert for unusual activity at specific store' },
            { id: 'store_sync_delay', name: 'Store Sync Delay Notice', desc: 'Friendly notice for store managers' },
            { id: 'store_data_inconsistency', name: 'Data Check Request', desc: 'Ask store to verify records' },
            { id: 'store_backup_success', name: 'Store Sync Success', desc: 'Cloud sync confirmation' },
            { id: 'store_backup_failure', name: 'Store Sync Failed', desc: 'Alert for failed cloud upload' },
            { id: 'shift_start', name: 'Shift Started', desc: 'Log when terminal session begins' },
            { id: 'shift_end_summary', name: 'Shift Summary', desc: 'Final report when closing register' },
            { id: 'report_delivery', name: 'Report Delivery', desc: 'Automated operational report email' },
            { id: 'staff_performance_milestone', name: 'Performance Milestone', desc: 'Congrats for staff achievements' },
            { id: 'access_revoked_notice', name: 'Access Revoked', desc: 'Security notice for account locking' },
            { id: 'unauthorized_access_attempt', name: 'Security Breach Attempt', desc: 'Alert for unauthorized override' },
            { id: 'system_downtime_notice', name: 'Maintenance Notice', desc: 'Planned downtime announcement' },
        ]
    },
    {
        title: "System Owner Only",
        emails: [
            { id: 'platform_usage_spike', name: 'Platform Usage Spike Alert', desc: 'Critical alert for unusual platform activity' },
            { id: 'platform_performance_degradation', name: 'Performance Degradation Notice', desc: 'Alert for platform-wide performance issues' },
            { id: 'data_sync_delay', name: 'Data Sync Delay Alert', desc: 'Notification for synchronization delays' },
            { id: 'data_inconsistency_alert', name: 'Data Inconsistency Alert', desc: 'Critical integrity check failure' },
            { id: 'system_backup_success', name: 'Backup Success', desc: 'Confirmation of successful platform backup' },
            { id: 'system_backup_failure', name: 'Backup Failure Alert', desc: 'Critical backup operation failed' },
            { id: 'system_dr_summary', name: 'Disaster Recovery Report', desc: 'Summary of recent DR simulation' },
            { id: 'system_config_change', name: 'Config Change Alert', desc: 'Notification of system setting modification' },
            { id: 'critical_config_alert', name: 'Critical Config Alert', desc: 'Security warning for high-risk changes' },
            { id: 'report_generation_failure', name: 'Report Failure', desc: 'Alert for failed report generation' },
            { id: 'delayed_report_notice', name: 'Delayed Report Notice', desc: 'Notice of processing delay for scheduled report' },
            { id: 'report_data_completeness', name: 'Data Completeness Warning', desc: 'Alert for reports with missing data sources' },
            { id: 'report_definition_changed', name: 'Report Definition Updated', desc: 'Notification of changes to report structure' },
            { id: 'report_deprecated_notice', name: 'Report Deprecation Notice', desc: 'Alert for scheduled report retirement' },
            { id: 'platform_config_change', name: 'Platform Status Alert', desc: 'Notify admins of platform enable/disable' },
            { id: 'maintenance_mode', name: 'Maintenance Mode Alert', desc: 'Notify staff of maintenance window' },
            { id: 'store_governance', name: 'Store Governance Event', desc: 'Alert for store suspension/archival' },
            { id: 'store_limit_alert', name: 'Resource Limit Alert', desc: 'Notify when store reaches branch/user limits' },
            { id: 'role_escalation', name: 'Role Escalation Alert', desc: 'Notify when user permissions are increased' },
            { id: 'privileged_access', name: 'Privileged Access Log', desc: 'Alert for high-privilege admin actions' },
            { id: 'mfa_setup', name: 'MFA Configuration', desc: 'Notice when MFA is enabled/disabled' },
            { id: 'account_security_alert', name: 'Security Alert', desc: 'Alert for suspicious account activity' },
            { id: 'new_device_login', name: 'New Device Login', desc: 'Notice for logins from unrecognized hardware' },
            { id: 'price_override', name: 'Price Override Alert', desc: 'Notify when POS price is manually changed' },
            { id: 'refund_threshold', name: 'Refund Limit Alert', desc: 'Warning for high-value or excessive refunds' },
            { id: 'stock_discrepancy', name: 'Stock Discrepancy', desc: 'Alert for audit variances in inventory' },
            { id: 'expiry_warning', name: 'Stock Expiry Alert', desc: 'Notice for items approaching expiration' },
            { id: 'system_owner_refund_alert', name: 'System Refund Alert', desc: 'Platform-level alert for tracked refunds' },
        ],
        restricted: true
    }
]

export default function EmailTestingPage() {
    const [selectedEmail, setSelectedEmail] = useState<{ id: string, name: string } | null>(null)
    const [testEmail, setTestEmail] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast()

    const handleOpenDialog = (email: { id: string, name: string }) => {
        setSelectedEmail(email)
        setIsOpen(true)
    }

    const handleSendTest = async () => {
        if (!testEmail || !selectedEmail) return

        setIsSending(true)
        try {
            const response = await fetch('/api/admin/emails/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailType: selectedEmail.id,
                    to: testEmail
                })
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Test Email Sent",
                    description: (
                        <div className="flex flex-col gap-1">
                            <span>Successfully sent to {testEmail}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                                API Key: {data.debug?.apiKeyStart} | Loaded: {data.debug?.apiKeyLoaded ? 'YES' : 'NO'}
                            </span>
                        </div>
                    ),
                    variant: "default",
                })
                setIsOpen(false)
            } else {
                const keysList = data.debug?.envKeys?.join(', ') || 'None'
                throw new Error(`${data.error} (Key: ${data.debug?.apiKeyStart || 'Unknown'}). Available: ${keysList.substring(0, 50)}...`)
            }
        } catch (error) {
            toast({
                title: "Error Sending Email",
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Email Testing Dashboard</h2>
                <p className="text-muted-foreground">Test and preview all transactional emails in the system.</p>
            </div>

            {/* Email Grid */}
            <div className="space-y-8">
                {emailCategories.map((category) => (
                    <div key={category.title} className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Mail className="h-5 w-5" /> {category.title}
                            {(category as any).restricted && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-300">
                                    🔒 SYSTEM OWNER ONLY
                                </span>
                            )}
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {category.emails.map((email) => (
                                <Card key={email.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary" onClick={() => handleOpenDialog(email)}>
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-base">{email.name}</CardTitle>
                                        <CardDescription className="text-xs">{email.desc}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Send className="mr-2 h-3 w-3" /> Test Send
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Test Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Send Test Email</DialogTitle>
                        <DialogDescription>
                            Send a preview of <strong>{selectedEmail?.name}</strong> to a specific address.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Recipient Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Mock data will be used to populate the email template.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-between">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendTest} disabled={isSending || !testEmail}>
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Send Test
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
