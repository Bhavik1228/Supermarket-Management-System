'use server'

import { STATUS_STORE, type ComponentStatus, type Incident } from '@/lib/status-store'
import { revalidatePath } from 'next/cache'

export async function getSystemStatus() {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
        components: STATUS_STORE.getComponents(),
        incidents: STATUS_STORE.getIncidents()
    }
}

export async function updateComponentStatus(componentId: string, status: ComponentStatus) {
    STATUS_STORE.updateComponent(componentId, status)
    revalidatePath('/admin/status')
    revalidatePath('/store/system-status')
    return { success: true }
}

export async function createIncident(data: { title: string, message: string, severity: Incident['severity'] }) {
    const newIncident: Incident = {
        id: crypto.randomUUID(),
        title: data.title,
        message: data.message,
        severity: data.severity,
        status: 'INVESTIGATING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    STATUS_STORE.addIncident(newIncident)
    revalidatePath('/admin/status')
    revalidatePath('/store/system-status')
    return { success: true }
}

export async function resolveIncident(incidentId: string) {
    STATUS_STORE.resolveIncident(incidentId)
    revalidatePath('/admin/status')
    revalidatePath('/store/system-status')
    return { success: true }
}
