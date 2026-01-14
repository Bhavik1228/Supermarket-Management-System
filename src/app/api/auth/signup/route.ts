import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, getSignupConfirmationEmailHtml, getVerificationCodeEmailHtml } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, storeName, storeType } = await request.json()

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            )
        }

        // Create user (in production, hash the password!)
        const user = await db.user.create({
            data: {
                name,
                email,
                password, // Should be hashed in production
                role: 'STORE_OWNER',
            },
        })

        // If store details provided, create store
        if (storeName) {
            await db.store.create({
                data: {
                    name: storeName,
                    storeType: storeType || 'SUPERMARKET',
                    status: 'PENDING',
                    ownerId: user.id,
                },
            })
        }

        // Send verification code email
        const verificationCode = Math.random().toString().slice(2, 8)
        await sendEmail({
            to: email,
            subject: '🔐 Verify Your Email - MarketPulse',
            html: getVerificationCodeEmailHtml(name, verificationCode)
        })

        // Send signup confirmation email
        await sendEmail({
            to: email,
            subject: '✅ Welcome to MarketPulse - Registration Confirmed',
            html: getSignupConfirmationEmailHtml(name, email, storeName)
        })

        return NextResponse.json({
            success: true,
            message: 'Account created successfully! Check your email for verification.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'An error occurred during registration' },
            { status: 500 }
        )
    }
}

