import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create System Owner (Admin) User
    const systemOwner = await prisma.user.upsert({
        where: { email: 'admin@marketpulse.com' },
        update: {},
        create: {
            email: 'admin@marketpulse.com',
            name: 'System Admin',
            password: 'admin123', // In production, this should be hashed!
            role: 'SYSTEM_OWNER',
        },
    })

    console.log('✅ Created System Owner:', systemOwner.email)

    // Create a sample Store Owner for testing
    const storeOwner = await prisma.user.upsert({
        where: { email: 'john@freshmart.com' },
        update: {},
        create: {
            email: 'john@freshmart.com',
            name: 'John Doe',
            password: 'store123', // In production, this should be hashed!
            role: 'STORE_OWNER',
        },
    })

    console.log('✅ Created Store Owner:', storeOwner.email)

    // Create a sample Store
    const store = await prisma.store.upsert({
        where: { id: 'store-freshmart' },
        update: {},
        create: {
            id: 'store-freshmart',
            name: 'Fresh Mart Supermarket',
            storeType: 'SUPERMARKET',
            status: 'APPROVED',
            ownerId: storeOwner.id,
        },
    })

    console.log('✅ Created Store:', store.name)

    // Create sample products
    const products = [
        { name: 'Organic Apples', price: 4.99, stock: 100 },
        { name: 'Whole Milk 1L', price: 2.49, stock: 50 },
        { name: 'Bread Loaf', price: 3.29, stock: 30 },
    ]

    for (const product of products) {
        await prisma.product.create({
            data: {
                ...product,
                storeId: store.id,
            },
        })
    }

    console.log('✅ Created sample products')

    // Create a sample ticket
    await prisma.ticket.upsert({
        where: { id: 'ticket-001' },
        update: {},
        create: {
            id: 'ticket-001',
            subject: 'Cannot add products to my store',
            status: 'OPEN',
            priority: 'HIGH',
            userId: storeOwner.id,
            storeId: store.id,
        },
    })

    console.log('✅ Created sample ticket')

    // Create audit log entry
    await prisma.auditLog.create({
        data: {
            action: 'SYSTEM_SEEDED',
            entity: 'System',
            details: 'Database seeded with initial data',
            userEmail: 'system',
        },
    })

    console.log('✅ Created audit log entry')
    console.log('')
    console.log('🎉 Seeding complete!')
    console.log('')
    console.log('📋 Test Accounts:')
    console.log('   System Owner: admin@marketpulse.com / admin123')
    console.log('   Store Owner:  john@freshmart.com / store123')
    // Create Loyalty Program for the store
    const loyaltyProgram = await prisma.loyaltyProgram.upsert({
        where: { id: 'loyalty-freshmart' },
        update: {},
        create: {
            id: 'loyalty-freshmart',
            name: 'Fresh Rewards',
            description: 'Earn points on every purchase!',
            storeId: store.id,
            status: 'ACTIVE',
        },
    })

    console.log('✅ Created Loyalty Program:', loyaltyProgram.name)

    // Create Loyalty Tiers
    const tiers = [
        { name: 'Bronze', minPoints: 0, multiplier: 1.0, programId: loyaltyProgram.id },
        { name: 'Silver', minPoints: 1000, multiplier: 1.2, programId: loyaltyProgram.id },
        { name: 'Gold', minPoints: 5000, multiplier: 1.5, programId: loyaltyProgram.id },
    ]

    for (const tier of tiers) {
        await prisma.loyaltyTier.create({
            data: tier
        })
    }

    console.log('✅ Created Loyalty Tiers')

    // Create Earning Rule (1 point per $1 spent)
    await prisma.loyaltyRule.create({
        data: {
            programId: loyaltyProgram.id,
            type: 'SPEND',
            multiplier: 1.0, // 1 point per currency unit
            minSpend: 0,
        }
    })

    console.log('✅ Created Default Earning Rule')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
