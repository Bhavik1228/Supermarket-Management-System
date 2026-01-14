"use server"

import { db as prisma } from "@/lib/db"

export async function getAuditLogs(query: string = "", storeId?: string) {
    try {
        const where: any = {
            AND: []
        }

        if (storeId) {
            where.AND.push({ storeId })
        }

        if (query) {
            where.AND.push({
                OR: [
                    { action: { contains: query } },
                    { entity: { contains: query } },
                    { userEmail: { contains: query } },
                    { details: { contains: query } }
                ]
            })
        }

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50
        })
        return { success: true, logs }
    } catch (error) {
        return { success: false, error: "Failed to fetch logs" }
    }
}

export async function createAuditLog(data: {
    action: string,
    entity: string,
    entityId?: string,
    details?: string,
    userId?: string,
    userEmail?: string,
    storeId?: string
}) {
    try {
        await prisma.auditLog.create({ data })
        return { success: true }
    } catch (error) {
        console.error("Failed to create audit log", error)
        return { success: false }
    }
}
