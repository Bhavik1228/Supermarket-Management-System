"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

export async function getCampaigns(query: string = "", storeId: string = 'store-freshmart') {
    try {
        const where: any = {
            storeId,
            OR: query ? [
                { name: { contains: query } },
                { client: { contains: query } }
            ] : undefined
        }

        const campaigns = await prisma.adCampaign.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, campaigns }
    } catch (error) {
        return { success: false, error: "Failed to fetch campaigns" }
    }
}

export async function createCampaign(data: any, storeId: string = 'store-freshmart') {
    try {
        const campaign = await prisma.adCampaign.create({
            data: {
                storeId,
                name: data.name,
                client: data.client,
                placement: data.placement,
                status: "ACTIVE",
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : null,
                revenue: data.budget || 0, // Using revenue field as budget for simplicity
                impressions: 0,
                clicks: 0
            }
        })

        revalidatePath("/store/marketing")

        await createAuditLog({
            action: 'AD_CAMPAIGN_LAUNCHED',
            entity: 'AdCampaign',
            entityId: campaign.id,
            details: `Marketing campaign "${campaign.name}" launched for client "${campaign.client}". Placement: ${campaign.placement}`,
            userEmail: 'owner@system.com',
            storeId
        })

        return { success: true, campaign }
    } catch (error) {
        console.error("createCampaign error:", error)
        return { success: false, error: "Failed to launch campaign" }
    }
}
export async function getAdPerformanceStats(storeId: string = 'store-freshmart') {
    try {
        const stats: any = await prisma.adCampaign.aggregate({
            where: { storeId },
            _sum: {
                impressions: true,
                clicks: true,
                revenue: true
            }
        })

        const activeCount = await prisma.adCampaign.count({
            where: { storeId, status: 'ACTIVE' }
        })

        const totalCount = await prisma.adCampaign.count({
            where: { storeId }
        })

        return {
            success: true,
            stats: {
                totalImpressions: stats?._sum?.impressions || 0,
                totalClicks: stats?._sum?.clicks || 0,
                totalBudget: stats?._sum?.revenue || 0,
                campaignCount: totalCount,
                activeCount
            }
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch ad stats" }
    }
}

export async function updateCampaignStatus(id: string, status: string) {
    try {
        await prisma.adCampaign.update({
            where: { id },
            data: { status }
        })
        revalidatePath("/store/marketing")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update campaign" }
    }
}
