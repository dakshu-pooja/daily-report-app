const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Clear existing data (reports first due to FK, then employees)
    await prisma.report.deleteMany({})
    await prisma.user.deleteMany({ where: { role: 'EMPLOYEE' } })
    console.log('Cleaned up existing reports and employees.')

    const adminPass = await bcrypt.hash('admin123', 12)
    const empPass = await bcrypt.hash('emp123', 12)

    // Admin
    await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: { password: adminPass },
        create: { name: 'Admin User', employeeId: 'ADM001', email: 'admin@company.com', password: adminPass, role: 'ADMIN' }
    })
    console.log('Admin verified: admin@company.com / admin123')

    console.log('Seed complete! (Admin only)')
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

