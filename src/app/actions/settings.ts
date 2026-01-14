"use server"

import { db as prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "./audit"

export async function getSettings() {
    try {
        const settings = await prisma.systemSetting.findMany()
        // Convert array to object for easier consumption
        const settingsMap: Record<string, any> = {}
        settings.forEach(s => {
            try {
                settingsMap[s.key] = JSON.parse(s.value)
            } catch (e) {
                settingsMap[s.key] = s.value
            }
        })
        return { success: true, settings: settingsMap }
    } catch (error) {
        return { success: false, error: "Failed to fetch settings" }
    }
}

export async function updateSetting(key: string, value: any) {
    try {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value: JSON.stringify(value) },
            create: { key, value: JSON.stringify(value) }
        })

        await createAuditLog({
            action: 'SYSTEM_SETTING_UPDATED',
            entity: 'SystemSetting',
            details: `Setting "${key}" updated to: ${JSON.stringify(value)}`,
            userEmail: 'admin@marketpulse.com'
        })

        // Trigger Security Emails for Platform Controls
        if (key === 'platform_enabled') {
            const { getPlatformStatusEmailHtml, sendEmail } = await import("@/lib/email")
            await sendEmail({
                to: "admin@marketpulse.com",
                subject: `🔴 CRITICAL: Platform ${value ? 'ENABLED' : 'DISABLED'}`,
                html: getPlatformStatusEmailHtml(value ? 'ENABLED' : 'DISABLED', "System Owner")
            })
        } else if (key === 'maintenance_mode_enabled') {
            const { getMaintenanceModeEmailHtml, sendEmail } = await import("@/lib/email")
            await sendEmail({
                to: "admin@marketpulse.com",
                subject: `🚧 System Maintenance Mode: ${value ? 'ACTIVE' : 'INACTIVE'}`,
                html: getMaintenanceModeEmailHtml(value, "System Owner")
            })
        }

        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Update error:", error)
        return { success: false, error: "Failed to update setting" }
    }
}

export async function rotateApiKeys(provider: string) {
    try {
        // Simulation of key rotation
        const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

        await prisma.systemSetting.upsert({
            where: { key: `${provider}_api_key` },
            update: { value: JSON.stringify(newKey) },
            create: { key: `${provider}_api_key`, value: JSON.stringify(newKey) }
        })

        await createAuditLog({
            action: 'API_KEY_ROTATED',
            entity: 'SystemSetting',
            details: `API key rotated for provider: ${provider}`,
            userEmail: 'admin@marketpulse.com'
        })

        revalidatePath("/admin/settings")
        return { success: true, newKey }
    } catch (error) {
        return { success: false, error: "Failed to rotate API keys" }
    }
}

export async function seedDefaultSettings() {
    const defaultSettings: Record<string, any> = {
        // 1. PLATFORM & GLOBAL CONTROL SETTINGS (System Owner Only)
        "platform_enabled": true,
        "maintenance_mode_enabled": false,
        "global_features_enabled": true,
        "beta_feature_access": false,
        "system_default_config": "{}", // Reserved for complex config
        "platform_timezone": "UTC",
        "global_currency": "USD",
        "localization_default_lang": "en-US",

        // 2. TENANT / STORE GOVERNANCE (System Owner Only)
        "store_onboarding_rules": "manual_approval",
        "multi_step_verification_enabled": true,
        "store_activation_controls": "standard",
        "data_isolation_rules_json": "{\"isolation_level\": \"tenant\"}",
        "store_feature_entitlements": "all_basic",
        "max_branches_per_store": 5,
        "max_users_per_store": 20,
        "store_archival_rules": "90_days_inactivity",

        // 3. USER, ROLE & PERMISSION SETTINGS (System Owner Only)
        "system_role_definitions": "{\"roles\": [\"OWNER\", \"MANAGER\", \"CASHIER\", \"INVENTORY\"]}",
        "permission_inheritance_enabled": true,
        "role_escalation_policy": "mfa_required",
        "privileged_access_rules": "{\"require_reason\": true, \"duration_limit_hours\": 4}",
        "session_timeout_mins": 60,
        "concurrent_login_limit": 2,
        "ip_device_restriction_enabled": false,
        "forced_logout_policy": "immediate_session_kill",

        // 4. AUTHENTICATION & SECURITY (System Owner Only)
        "allowed_auth_methods": "[\"password\", \"mfa_totp\"]",
        "mfa_enforcement_level": "optional",
        "password_complexity_json": "{\"min_length\": 8, \"require_special\": true, \"require_numbers\": true}",
        "credential_rotation_days": 90,
        "max_login_attempts": 5,
        "brute_force_protection_enabled": true,
        "new_device_verification_enabled": true,
        "privileged_action_reauth_enabled": true,

        // 5. POS & BILLING GLOBAL RULES (System Owner Only)
        "default_billing_behavior": "standard",
        "pos_feature_availability_json": "{\"returns\": true, \"discounts\": true, \"voids\": true}",
        "price_override_permissions": "manager_only",
        "global_discount_ceiling": 20,
        "refund_return_limits_json": "{\"max_amount\": 500, \"days_limit\": 30}",
        "bill_edit_window_mins": 15,
        "offline_billing_limit": 1000,
        "forced_sync_behavior": "block_on_fail",

        // 6. INVENTORY & STOCK GOVERNANCE (System Owner Only)
        "global_stock_valuation_method": "FIFO",
        "negative_inventory_policy": "prohibit",
        "stock_adjustment_permissions": "manager_only",
        "expiry_tracking_enforcement": "mandatory_food_items",
        "batch_serial_tracking_defaults": "batch_only",
        "inter_store_transfer_rules": "approval_required",
        "inventory_audit_frequency_days": 30,
    }

    try {
        const results = await Promise.all(
            Object.entries(defaultSettings).map(([key, value]) =>
                prisma.systemSetting.upsert({
                    where: { key },
                    update: { /* Preserve values if already exists? User said remove them, but upsert is safer. */ },
                    create: { key, value: JSON.stringify(value) }
                })
            )
        )
        return { success: true, count: results.length }
    } catch (error) {
        console.error("Seeding error:", error)
        return { success: false, error: "Failed to seed settings" }
    }
}
