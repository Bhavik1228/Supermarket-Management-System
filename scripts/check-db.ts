
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Checking Database State ---')

  const stores = await prisma.store.findMany()
  console.log(`Stores found: ${stores.length}`)
  stores.forEach(s => console.log(` - Store: ${s.id} (${s.name})`))

  const programs = await prisma.loyaltyProgram.findMany()
  console.log(`Loyalty Programs found: ${programs.length}`)
  programs.forEach(p => console.log(` - Program: ${p.id} (Store: ${p.storeId})`))

  const tiers = await prisma.loyaltyTier.findMany()
  console.log(`Loyalty Tiers found: ${tiers.length}`)
  tiers.forEach(t => console.log(` - Tier: ${t.id} (${t.name}) (Program: ${t.programId})`))

  if (tiers.length === 0) console.log('WARNING: No Loaylty Tiers found!')

  const specificUser = await prisma.user.findFirst({
    where: { email: 'Infobebooks365.com@gmail.com' } // Check case sensitive or exact matches
  })
  console.log("Specific User Search:", specificUser ? "FOUND" : "NOT FOUND")

  const anyUser = await prisma.user.findFirst({
    where: { email: { contains: 'infobebooks' } }
  })
  console.log("Any similar user:", anyUser ? anyUser.email : "NONE")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
