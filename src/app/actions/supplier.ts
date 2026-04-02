"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getSuppliers(storeId: string) {
    try {
        const suppliers = await prisma.supplier.findMany({
            where: { storeId },
            include: {
                _count: {
                    select: { products: true, purchaseOrders: true }
                }
            },
            orderBy: { name: 'asc' }
        })
        return { success: true, suppliers }
    } catch (error) {
        console.error("getSuppliers error:", error)
        return { success: false, error: "Failed to fetch suppliers" }
    }
}

export async function createSupplier(storeId: string, data: {
    name: string,
    contact?: string,
    email?: string,
    phone?: string,
    address?: string,
    category?: string
}) {
    try {
        const supplier = await prisma.supplier.create({
            data: {
                ...data,
                storeId
            }
        })
        revalidatePath('/store/suppliers')
        return { success: true, supplier }
    } catch (error) {
        console.error("createSupplier error:", error)
        return { success: false, error: "Failed to create supplier" }
    }
}

export async function updateSupplierPayables(id: string, amount: number) {
    try {
        await prisma.supplier.update({
            where: { id },
            data: { payables: { increment: amount } }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update payables" }
    }
}
