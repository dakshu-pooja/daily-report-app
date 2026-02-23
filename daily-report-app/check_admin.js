const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@company.com' }
    })
    console.log('Admin Record:', JSON.stringify(admin, null, 2))
    await prisma.$disconnect()
}

main()
