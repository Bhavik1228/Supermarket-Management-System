"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

export async function getCampaigns(query: string = "") {
    try {
        const where: any = query ? {
            OR: [
                { name: { contains: query } },
                { client: { contains: query } }
            ]
        } : {}

        const campaigns = await prisma.adCampaign.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, campaigns }
    } catch (error) {
        return { success: false, error: "Failed to fetch campaigns" }
    }
}

export async function createCampaign(data: any) {
    try {
        const campaign = await prisma.adCampaign.create({
            data: {
                name: data.name,
                client: data.client,
                placement: data.placement,
                status: "ACTIVE",
                startDate: new Date(),
                // Add revenue or other fields if passed
            }
        })

        revalidatePath("/admin/ads")

        // Create audit log
        await createAuditLog({
            action: 'AD_CAMPAIGN_CREATED',
            entity: 'AdCampaign',
            entityId: campaign.id,
            details: `Ad campaign "${campaign.name}" launched for client "${campaign.client}" at placement "${campaign.placement}".`,
            userEmail: 'admin@marketpulse.com'
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create campaign" }
    }
}

export async function getAdStats() {
    try {
        const totalRevenue = (await prisma.adCampaign.aggregate({ _sum: { revenue: true } }))._sum.revenue || 0
        const activeCount = await prisma.adCampaign.count({ where: { status: "ACTIVE" } })
        const totalImpressions = (await prisma.adCampaign.aggregate({ _sum: { impressions: true } }))._sum.impressions || 0

        return { totalRevenue, activeCount, totalImpressions }
    } catch (error) {
        return { totalRevenue: 0, activeCount: 0, totalImpressions: 0 }
    }
}
