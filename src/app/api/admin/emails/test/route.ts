import { NextRequest, NextResponse } from 'next/server'
import {
    sendEmail,
    getVerificationCodeEmailHtml,
    getSignupConfirmationEmailHtml,
    getApprovalEmailHtml,
    getRejectionEmailHtml,
    getDocumentRequestEmailHtml,
    getStoreActivationEmailHtml,
    getOnboardingEmailHtml,
    getPasswordResetEmailHtml,
    getPasswordChangedEmailHtml,
    getStaffInvitationEmailHtml,
    getStaffAccountCreatedEmailHtml,
    getSuspiciousLoginEmailHtml,
    getAccountDeactivatedEmailHtml,
    getRoleChangeEmailHtml,
    getLoyaltyEnrollmentEmailHtml,
    getLoyaltyPointsEarnedEmailHtml,
    getLoyaltyTierUpgradeEmailHtml,
    getLoyaltyPointsExpiringEmailHtml,
    getLoyaltyReferralRewardEmailHtml,
    getOwnerCriticalAlertEmailHtml,
    getDailyDigestEmailHtml,
    getPlatformUsageSpikeAlertHtml,
    getPlatformPerformanceDegradationHtml,
    getStorePerformanceNoticeHtml,
    getStoreUsageSpikeAlertHtml,
    getDataSyncDelayHtml,
    getStoreDataSyncDelayHtml,
    getDataInconsistencyAlertHtml,
    getStoreDataInconsistencyAlertHtml,
    getBackupSuccessEmailHtml,
    getBackupFailedEmailHtml,
    getStoreBackupSuccessEmailHtml,
    getStoreBackupFailedEmailHtml,
    getDisasterRecoveryTestSummaryHtml,
    getSystemConfigChangeEmailHtml,
    getCriticalSystemSettingAlertHtml,
    getReportGenerationFailureAlertHtml,
    getDelayedScheduledReportNoticeHtml,
    getReportDataCompletenessWarningHtml,
    getReportDefinitionChangedNotificationHtml,
    getReportDeprecatedNotificationHtml,
    // New Templates
    getLowStockAlertEmailHtml,
    getOutOfStockAlertEmailHtml,
    getStockRestockSuccessEmailHtml,
    getInventoryAuditRequestEmailHtml,
    getPlatformStatusEmailHtml,
    getMaintenanceModeEmailHtml,
    getStoreGovernanceEmailHtml,
    getStoreLimitAlertEmailHtml,
    getRoleEscalationEmailHtml,
    getPrivilegedAccessEmailHtml,
    getMfaSetupEmailHtml,
    getSecurityAlertEmailHtml,
    getNewDeviceLoginEmailHtml,
    getPriceOverrideAlertEmailHtml,
    getRefundLimitAlertEmailHtml,
    getStockDiscrepancyEmailHtml,
    getExpiryWarningEmailHtml,
    getPriceChangeNoticeEmailHtml,
    getCustomerOrderConfirmationEmailHtml,
    getRefundConfirmationEmailHtml,
    getCustomerLoyaltyStatementEmailHtml,
    getNewReviewNotificationEmailHtml,
    getShiftStartEmailHtml,
    getShiftEndSummaryEmailHtml,
    getStaffPerformanceMilestoneEmailHtml,
    getAccessRevokedNoticeEmailHtml,
    getUnauthorizedAccessAttemptHtml,
    getSystemDowntimeNoticeHtml,
    getHighValueReturnAlertHtml,
    getPurchaseOrderGeneratedEmailHtml,
    getPurchaseOrderStatusUpdateEmailHtml,
    getReturnProcessedEmailHtml,
    getRefundRequestAlertEmailHtml,
    getSystemOwnerRefundAlertEmailHtml,
} from '@/lib/email'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { emailType, to } = await request.json()

        // Debug Logs
        const apiKey = process.env.RESEND_API_KEY
        console.log('--- TEST EMAIL REQUEST ---')
        console.log('Available Env Keys:', Object.keys(process.env).join(', '))
        console.log(`To: ${to}`)
        console.log(`Type: ${emailType}`)
        console.log(`API Key Loaded: ${apiKey ? 'YES' : 'NO'}`)
        if (apiKey) console.log(`API Key Start: ${apiKey.substring(0, 5)}...`)

        if (!to || !emailType) {
            return NextResponse.json(
                { error: 'Email address and type are required' },
                { status: 400 }
            )
        }

        let subject = ''
        let html = ''

        // Mock Data
        const mockName = 'John Doe'
        const mockStore = 'FreshMart Supermarket'
        const mockLink = 'http://localhost:3000'
        const mockCode = '123456'

        switch (emailType) {
            // 1. Signup & Onboarding
            case 'verification_code':
                subject = '🔐 Verify Your Email - MarketPulse'
                html = getVerificationCodeEmailHtml(mockName, mockCode)
                break

            case 'signup_confirmation':
                subject = '✅ Registration Received - MarketPulse'
                html = getSignupConfirmationEmailHtml(mockName, to, mockStore)
                break

            case 'store_approval':
                subject = '🎉 Registration Approved! - MarketPulse'
                html = getApprovalEmailHtml(mockStore, mockName)
                break

            case 'store_rejection':
                subject = 'Application Status Update - MarketPulse'
                html = getRejectionEmailHtml(mockStore, mockName, 'Incomplete business documentation provided.')
                break

            case 'document_request':
                subject = 'Action Required: Additional Documents - MarketPulse'
                html = getDocumentRequestEmailHtml(mockName, mockStore, ['Business License', 'Tax ID Certificate', 'Proof of Address'])
                break

            case 'store_activation':
                subject = 'Welcome to MarketPulse! - MarketPulse'
                html = getStoreActivationEmailHtml(mockName, mockStore)
                break

            case 'onboarding_instructions':
                subject = 'Getting Started Guide 🚀 - MarketPulse'
                html = getOnboardingEmailHtml(mockName, mockStore)
                break

            // 2. User Accounts
            case 'password_reset':
                subject = 'Password Reset Request - MarketPulse'
                html = getPasswordResetEmailHtml(mockName, mockLink)
                break

            case 'password_changed':
                subject = 'Security Alert: Password Changed - MarketPulse'
                html = getPasswordChangedEmailHtml(mockName)
                break

            case 'staff_invitation':
                subject = 'You\'ve Been Invited! - MarketPulse'
                html = getStaffInvitationEmailHtml(mockName, mockStore, 'Store Manager', mockLink, 'TEMP1234')
                break

            case 'staff_created':
                subject = 'Staff Account Active - MarketPulse'
                html = getStaffAccountCreatedEmailHtml(mockName, mockStore, 'Cashier', to)
                break

            case 'suspicious_login':
                subject = 'Unusual Login Detected - MarketPulse'
                html = getSuspiciousLoginEmailHtml(mockName, {
                    ip: '192.168.1.55',
                    location: 'New York, USA',
                    device: 'Chrome on Windows',
                    time: new Date().toLocaleString()
                })
                break

            case 'account_deactivated':
                subject = 'Account Deactivation Notice - MarketPulse'
                html = getAccountDeactivatedEmailHtml(mockName, 'Violation of terms of service.')
                break

            case 'role_change':
                subject = 'Permissions Updated - MarketPulse'
                html = getRoleChangeEmailHtml(mockName, 'Store Staff', 'Store Manager', mockStore)
                break

            // 3. Loyalty & Rewards
            case 'loyalty_enrollment':
                subject = '🎉 Welcome to Our Loyalty Program! - MarketPulse'
                html = getLoyaltyEnrollmentEmailHtml(mockName, 'FreshMart Rewards', 100, 'Bronze')
                break

            case 'loyalty_points_earned':
                subject = '🎁 You Earned 50 Points! - MarketPulse'
                html = getLoyaltyPointsEarnedEmailHtml(mockName, 50, 25.00, 350, 'Bronze')
                break

            case 'loyalty_tier_upgrade':
                subject = '🎉 Congratulations! You\'re Now Silver! - MarketPulse'
                html = getLoyaltyTierUpgradeEmailHtml(mockName, 'Bronze', 'Silver', 1.5)
                break

            case 'loyalty_points_expiring':
                subject = '⚠️ 250 Points Expiring Soon! - MarketPulse'
                html = getLoyaltyPointsExpiringEmailHtml(mockName, 250, 'December 31, 2025', 15)
                break

            case 'loyalty_referral_reward':
                subject = '🎉 You Earned 500 Referral Points! - MarketPulse'
                html = getLoyaltyReferralRewardEmailHtml(mockName, 500, 'Jane Smith', 'JOH3X7K9', 3)
                break

            // 4. Executive & System Alerts
            case 'owner_critical_alert':
                subject = '[CRITICAL] SECURE_OVERRIDE_ALERT - MarketPulse'
                html = getOwnerCriticalAlertEmailHtml(mockStore, 'SECURE_OVERRIDE_ALERT', 'A high-value price override was detected at Terminal 01.', {
                    amount: '$1,250.00',
                    staff: 'Sarah W.',
                    reason: 'Bulk discount requested'
                })
                break

            case 'daily_digest':
                subject = 'Daily Performance Digest - MarketPulse'
                html = getDailyDigestEmailHtml(mockStore, new Date().toLocaleDateString(), {
                    revenue: 4250.75,
                    transactions: 124,
                    insights: [
                        'Strong sales in Fresh Produce today.',
                        'Customer traffic peaked at 4:30 PM.',
                        '3 new loyalty members joined.'
                    ]
                })
                break

            // 5. System Owner Only
            case 'platform_usage_spike':
                subject = '⚠️ CRITICAL: Platform Usage Spike Detected - MarketPulse'
                html = getPlatformUsageSpikeAlertHtml(
                    'API Requests/min',
                    '15,420',
                    '10,000',
                    '154',
                    new Date().toLocaleString(),
                    ['FreshMart Downtown', 'SuperSave Plaza', 'QuickShop Express']
                )
                break

            case 'platform_performance_degradation':
                subject = '⚡ ALERT: Platform Performance Degradation - MarketPulse'
                html = getPlatformPerformanceDegradationHtml(
                    'HIGH',
                    ['POS Terminals', 'Inventory Management', 'Reports Dashboard'],
                    '3.2s',
                    '450ms',
                    '2.4%',
                    new Date().toLocaleString(),
                    '30-45 minutes'
                )
                break

            case 'store_performance_notice':
                subject = '⚠️ System Performance Notice - MarketPulse'
                html = getStorePerformanceNoticeHtml(
                    mockStore,
                    'MEDIUM',
                    ['POS Checkout', 'Inventory Updates', 'Customer Lookup'],
                    'Within 1 hour',
                    new Date().toLocaleString(),
                    [
                        'Refresh the page if screens freeze',
                        'Double-check transaction confirmations',
                        'Keep manual backup records if needed'
                    ]
                )
                break

            case 'store_usage_spike':
                subject = '⚠️ ALERT: Unusual Activity Detected - MarketPulse'
                html = getStoreUsageSpikeAlertHtml(
                    mockStore,
                    'Transaction Volume',
                    '450 transactions/hour',
                    '120 transactions/hour',
                    '275',
                    new Date().toLocaleString(),
                    [
                        'Promotional event or sale',
                        'Multiple staff members testing the system',
                        'Bulk inventory updates',
                        'System synchronization or data migration'
                    ],
                    [
                        'Review recent transactions in your dashboard',
                        'Verify with your team if anyone is conducting tests',
                        'Check for any ongoing promotions or events',
                        'Contact support if activity cannot be explained'
                    ]
                )
                break

            case 'data_sync_delay':
                subject = '⚠️ Data Sync Delay Alert - MarketPulse'
                html = getDataSyncDelayHtml(
                    mockStore,
                    'Inventory & Sales',
                    new Date(Date.now() - 3600000).toLocaleString(), // 1 hour ago
                    '45 minutes',
                    158,
                    [
                        'Stock levels may not reflect recent sales',
                        'Customer loyalty points pending update',
                        'New product additions queued'
                    ],
                    'Within 30 minutes'
                )
                break

            case 'store_sync_delay':
                subject = '⏳ Sync Delay Notice - FreshMart Downtown'
                html = getStoreDataSyncDelayHtml(
                    mockStore,
                    'Inventory Updates',
                    '25 minutes ago',
                    ['Product stock levels', 'New price updates', 'Customer loyalty balance'],
                    [
                        'Please verify stock manually for bulk orders',
                        'Inform customers points may take 30 mins to appear',
                        'Continue using the register as normal'
                    ]
                )
                break

            case 'data_inconsistency_alert':
                subject = '🛑 Data Inconsistency Check - Immediate Action Required'
                html = getDataInconsistencyAlertHtml(
                    'FreshMart Downtown',
                    'Inventory vs Sales Mismatch',
                    42,
                    new Date().toLocaleString(),
                    'Integrity constraint violation (ERR-DB-702) in transaction log.'
                )
                break

            case 'store_data_inconsistency':
                subject = '⚠️ Data Check Required - FreshMart'
                html = getStoreDataInconsistencyAlertHtml(
                    'FreshMart Downtown',
                    'Stock Levels in Produce Section',
                    'Please manually count the "Fresh Fruits" section and cross-reference with the tablet numbers.'
                )
                break

            case 'system_backup_success':
                subject = '✅ System Backup Completed'
                html = getBackupSuccessEmailHtml(
                    `BK-${Date.now().toString().slice(-6)}`,
                    '4.2 GB',
                    '14 minutes',
                    'AWS S3 (eu-central-1)'
                )
                break

            case 'system_backup_failure':
                subject = '❌ System Backup Failed'
                html = getBackupFailedEmailHtml(
                    `BK-${Date.now().toString().slice(-6)}`,
                    'Connection timeout while uploading archive chunk 4/12',
                    2
                )
                break

            case 'store_backup_success':
                subject = '☁️ Store Data Synced'
                html = getStoreBackupSuccessEmailHtml(
                    'FreshMart Downtown',
                    ['Sales Transactions', 'Inventory Adjustments', 'Staff Logs']
                )
                break

            case 'store_backup_failure':
                subject = '⚠️ Backup Failed - Action Needed'
                html = getStoreBackupFailedEmailHtml(
                    'FreshMart Downtown',
                    'Yesterday, 14:30'
                )
                break

            case 'system_dr_summary':
                subject = '🛡️ Disaster Recovery Drill Report'
                html = getDisasterRecoveryTestSummaryHtml(
                    `DR-${Date.now().toString().slice(-6)}`,
                    'passed',
                    '3 hours 15 mins',
                    '10 mins',
                    ['Primary Database', 'Authentication Service', 'Payment Gateway']
                )
                break

            case 'system_config_change':
                subject = '⚙️ Config Change - Security Settings'
                html = getSystemConfigChangeEmailHtml(
                    `CFG-${Date.now().toString().slice(-6)}`,
                    'Admin User (admin@marketpulse.com)',
                    'Security Policy',
                    'Session Timeout',
                    '30 minutes',
                    '15 minutes'
                )
                break

            case 'critical_config_alert':
                subject = '🚨 CRITICAL: Firewall Rules Modified'
                html = getCriticalSystemSettingAlertHtml(
                    'WAF - Rule Set #4',
                    'dev_ops_master (Suspicious Session)',
                    new Date().toLocaleString(),
                    'CRITICAL'
                )
                break

            case 'report_generation_failure':
                subject = '❌ Report Generation Failed - Monthly Sales'
                html = getReportGenerationFailureAlertHtml(
                    'Monthly Sales Report (Oct 2023)',
                    'Finance Manager',
                    'Timeout after 300s waiting for DB connection pool',
                    new Date().toLocaleString()
                )
                break

            case 'delayed_report_notice':
                subject = '⏳ Report Delayed - Inventory Summary'
                html = getDelayedScheduledReportNoticeHtml(
                    'Weekly Inventory Summary',
                    '02:00 AM UTC',
                    '~45 minutes',
                    'High transaction volume ingest in progress'
                )
                break

            case 'report_data_completeness':
                subject = '⚠️ Data Completeness Warning - Sales Report'
                html = getReportDataCompletenessWarningHtml(
                    'Yearly Sales Report (2023)',
                    new Date().toLocaleString(),
                    ['Point of Sale (Store #4)', 'Online Orders (Region East)', 'Loyalty Program Data'],
                    82
                )
                break

            case 'report_definition_changed':
                subject = '📝 Report Definition Updated - Monthly Financials'
                html = getReportDefinitionChangedNotificationHtml(
                    'Monthly Financials',
                    'Senior Analyst',
                    'Added new column for "Profit Margin by Category" and updated tax calculation formula.',
                    new Date().toLocaleString()
                )
                break

            case 'report_deprecated_notice':
                subject = '🗄️ Report Deprecation - Legacy Inventory Export'
                html = getReportDeprecatedNotificationHtml(
                    'Legacy Inventory Export (v1)',
                    '2024-03-01',
                    '2024-12-31',
                    'New Inventory Dashboard (v2)'
                )
                break

            // 6. Inventory & Operations
            case 'low_stock_alert':
                subject = '⚠️ Low Stock Warning: Organic Applex'
                html = getLowStockAlertEmailHtml('Organic Apples', 'FRU-ORG-001', 12, 50)
                break

            case 'out_of_stock_alert':
                subject = '🚨 CRITICAL: Out of Stock Alert'
                html = getOutOfStockAlertEmailHtml('Whole Milk 1L', 'DAI-MIL-005')
                break

            case 'stock_restock_success':
                subject = '📦 Restock Successful - BATCH-55'
                html = getStockRestockSuccessEmailHtml('BATCH-55', 1200, 'Michael S.')
                break

            case 'inventory_audit_request':
                subject = '📋 Inventory Audit Requested: Dairy Section'
                html = getInventoryAuditRequestEmailHtml('Dairy Section', '2026-01-15')
                break

            case 'price_change_notice':
                subject = '🏷️ Price Update: Premium Coffee 500g'
                html = getPriceChangeNoticeEmailHtml('Premium Coffee 500g', 12.50, 14.99)
                break

            case 'po_generated':
                subject = '[Inventory] New Purchase Order Generated: PO-TEST-001'
                html = getPurchaseOrderGeneratedEmailHtml(mockStore, 'PO-TEST-001', 5, 250.75)
                break

            case 'po_status_update':
                subject = '[Inventory] PO Status Update: PO-TEST-001 -> RECEIVED'
                html = getPurchaseOrderStatusUpdateEmailHtml(mockStore, 'PO-TEST-001', 'SENT', 'RECEIVED')
                break

            case 'return_processed':
                subject = '[Returns] New Return Processed: TX-9821'
                html = getReturnProcessedEmailHtml(mockStore, 'TX-9821', 2, 'Damaged Packaging')
                break

            // 7. Order & Customer Excellence
            case 'customer_order_confirmation':
                subject = 'Receipt for Your Purchase #TX-9821'
                html = getCustomerOrderConfirmationEmailHtml('TX-9821', 45.75, [
                    { name: 'Loaf of Bread', price: 2.50, quantity: 2 },
                    { name: 'Sparkling Water', price: 1.25, quantity: 4 },
                    { name: 'Organic Olive Oil', price: 35.75, quantity: 1 }
                ])
                break

            case 'refund_confirmation':
                subject = 'Refund Processed - #TX-9821'
                html = getRefundConfirmationEmailHtml('TX-9821', 45.75)
                break

            case 'refund_request_alert':
                subject = '🔴 URGENT: Refund Authorization Required - Order TX-9821'
                html = getRefundRequestAlertEmailHtml(mockStore, 'TX-9821', '$45.75', 'Defective Item', 'Sarah Staff')
                break

            case 'customer_loyalty_statement':
                subject = 'Your Loyalty Points Summary'
                html = getCustomerLoyaltyStatementEmailHtml(mockName, 1250, 'Silver Elite')
                break

            case 'new_review_notification':
                subject = '⭐ New Customer Feedback Received'
                html = getNewReviewNotificationEmailHtml('Alice Johnson', 5, 'Exceptional selection of organic produce and friendly staff!')
                break

            // 8. Executive & Staff Management
            case 'shift_start':
                subject = '🔓 Shift Started: Terminal 01'
                html = getShiftStartEmailHtml('Sarah Williams', 'TERM-01', new Date().toLocaleString())
                break

            case 'shift_end_summary':
                subject = '📊 Shift Summary Report: Sarah Williams'
                html = getShiftEndSummaryEmailHtml('Sarah Williams', 'TERM-01', 1450.25, 68)
                break

            case 'staff_performance_milestone':
                subject = '🎉 Achievement Unlocked: Sarah Williams!'
                html = getStaffPerformanceMilestoneEmailHtml('Sarah Williams', '500 Successful Transactions')
                break

            case 'access_revoked_notice':
                subject = '⛔ SECURITY: Access Revoked'
                html = getAccessRevokedNoticeEmailHtml('James Miller', 'Employment separation protocol.')
                break

            // 9. Security & System Health
            case 'unauthorized_access_attempt':
                subject = '🚨 SECURITY ALERT: Unauthorized Override Attempt'
                html = getUnauthorizedAccessAttemptHtml('Intern_Dave', 'PRICE_OVERRIDE_BULK', '192.168.1.104')
                break

            case 'system_downtime_notice':
                subject = '⚡ Scheduled Maintenance Notice - Jan 15'
                html = getSystemDowntimeNoticeHtml('2026-01-15 02:00 UTC', '2 Hours')
                break

            case 'high_value_return_alert':
                subject = '🚨 Executive Alert: High-Value Return #RET-442'
                html = getHighValueReturnAlertHtml('TX-1055', 850.00, 'Chris P.')
                break

            case 'platform_config_change':
                subject = '🔴 CRITICAL: Platform Status Changed'
                html = getPlatformStatusEmailHtml('DISABLED', 'super_admin@marketpulse.com')
                break

            case 'maintenance_mode':
                subject = '🚧 System Maintenance Mode: ACTIVE'
                html = getMaintenanceModeEmailHtml(true, 'ops_manager@marketpulse.com')
                break

            case 'store_governance':
                subject = '🏪 ACTION REQUIRED: Store Profile Suspended'
                html = getStoreGovernanceEmailHtml('SUSPENDED', 'Downtown Supermarket', 'Failure to provide renewed business license', 'Compliance Team')
                break

            case 'store_limit_alert':
                subject = '⚠️ RESOURCE ALERT: Store Limit Approaching'
                html = getStoreLimitAlertEmailHtml('MegaStore #1', 'Branch Capacity', 5, 5)
                break

            case 'role_escalation':
                subject = '🛡️ SECURITY: Role Escalation Detected'
                html = getRoleEscalationEmailHtml('john.staff@email.com', 'CASHIER', 'MANAGER', 'Super Admin')
                break

            case 'privileged_access':
                subject = '🚨 CRITICAL: Privileged Access Notification'
                html = getPrivilegedAccessEmailHtml('admin@marketpulse.com', 'BULK_PRICE_SET', 'Seasonal promotion adjustment')
                break

            case 'mfa_setup':
                subject = '🔐 Security: MFA Enabled Successfully'
                html = getMfaSetupEmailHtml('user@marketpulse.com', 'Google Authenticator (TOTP)')
                break

            case 'account_security_alert':
                subject = '🚨 ALERT: Suspicious Login Attempt Detected'
                html = getSecurityAlertEmailHtml('user@marketpulse.com', 'Multiple Failed Password Attempts', 'Berlin, Germany', '192.168.1.45')
                break

            case 'new_device_login':
                subject = '📱 Security: New Device Sign-in Detected'
                html = getNewDeviceLoginEmailHtml('user@marketpulse.com', 'iPhone 15 Pro (Safari)', new Date().toLocaleString())
                break

            case 'price_override':
            case 'refund_threshold':
                subject = '🚨 CRITICAL: High-Value Refund Requested'
                html = getRefundLimitAlertEmailHtml('Downtown Branch', 1250.00, 500.00, 'Senior Manager')
                break

            case 'stock_discrepancy':
                subject = '📊 ALERT: Inventory Audit Discrepancy Detected'
                html = getStockDiscrepancyEmailHtml('Westside Megastore', 'UltraHD Smart TV 55"', 25, 23, 'Mike Auditor')
                break

            case 'expiry_warning':
                subject = '🍎 URGENT: Perishable Stock Expiry Alert'
                html = getExpiryWarningEmailHtml('Fresh Market Central', [
                    { name: 'Organic Greek Yogurt', expiry: '2026-01-15', batch: 'BTCH-4452' },
                    { name: 'Whole Wheat Bread', expiry: '2026-01-12', batch: 'BTCH-9901' },
                    { name: 'Fresh Strawberries 500g', expiry: '2026-01-10', batch: 'BTCH-1123' }
                ])
                break

            case 'system_owner_refund_alert':
                subject = '[Audit] Refund Request Logged: FreshMart'
                html = getSystemOwnerRefundAlertEmailHtml(mockStore, 'TX-9821', '$1,250.00', 'Executive Refund Request')
                break

            default:
                return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
        }

        const result = await sendEmail({ to, subject, html })

        const debugInfo = {
            apiKeyLoaded: !!apiKey,
            apiKeyStart: apiKey ? `${apiKey.substring(0, 5)}...` : 'MISSING',
            envKeys: Object.keys(process.env).filter(k => !k.startsWith('npm_')), // Filter out npm noise
            to,
            type: emailType
        }

        if (result.success) {
            // Log to Audit Center
            try {
                await db.auditLog.create({
                    data: {
                        action: 'TEST_EMAIL_SENT',
                        entity: 'System',
                        entityId: emailType,
                        details: `Sent test email (${emailType}) to ${to}`,
                        userEmail: 'admin_test', // Snapshot since we assume admin context
                    }
                })
            } catch (auditError) {
                console.error('Failed to create audit log:', auditError)
            }

            return NextResponse.json({
                success: true,
                message: `Test email sent!`,
                debug: debugInfo,
                data: result.data
            })
        } else {
            return NextResponse.json(
                {
                    error: (result.error as any)?.message || 'Failed to send email',
                    debug: debugInfo
                },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Test email error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}
