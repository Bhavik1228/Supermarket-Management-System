"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"
import { Prisma } from "@prisma/client"
import { createAuditLog } from "./audit"

export async function getUsers(query: string = "") {
    try {
        const where: Prisma.UserWhereInput = query
            ? {
                OR: [
                    { name: { contains: query } }, // Case insensitive usually depends on DB collation
                    { email: { contains: query } },
                    { role: { contains: query } },
                ],
            }
            : {}

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true, // Use createdAt as proxy for last login if not tracking login
                // status: true, // Assuming status field doesn't exist yet on User model based on schema I saw earlier. We'll simulate or add if needed.
            },
        })

        // Map to UI format
        return { success: true, users }
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return { success: false, error: "Failed to fetch users" }
    }
}

export async function getStats() {
    try {
        const [totalUsers, admins, stores] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: { in: ['SYSTEM_OWNER', 'STORE_OWNER'] } } }),
            prisma.store.count(),
        ])

        // For now, active sessions is simulated but based on a real range
        const activeSessions = Math.floor(Math.random() * 20) + 5

        return { totalUsers, admins, activeSessions, stores }
    } catch (error) {
        return { totalUsers: 0, admins: 0, activeSessions: 0, stores: 0 }
    }
}

export async function createAdmin(data: any) {
    try {
        const existing = await prisma.user.findUnique({ where: { email: data.email } })
        if (existing) return { success: false, error: "Email already exists" }

        const hashedPassword = await hash(data.password || "password123", 10)

        const roleMap: Record<string, string> = {
            "Store Manager": "STORE_MANAGER",
            "Store Owner": "STORE_OWNER",
            "Support Staff": "STORE_STAFF",
            "Admin": "SYSTEM_OWNER"
        }

        const role = roleMap[data.role] || "STORE_STAFF"

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: role,
            }
        })

        revalidatePath("/admin/users")

        // Create audit log
        await createAuditLog({
            action: 'ADMIN_CREATED',
            entity: 'User',
            entityId: user.id,
            details: `Admin user ${user.name} created with role ${role}.`,
            userEmail: 'admin@marketpulse.com' // Simulation, in real app get from session
        })

        return { success: true, user }
    } catch (error) {
        console.error("Create admin error:", error)
        return { success: false, error: "Failed to create admin" }
    }
}

export async function exportUsers() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        })

        // Convert to CSV
        const header = "ID,Name,Email,Role,Created At\n"
        const rows = users.map(u => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.createdAt.toISOString()}"`).join("\n")

        return { success: true, csv: header + rows }
    } catch (error) {
        return { success: false, error: "Failed to export users" }
    }
}
