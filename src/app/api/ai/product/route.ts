import { NextRequest, NextResponse } from 'next/server'
import { generateProductDetails } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { productName, category } = await request.json()

        if (!productName) {
            return NextResponse.json(
                { error: 'Product name is required' },
                { status: 400 }
            )
        }

        const details = await generateProductDetails(productName, category)

        return NextResponse.json({
            success: true,
            data: details
        })
    } catch (error) {
        console.error('AI Product generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate product details' },
            { status: 500 }
        )
    }
}
