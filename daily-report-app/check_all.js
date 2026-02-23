const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        select: { name: true, dateOfBirth: true, employeeId: true, id: true }
    })
    console.log('Employees:', JSON.stringify(users, null, 2))
    await prisma.$disconnect()
}

main()
