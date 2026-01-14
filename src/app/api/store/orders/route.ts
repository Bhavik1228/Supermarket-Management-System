import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { storeId, items, paymentMethod, subtotal, tax, total, cashierId } = body

        if (!storeId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Invalid order data' },
                { status: 400 }
            )
        }

        // Use transaction to ensure data integrity
        const result = await db.$transaction(async (prisma) => {
            // 1. Create the Order
            const order = await prisma.order.create({
                data: {
                    storeId,
                    subtotal,
                    tax,
                    total,
                    paymentMethod,
                    status: 'COMPLETED',
                    cashierId: cashierId || null,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            name: item.name,
                            total: item.price * item.quantity
                        }))
                    },
                    transactions: {
                        create: {
                            type: 'PAYMENT',
                            amount: total,
                            status: 'SUCCESS'
                        }
                    }
                },
                include: {
                    items: true
                }
            })

            // 2. Update Product Stock
            for (const item of items) {
                await prisma.product.update({
                    where: { id: item.id },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                })
            }

            return order
        })

        return NextResponse.json({
            success: true,
            data: result
        })

    } catch (error) {
        console.error('Order creation error:', error)
        return NextResponse.json(
            { error: 'Failed to process order' },
            { status: 500 }
        )
    }
}
