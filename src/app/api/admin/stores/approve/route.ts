import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, getApprovalEmailHtml, getRejectionEmailHtml } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { storeId, action, message } = await request.json()

        if (!storeId || !action) {
            return NextResponse.json(
                { error: 'Store ID and action are required' },
                { status: 400 }
            )
        }

        // Get store with owner details
        const store = await db.store.findUnique({
            where: { id: storeId },
            include: { owner: true }
        })

        if (!store) {
            return NextResponse.json(
                { error: 'Store not found' },
                { status: 404 }
            )
        }

        // Update store status
        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

        await db.store.update({
            where: { id: storeId },
            data: { status: newStatus }
        })

        // Create audit log
        await db.auditLog.create({
            data: {
                action: action === 'approve' ? 'STORE_APPROVED' : 'STORE_REJECTED',
                entity: 'Store',
                entityId: storeId,
                details: message || `Store ${store.name} was ${newStatus.toLowerCase()} by System Owner.`,
                userEmail: 'admin@marketpulse.com', // In production, get from session
            }
        })

        // Send email via Resend
        let emailResult = { success: false }
        if (store.owner?.email) {
            const ownerName = store.owner.name || 'Store Owner'
            const subject = action === 'approve'
                ? `🎉 Your store "${store.name}" has been approved!`
                : `Store Registration Update: "${store.name}"`

            const html = action === 'approve'
                ? getApprovalEmailHtml(store.name, ownerName)
                : getRejectionEmailHtml(store.name, ownerName, message)

            emailResult = await sendEmail({
                to: store.owner.email,
                subject,
                html
            })
        }

        return NextResponse.json({
            success: true,
            message: `Store ${newStatus.toLowerCase()} successfully`,
            emailSent: emailResult.success,
            store: {
                id: store.id,
                name: store.name,
                status: newStatus,
                ownerEmail: store.owner?.email
            }
        })

    } catch (error) {
        console.error('Store approval error:', error)
        return NextResponse.json(
            { error: 'An error occurred during store approval' },
            { status: 500 }
        )
    }
}

// AI Draft endpoint
export async function PUT(request: NextRequest) {
    try {
        const { storeId, action } = await request.json()

        const store = await db.store.findUnique({
            where: { id: storeId },
            include: { owner: true }
        })

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        }

        // Generate AI draft message
        let draft = ''
        if (action === 'approve') {
            draft = `Dear ${store.owner?.name || 'Store Owner'},

Congratulations! 🎉

We are thrilled to inform you that your store "${store.name}" has been successfully approved on MarketPulse.

What's Next:
1. Log in to your Store Dashboard at marketpulse.com
2. Add your products and set up your inventory
3. Configure your store settings and staff access
4. Start serving customers!

Your Store Details:
- Store Name: ${store.name}
- Store Type: ${store.storeType}
- Status: APPROVED ✅

If you have any questions, our support team is here to help.

Welcome to the MarketPulse community!

Best regards,
The MarketPulse Team`
        } else {
            draft = `Dear ${store.owner?.name || 'Store Owner'},

Thank you for your interest in joining MarketPulse.

After careful review, we regret to inform you that your store registration for "${store.name}" could not be approved at this time.

Common reasons for rejection include:
- Incomplete or unclear business documentation
- Unable to verify business license
- Information mismatch in submitted documents

What You Can Do:
1. Review your submitted documents
2. Ensure all business information is accurate
3. Resubmit your application with updated details
4. Contact support@marketpulse.com for clarification

We encourage you to address these concerns and reapply.

Best regards,
The MarketPulse Team`
        }

        return NextResponse.json({
            success: true,
            draft,
            storeName: store.name,
            ownerEmail: store.owner?.email
        })

    } catch (error) {
        console.error('AI draft error:', error)
        return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 })
    }
}
