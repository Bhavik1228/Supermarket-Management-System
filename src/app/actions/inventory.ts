"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

export async function getInventory(query: string = "", storeId?: string) {
    try {
        const where: any = {}
        if (query) {
            where.OR = [
                { name: { contains: query } },
                { barcode: { contains: query } }
            ]
        }
        if (storeId) {
            where.storeId = storeId
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                store: true
            }
        })
        return { success: true, products }
    } catch (error) {
        return { success: false, error: "Failed to fetch inventory" }
    }
}

export async function updateStock(productId: string, newStock: number, reason: string, userId: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { store: true }
        })

        if (!product) return { success: false, error: "Product not found" }

        const oldStock = product.stock
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { stock: newStock }
        })

        // Audit the override
        await createAuditLog({
            action: 'INVENTORY_OVERRIDE',
            entity: 'Product',
            entityId: productId,
            details: `Stock for "${product.name}" overridden from ${oldStock} to ${newStock}. Reason: ${reason}`,
            userId: userId,
            userEmail: 'staff@marketpulse.com' // Simulation
        })

        revalidatePath("/store/inventory")
        revalidatePath("/admin/products")

        return { success: true, product: updatedProduct }
    } catch (error) {
        return { success: false, error: "Failed to update stock" }
    }
}
