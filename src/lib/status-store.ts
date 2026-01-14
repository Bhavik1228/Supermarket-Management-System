
export type ComponentStatus = 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'MAINTENANCE'

export type SystemComponent = {
    id: string
    name: string
    status: ComponentStatus
    description?: string
}

export type Incident = {
    id: string
    title: string
    message: string
    severity: 'MINOR' | 'MAJOR' | 'CRITICAL' | 'INFO'
    status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED'
    createdAt: string
    updatedAt: string
}

// Global store to persist across HMR (Hot Module Replacement) during development
const globalForStatus = globalThis as unknown as {
    statusStore: {
        components: SystemComponent[]
        incidents: Incident[]
    }
}

const defaultComponents: SystemComponent[] = [
    { id: 'api', name: 'API Gateway', status: 'OPERATIONAL' },
    { id: 'db', name: 'Database', status: 'OPERATIONAL' },
    { id: 'payments', name: 'Payments Integration', status: 'OPERATIONAL' },
    { id: 'email', name: 'Email Notifications', status: 'OPERATIONAL' },
    { id: 'inventory', name: 'Inventory Sync', status: 'OPERATIONAL' },
]

export const statusStore = globalForStatus.statusStore || {
    components: [...defaultComponents],
    incidents: []
}

if (process.env.NODE_ENV !== 'production') globalForStatus.statusStore = statusStore

// Helper methods to interact with the store
export const STATUS_STORE = {
    getComponents: () => [...statusStore.components],
    getIncidents: () => [...statusStore.incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), // Newest first

    updateComponent: (id: string, status: ComponentStatus) => {
        const component = statusStore.components.find(c => c.id === id)
        if (component) {
            component.status = status
        }
    },

    addIncident: (incident: Incident) => {
        statusStore.incidents.unshift(incident)
    },

    resolveIncident: (id: string) => {
        const incident = statusStore.incidents.find(i => i.id === id)
        if (incident) {
            incident.status = 'RESOLVED'
            incident.updatedAt = new Date().toISOString()
        }
    }
}
