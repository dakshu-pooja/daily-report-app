const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'pooja@company.com' }
    })
    console.log('POOJA Record:', JSON.stringify(user, null, 2))
    await prisma.$disconnect()
}

main()
