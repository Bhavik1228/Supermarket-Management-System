"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getCustomers(query: string = "") {
    try {
        const where = query
            ? {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                    { phone: { contains: query } },
                ],
            }
            : {}

        const customers = await prisma.user.findMany({
            where: {
                ...where,
                role: "CUSTOMER"
            },
            include: {
                LoyaltyAccount: {
                    include: { tier: true }
                },
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // console.log("Fetched customers:", customers.length)
        return { success: true, customers }
    } catch (error) {
        return { success: false, error: "Failed to fetch customers" }
    }
}

export async function createCustomer(data: any) {
    try {
        if (!data.name || (!data.email && !data.phone)) {
            return { success: false, error: "Name and either Email or Phone are required" }
        }

        // Check Email Uniqueness
        if (data.email) {
            const existingEmail = await prisma.user.findFirst({ where: { email: data.email } })
            if (existingEmail) return { success: false, error: "Customer with this email already exists" }
        }

        // Check Phone Uniqueness
        if (data.phone) {
            const existingPhone = await prisma.user.findFirst({ where: { phone: data.phone } })
            if (existingPhone) return { success: false, error: "Customer with this phone already exists" }
        }

        // --- ROBUST RELATION HANDLING ---
        // 1. Get or Create Default Store (needed for Program context)
        let store = await prisma.store.findFirst()
        if (!store) {
            const owner = await prisma.user.create({
                data: {
                    name: "System Owner",
                    email: `admin-${Date.now()}@system.com`,
                    password: "admin",
                    role: "SYSTEM_OWNER"
                }
            })
            store = await prisma.store.create({
                data: {
                    name: "Main Store",
                    storeType: "SUPERMARKET",
                    ownerId: owner.id,
                    status: "APPROVED"
                }
            })
        }

        // 2. Get or Create Loyalty Program
        let program = await prisma.loyaltyProgram.findFirst({ where: { storeId: store.id } })
        if (!program) {
            program = await prisma.loyaltyProgram.create({
                data: {
                    name: "Default Loyalty",
                    storeId: store.id,
                    currencyName: "Points",
                    earningRate: 1.0,
                    isActive: true
                }
            })
        }

        // 3. Get or Create Tier
        let tier = await prisma.loyaltyTier.findFirst({ where: { programId: program.id }, orderBy: { minPoints: 'asc' } })
        if (!tier) {
            tier = await prisma.loyaltyTier.create({
                data: {
                    name: "Bronze",
                    minPoints: 0,
                    multiplier: 1.0,
                    programId: program.id
                }
            })
        }

        const customer = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email || `guest-${Date.now()}@pos.local`, // Fallback for phone-only customers
                phone: data.phone,
                role: "CUSTOMER",
                password: "customer_initial_pass",
                LoyaltyAccount: {
                    create: {
                        pointsBalance: 0,
                        lifetimePoints: 0,
                        programId: program.id, // Explicitly provide required programId
                        tierId: tier.id        // Explicitly provide required tierId
                    }
                }
            }
        })

        revalidatePath("/store/customers")
        return { success: true, customer }
    } catch (error: any) {
        console.error("Create customer error:", error)
        return { success: false, error: error.message || "Failed to create customer" }
    }
}

export async function getCustomerDetails(id: string) {
    try {
        const customer = await prisma.user.findUnique({
            where: { id },
            include: {
                LoyaltyAccount: {
                    include: { tier: true }
                },
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { items: true }
                }
            }
        })
        return { success: true, customer }
    } catch (error) {
        return { success: false, error: "Customer not found" }
    }
}
