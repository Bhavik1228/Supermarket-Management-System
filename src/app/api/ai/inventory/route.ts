import { NextRequest, NextResponse } from 'next/server'
import { predictInventory } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const productData = await request.json()

        if (!productData.name || productData.currentStock === undefined) {
            return NextResponse.json(
                { error: 'Product name and current stock are required' },
                { status: 400 }
            )
        }

        const prediction = await predictInventory({
            name: productData.name,
            currentStock: productData.currentStock,
            avgDailySales: productData.avgDailySales || 5,
            lastRestockDate: productData.lastRestockDate || new Date().toISOString(),
            category: productData.category || 'General'
        })

        return NextResponse.json({
            success: true,
            data: prediction
        })
    } catch (error) {
        console.error('AI Inventory prediction error:', error)
        return NextResponse.json(
            { error: 'Failed to predict inventory' },
            { status: 500 }
        )
    }
}
