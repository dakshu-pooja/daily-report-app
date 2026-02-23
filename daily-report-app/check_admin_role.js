const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@company.com' }
    })
    console.log('Admin Email:', admin.email)
    console.log('Admin Role:', admin.role)
    console.log('Admin isActive:', admin.isActive)
    await prisma.$disconnect()
}

main().catch(console.error)
