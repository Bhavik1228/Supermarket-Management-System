'use server'

import { Incident } from "@/lib/status-store"

const TEMPLATES = {
    database: [
        {
            title: "Database Performance Degradation",
            message: "We are currently observing increased latency in our primary database cluster. This may result in slower page loads and transaction processing times. Our engineering team is investigating the root cause.",
            severity: 'MINOR'
        },
        {
            title: "Database Connection Timeouts",
            message: "Users may experience intermittent connection errors when accessing the platform. We are scaling the database replicas to handle the increased load.",
            severity: 'MAJOR'
        },
        {
            title: "Scheduled Database Maintenance",
            message: "We will be performing a brief database optimization shortly. Expect minor delays of up to 5 minutes.",
            severity: 'INFO'
        }
    ],
    payment: [
        {
            title: "Payment Gateway Intermittency",
            message: "We are experiencing intermittent failures with our payment processing provider. Some transactions may not complete successfully. We are working with the vendor to resolve this immediately.",
            severity: 'MAJOR'
        },
        {
            title: "Credit Card Processing Delayed",
            message: "Card transactions are currently taking longer than usual to verify. Please do not refresh the page during checkout.",
            severity: 'MINOR'
        }
    ],
    outage: [
        {
            title: "Major Service Outage",
            message: "We are investigating a critical system-wide outage affecting multiple services. Users may be unable to log in or access core features. This is our top priority.",
            severity: 'CRITICAL'
        },
        {
            title: "Login Service Unavailable",
            message: "The authentication service is currently down. Users who are already logged in should be unaffected, but new logins are failing.",
            severity: 'CRITICAL'
        }
    ],
    maintenance: [
        {
            title: "Routine System Maintenance",
            message: "We are performing scheduled maintenance to improve system stability. We expect normal service to resume shortly.",
            severity: 'INFO'
        },
        {
            title: "Feature Update Deployment",
            message: "We are rolling out a new update. You might notice new features appearing over the next hour.",
            severity: 'INFO'
        }
    ]
} as const

// Mock AI Generation - In a real app, this would call Gemini/OpenAI
export async function generateIncidentDraft(input: string) {
    await new Promise(resolve => setTimeout(resolve, 800)) // Simulate AI thinking

    // Simple heuristic to mock "intelligence"
    const lowerInput = input.trim().toLowerCase()

    let category: keyof typeof TEMPLATES = 'maintenance'

    if (!lowerInput) {
        // Randomly pick a category if input is empty
        const categories = Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>
        category = categories[Math.floor(Math.random() * categories.length)]
    } else if (lowerInput.includes('db') || lowerInput.includes('database') || lowerInput.includes('slow')) {
        category = 'database'
    } else if (lowerInput.includes('payment') || lowerInput.includes('fail')) {
        category = 'payment'
    } else if (lowerInput.includes('down') || lowerInput.includes('crash') || lowerInput.includes('outage')) {
        category = 'outage'
    }

    // Pick a random template from the category
    const options = TEMPLATES[category]
    const template = options[Math.floor(Math.random() * options.length)]

    // If input was provided but didn't match specific logic perfectly, maybe append it for flavor? 
    // Actually, sticking to the template is safer for "mock" quality.

    return {
        title: template.title,
        message: template.message,
        severity: template.severity
    }
}

export async function notifyUsersOnIncident(incident: Incident) {
    // In a real app, strict background job or queue (e.g., Inngest/BullMQ)
    // Here we simulate sending emails
    console.log(`[Mock Email] Starting mass notification for incident: ${incident.id}`)

    // Mock user roles
    const roles = ['SYSTEM_OWNER', 'STORE_MANAGER', 'STORE_STAFF']

    // Simulate sending different templates to different roles
    // We won't actually send 1000s of emails here to avoid spamming the dev console excessively,
    // but we'll log the "intent".

    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`[Mock Email] Sent 'Critical Alert' template to System Owners`)

    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`[Mock Email] Sent 'Operational Notice' template to Store Managers`)

    return { success: true, count: 142 } // Mock count
}
