import { NextRequest, NextResponse } from 'next/server'
import {
    sendEmail,
    getPasswordResetEmailHtml,
    getPasswordChangedEmailHtml,
    getStaffInvitationEmailHtml,
    getStaffAccountCreatedEmailHtml,
    getSuspiciousLoginEmailHtml,
    getAccountDeactivatedEmailHtml,
    getRoleChangeEmailHtml
} from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, to, name } = body

        let subject = ''
        let html = ''

        switch (type) {
            case 'password_reset':
                subject = '🔑 Password Reset Request - MarketPulse'
                html = getPasswordResetEmailHtml(name, body.resetLink || 'http://localhost:3000/reset-password?token=xxxx')
                break

            case 'password_changed':
                subject = '✅ Password Changed Successfully - MarketPulse'
                html = getPasswordChangedEmailHtml(name)
                break

            case 'staff_invitation':
                subject = `👋 You're Invited to Join ${body.storeName} - MarketPulse`
                const tempPassword = Math.random().toString(36).slice(-8).toUpperCase()
                html = getStaffInvitationEmailHtml(
                    name,
                    body.storeName,
                    body.role || 'Staff',
                    body.inviteLink || 'http://localhost:3000/login',
                    body.tempPassword || tempPassword
                )
                break

            case 'staff_created':
                subject = '✅ Your Staff Account is Ready - MarketPulse'
                html = getStaffAccountCreatedEmailHtml(name, body.storeName, body.role || 'Staff', to)
                break

            case 'suspicious_login':
                subject = '⚠️ Suspicious Login Detected - MarketPulse'
                html = getSuspiciousLoginEmailHtml(name, body.loginDetails || {
                    ip: '192.168.1.1',
                    location: 'Unknown Location',
                    device: 'Unknown Device',
                    time: new Date().toLocaleString()
                })
                break

            case 'account_deactivated':
                subject = 'Account Deactivated - MarketPulse'
                html = getAccountDeactivatedEmailHtml(name, body.reason)
                break

            case 'role_change':
                subject = '🔄 Your Role Has Been Updated - MarketPulse'
                html = getRoleChangeEmailHtml(name, body.oldRole || 'Staff', body.newRole || 'Manager', body.storeName)
                break

            default:
                return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
        }

        const result = await sendEmail({ to, subject, html })

        return NextResponse.json({
            success: result.success,
            message: `${type} email sent successfully`,
            emailType: type
        })

    } catch (error) {
        console.error('Email send error:', error)
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        )
    }
}
