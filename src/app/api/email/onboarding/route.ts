import { NextRequest, NextResponse } from 'next/server'
import {
    sendEmail,
    getVerificationCodeEmailHtml,
    getSignupConfirmationEmailHtml,
    getDocumentRequestEmailHtml,
    getStoreActivationEmailHtml,
    getOnboardingEmailHtml
} from '@/lib/email'

// Send Verification Code
export async function POST(request: NextRequest) {
    try {
        const { type, to, name, email, storeName, code, documents } = await request.json()

        let subject = ''
        let html = ''

        switch (type) {
            case 'verification':
                subject = '🔐 Your MarketPulse Verification Code'
                html = getVerificationCodeEmailHtml(name, code || Math.random().toString().slice(2, 8))
                break

            case 'signup_confirmation':
                subject = '✅ Welcome to MarketPulse - Registration Confirmed'
                html = getSignupConfirmationEmailHtml(name, email, storeName)
                break

            case 'document_request':
                subject = '📄 Additional Documents Required - MarketPulse'
                html = getDocumentRequestEmailHtml(name, storeName, documents || ['Business License', 'ID Proof'])
                break

            case 'activation':
                subject = '🎉 Your Store is Now Active - MarketPulse'
                html = getStoreActivationEmailHtml(name, storeName)
                break

            case 'onboarding':
                subject = '🚀 Getting Started with MarketPulse'
                html = getOnboardingEmailHtml(name, storeName)
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
