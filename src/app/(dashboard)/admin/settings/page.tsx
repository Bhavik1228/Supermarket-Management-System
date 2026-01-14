"use client"

import { useState, useEffect } from "react"
import { getSettings, updateSetting, rotateApiKeys, seedDefaultSettings } from "@/app/actions/settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Save, Settings, Bell, Shield, Globe, Database, Loader2,
    ShoppingCart, Package, Gift, Lock, HardDrive, RefreshCcw,
    Zap, AlertTriangle, Languages, Mail, Building2, ShieldAlert, Users, ShieldCheck, Fingerprint,
    Calculator, Receipt, History, MonitorSmartphone,
    Warehouse, ClipboardList, ScanLine, Tag
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminSettingsPage() {
    const { toast } = useToast()
    const [settings, setSettings] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [seeding, setSeeding] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        const res = await getSettings()
        if (res.success && res.settings) {
            setSettings(res.settings)
        }
        setLoading(false)
    }

    const handleUpdate = async (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        const res = await updateSetting(key, value)
        if (res.success) {
            toast({
                title: "Setting Updated",
                description: `${key} has been saved successfully.`,
            })
        }
    }

    const handleSeed = async () => {
        setSeeding(true)
        const res = await seedDefaultSettings()
        if (res.success) {
            toast({
                title: "System Seeded",
                description: `Successfully initialized ${res.count} settings.`,
            })
            loadSettings()
        }
        setSeeding(false)
    }

    const handleRotateKeys = async (provider: string) => {
        if (!confirm(`Are you sure you want to rotate keys for ${provider}?`)) return
        setSaving(true)
        const res = await rotateApiKeys(provider)
        if (res.success && res.newKey) {
            toast({
                title: "Keys Rotated",
                description: `New key: ${res.newKey.substring(0, 10)}...`,
            })
        }
        setSaving(false)
    }

    if (loading) return (
        <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Global Settings</h2>
                    <p className="text-muted-foreground">Configure every aspect of the MarketPulse platform.</p>
                </div>
                <Button variant="outline" onClick={handleSeed} disabled={seeding}>
                    {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                    Reset Defaults
                </Button>
            </div>

            <Tabs defaultValue="platform" className="space-y-6">
                <TabsList className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 h-auto p-1 gap-1">
                    <TabsTrigger value="platform" className="py-2"><Lock className="h-4 w-4 mr-2" /> 1. Platform & Global</TabsTrigger>
                    <TabsTrigger value="governance" className="py-2"><Building2 className="h-4 w-4 mr-2" /> 2. Tenant Governance</TabsTrigger>
                    <TabsTrigger value="access" className="py-2"><Users className="h-4 w-4 mr-2" /> 3. User & Access</TabsTrigger>
                    <TabsTrigger value="auth" className="py-2"><ShieldCheck className="h-4 w-4 mr-2" /> 4. Auth & Security</TabsTrigger>
                    <TabsTrigger value="pos" className="py-2"><Calculator className="h-4 w-4 mr-2" /> 5. POS & Billing</TabsTrigger>
                    <TabsTrigger value="inventory" className="py-2"><Warehouse className="h-4 w-4 mr-2" /> 6. Inventory</TabsTrigger>
                </TabsList>

                {/* 1. PLATFORM & GLOBAL CONTROL SETTINGS (System Owner Only) */}
                <TabsContent value="platform">
                    <Card className="border-red-100 bg-red-50/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-red-600" />
                                    Platform & Global Control
                                </CardTitle>
                                <CardDescription className="text-red-600/70 font-medium">SYSTEM OWNER ONLY - High Privilege Configuration</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SettingToggle
                                    label="Platform Enable / Disable"
                                    keyName="platform_enabled"
                                    value={settings.platform_enabled}
                                    onUpdate={handleUpdate}
                                />
                                <SettingToggle
                                    label="Maintenance Mode Control"
                                    keyName="maintenance_mode_enabled"
                                    value={settings.maintenance_mode_enabled}
                                    onUpdate={handleUpdate}
                                />
                                <SettingToggle
                                    label="Global Feature Enable / Disable"
                                    keyName="global_features_enabled"
                                    value={settings.global_features_enabled}
                                    onUpdate={handleUpdate}
                                />
                                <SettingToggle
                                    label="Beta Feature Access Control"
                                    keyName="beta_feature_access"
                                    value={settings.beta_feature_access}
                                    onUpdate={handleUpdate}
                                />
                                <div className="md:col-span-2">
                                    <SettingItem
                                        label="System-wide Default Configurations (JSON)"
                                        keyName="system_default_config"
                                        value={settings.system_default_config}
                                        onUpdate={handleUpdate}
                                        isTextarea
                                    />
                                </div>
                                <SettingItem
                                    label="Platform Timezone & Calendar Rules"
                                    keyName="platform_timezone"
                                    value={settings.platform_timezone}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['UTC', 'GMT', 'EAT', 'EST', 'PST']}
                                />
                                <SettingItem
                                    label="Global Currency Rules"
                                    keyName="global_currency"
                                    value={settings.global_currency}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['USD', 'EUR', 'GBP', 'KES', 'TZS']}
                                />
                                <SettingItem
                                    label="Localization Defaults"
                                    keyName="localization_default_lang"
                                    value={settings.localization_default_lang}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['en-US', 'sw-TZ', 'fr-FR']}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. TENANT / STORE GOVERNANCE (System Owner Only) */}
                <TabsContent value="governance">
                    <Card className="border-indigo-100 bg-indigo-50/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-indigo-600" />
                                    Tenant / Store Governance
                                </CardTitle>
                                <CardDescription className="text-indigo-600/70 font-medium">SYSTEM OWNER ONLY - Store Compliance & Limits</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SettingItem
                                    label="Store Onboarding Approval Rules"
                                    keyName="store_onboarding_rules"
                                    value={settings.store_onboarding_rules}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['manual_approval', 'auto_approval', 'strict_kyc']}
                                />
                                <SettingToggle
                                    label="Multi-step Store Verification"
                                    keyName="multi_step_verification_enabled"
                                    value={settings.multi_step_verification_enabled}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Store Activation / Suspension Controls"
                                    keyName="store_activation_controls"
                                    value={settings.store_activation_controls}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['standard', 'restricted', 'quarantined']}
                                />
                                <SettingItem
                                    label="Store Data Isolation Rules"
                                    keyName="data_isolation_rules_json"
                                    value={settings.data_isolation_rules_json}
                                    onUpdate={handleUpdate}
                                    isTextarea
                                />
                                <SettingItem
                                    label="Store-level Feature Entitlements"
                                    keyName="store_feature_entitlements"
                                    value={settings.store_feature_entitlements}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['all_basic', 'professional', 'enterprise']}
                                />
                                <SettingItem
                                    label="Maximum Branches Per Store"
                                    keyName="max_branches_per_store"
                                    type="number"
                                    value={settings.max_branches_per_store}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Maximum Users Per Store"
                                    keyName="max_users_per_store"
                                    type="number"
                                    value={settings.max_users_per_store}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Store Deletion & Archival Rules"
                                    keyName="store_archival_rules"
                                    value={settings.store_archival_rules}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['30_days_inactivity', '90_days_inactivity', 'manual_only']}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. USER, ROLE & PERMISSION SETTINGS (System Owner Only) */}
                <TabsContent value="access">
                    <Card className="border-amber-100 bg-amber-50/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-amber-600" />
                                    User, Role & Permission Settings
                                </CardTitle>
                                <CardDescription className="text-amber-600/70 font-medium">SYSTEM OWNER ONLY - Authentication & Authorization</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SettingItem
                                    label="System-wide Role Definitions (JSON)"
                                    keyName="system_role_definitions"
                                    value={settings.system_role_definitions}
                                    onUpdate={handleUpdate}
                                    isTextarea
                                />
                                <div className="space-y-4">
                                    <SettingToggle
                                        label="Permission Inheritance Rules"
                                        keyName="permission_inheritance_enabled"
                                        value={settings.permission_inheritance_enabled}
                                        onUpdate={handleUpdate}
                                    />
                                    <SettingToggle
                                        label="IP/Device Restriction Rules"
                                        keyName="ip_device_restriction_enabled"
                                        value={settings.ip_device_restriction_enabled}
                                        onUpdate={handleUpdate}
                                    />
                                </div>
                                <SettingItem
                                    label="Role Escalation Policies"
                                    keyName="role_escalation_policy"
                                    value={settings.role_escalation_policy}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['mfa_required', 'owner_approval_only', 'automatic_log']}
                                />
                                <SettingItem
                                    label="Privileged Access Rules (JSON)"
                                    keyName="privileged_access_rules"
                                    value={settings.privileged_access_rules}
                                    onUpdate={handleUpdate}
                                    isTextarea
                                />
                                <SettingItem
                                    label="Session Timeout (Minutes)"
                                    keyName="session_timeout_mins"
                                    type="number"
                                    value={settings.session_timeout_mins}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Concurrent Login Limits"
                                    keyName="concurrent_login_limit"
                                    type="number"
                                    value={settings.concurrent_login_limit}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Forced Logout Policies"
                                    keyName="forced_logout_policy"
                                    value={settings.forced_logout_policy}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['immediate_session_kill', 'next_request_block', 'graceful_warning']}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 4. AUTHENTICATION & SECURITY (System Owner Only) */}
                <TabsContent value="auth">
                    <Card className="border-emerald-100 bg-emerald-50/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Fingerprint className="h-5 w-5 text-emerald-600" />
                                    Authentication & Security
                                </CardTitle>
                                <CardDescription className="text-emerald-600/70 font-medium">SYSTEM OWNER ONLY - Core Security Policies</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SettingItem
                                    label="Allowed Authentication Methods"
                                    keyName="allowed_auth_methods"
                                    value={settings.allowed_auth_methods}
                                    onUpdate={handleUpdate}
                                    isTextarea
                                />
                                <SettingItem
                                    label="MFA Enforcement Level"
                                    keyName="mfa_enforcement_level"
                                    value={settings.mfa_enforcement_level}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['optional', 'mandatory_admin', 'mandatory_all']}
                                />
                                <SettingItem
                                    label="Password Complexity Rules (JSON)"
                                    keyName="password_complexity_json"
                                    value={settings.password_complexity_json}
                                    onUpdate={handleUpdate}
                                    isTextarea
                                    className="md:col-span-2"
                                />
                                <SettingItem
                                    label="Credential Rotation Policy (Days)"
                                    keyName="credential_rotation_days"
                                    type="number"
                                    value={settings.credential_rotation_days}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Failed Login Attempt Threshold"
                                    keyName="max_login_attempts"
                                    type="number"
                                    value={settings.max_login_attempts}
                                    onUpdate={handleUpdate}
                                />
                                <SettingToggle
                                    label="Brute-force Protection"
                                    keyName="brute_force_protection_enabled"
                                    value={settings.brute_force_protection_enabled}
                                    onUpdate={handleUpdate}
                                />
                                <SettingToggle
                                    label="New Device Verification"
                                    keyName="new_device_verification_enabled"
                                    value={settings.new_device_verification_enabled}
                                    onUpdate={handleUpdate}
                                />
                                <SettingToggle
                                    label="Privileged Action Re-authentication"
                                    keyName="privileged_action_reauth_enabled"
                                    value={settings.privileged_action_reauth_enabled}
                                    onUpdate={handleUpdate}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 5. POS & BILLING GLOBAL RULES (System Owner Only) */}
                <TabsContent value="pos">
                    <Card className="border-blue-100 bg-blue-50/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-blue-600" />
                                    POS & Billing Global Rules
                                </CardTitle>
                                <CardDescription className="text-blue-600/70 font-medium">SYSTEM OWNER ONLY - POS Compliance & Governance</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SettingItem
                                    label="Default Billing Behavior"
                                    keyName="default_billing_behavior"
                                    value={settings.default_billing_behavior}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['standard', 'express', 'itemized', 'simplified']}
                                />
                                <SettingItem
                                    label="POS Feature Availability (JSON)"
                                    keyName="pos_feature_availability_json"
                                    value={settings.pos_feature_availability_json}
                                    onUpdate={handleUpdate}
                                    isTextarea
                                />
                                <SettingItem
                                    label="Price Override Permissions"
                                    keyName="price_override_permissions"
                                    value={settings.price_override_permissions}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['manager_only', 'owner_only', 'any_staff_with_reason', 'prohibited']}
                                />
                                <SettingItem
                                    label="Global Discount Ceiling (%)"
                                    keyName="global_discount_ceiling"
                                    type="number"
                                    value={settings.global_discount_ceiling}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Refund & Return Limits (JSON)"
                                    keyName="refund_return_limits_json"
                                    value={settings.refund_return_limits_json}
                                    onUpdate={handleUpdate}
                                    isTextarea
                                    className="md:col-span-2"
                                />
                                <SettingItem
                                    label="Bill Edit Window (Minutes)"
                                    keyName="bill_edit_window_mins"
                                    type="number"
                                    value={settings.bill_edit_window_mins}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Offline Billing Credit Limit"
                                    keyName="offline_billing_limit"
                                    type="number"
                                    value={settings.offline_billing_limit}
                                    onUpdate={handleUpdate}
                                />
                                <SettingItem
                                    label="Forced Sync Behavior"
                                    keyName="forced_sync_behavior"
                                    value={settings.forced_sync_behavior}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['block_on_fail', 'retry_background', 'warn_and_continue']}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 6. INVENTORY & STOCK GOVERNANCE (System Owner Only) */}
                <TabsContent value="inventory">
                    <Card className="border-indigo-100 bg-indigo-50/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                                    Inventory & Stock Governance
                                </CardTitle>
                                <CardDescription className="text-indigo-600/70 font-medium">SYSTEM OWNER ONLY - Stock Control & Audit policies</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SettingItem
                                    label="Stock Valuation Method"
                                    keyName="global_stock_valuation_method"
                                    value={settings.global_stock_valuation_method}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['FIFO', 'LIFO', 'Weighted Average', 'Standard Cost']}
                                />
                                <SettingItem
                                    label="Negative Inventory Policy"
                                    keyName="negative_inventory_policy"
                                    value={settings.negative_inventory_policy}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['prohibit', 'allow_with_warning', 'allow_silent_negative', 'prohibit_at_pos_only']}
                                />
                                <SettingItem
                                    label="Stock Adjustment Permissions"
                                    keyName="stock_adjustment_permissions"
                                    value={settings.stock_adjustment_permissions}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['manager_only', 'owner_only', 'dual_approval_required', 'any_staff_with_audit']}
                                />
                                <SettingItem
                                    label="Expiry Tracking Enforcement"
                                    keyName="expiry_tracking_enforcement"
                                    value={settings.expiry_tracking_enforcement}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['mandatory_food_items', 'none', 'mandatory_all_stock', 'perishables_only']}
                                />
                                <SettingItem
                                    label="Batch & Serial Tracking Defaults"
                                    keyName="batch_serial_tracking_defaults"
                                    value={settings.batch_serial_tracking_defaults}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['batch_only', 'serial_only', 'dual_tracking', 'none']}
                                />
                                <SettingItem
                                    label="Inter-store Transfer Rules"
                                    keyName="inter_store_transfer_rules"
                                    value={settings.inter_store_transfer_rules}
                                    onUpdate={handleUpdate}
                                    isSelect
                                    options={['approval_required', 'automatic', 'disabled', 'origin_store_approval_only']}
                                />
                                <SettingItem
                                    label="Inventory Audit Frequency (Days)"
                                    keyName="inventory_audit_frequency_days"
                                    type="number"
                                    value={settings.inventory_audit_frequency_days}
                                    onUpdate={handleUpdate}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function SettingItem({ label, keyName, value, type = "text", onUpdate, isSelect = false, options = [], isTextarea = false }: any) {
    const [localValue, setLocalValue] = useState(value)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    if (isSelect) {
        return (
            <div className="space-y-1.5">
                <Label>{label}</Label>
                <Select value={localValue} onValueChange={v => onUpdate(keyName, v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        )
    }

    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Input
                    type={type}
                    value={localValue || ''}
                    onChange={e => setLocalValue(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={() => onUpdate(keyName, localValue)} disabled={localValue === value}>
                    <Save className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function SettingToggle({ label, keyName, value, onUpdate }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200 transition-all hover:bg-slate-50">
            <div className="space-y-0.5">
                <Label className="text-sm font-semibold">{label}</Label>
                <p className="text-[11px] text-muted-foreground font-mono">{keyName}</p>
            </div>
            <Switch
                checked={!!value}
                onCheckedChange={checked => onUpdate(keyName, checked)}
            />
        </div>
    )
}
