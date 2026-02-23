const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    await prisma.user.update({
        where: { email: 'pooja@company.com' },
        data: { dateOfBirth: '15/04/2001' }
    })
    console.log('Updated POOJA dateOfBirth to 15/04/2001')
    await prisma.$disconnect()
}

main()
