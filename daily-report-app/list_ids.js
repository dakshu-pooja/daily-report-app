const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, employeeId: true },
        orderBy: { createdAt: 'asc' }
    })
    console.log('--- Current Users and IDs ---')
    users.forEach(u => console.log(`${u.role}: ${u.employeeId} - ${u.name} (${u.email})`))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
