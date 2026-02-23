const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' }
    })
    for (const u of users) {
        console.log(`- ${u.name} (ID: ${u.employeeId}): DOB="${u.dateOfBirth}"`)
    }
    await prisma.$disconnect()
}

main()
