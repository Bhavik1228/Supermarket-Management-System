import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Find user by email
        const user = await db.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Simple password check (in production, use bcrypt!)
        if (user.password !== password) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Determine redirect based on role
        let redirectTo = '/store'
        let storeStatus = null

        if (user.role === 'SYSTEM_OWNER') {
            redirectTo = '/admin'
        } else if (user.role === 'STORE_OWNER') {
            // Check store approval status
            const store = await db.store.findFirst({
                where: { ownerId: user.id }
            })
            if (store) {
                storeStatus = store.status
                if (store.status === 'PENDING') {
                    redirectTo = '/pending'
                } else if (store.status === 'REJECTED') {
                    return NextResponse.json(
                        { error: 'Your store registration was not approved. Please contact support.' },
                        { status: 403 }
                    )
                }
            }
        }

        // Return user info (excluding password)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            storeStatus,
            redirectTo,
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        )
    }
}
