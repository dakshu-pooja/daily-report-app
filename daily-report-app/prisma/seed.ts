import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12)
    const empPassword = await bcrypt.hash('emp123', 12)

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            name: 'Admin User',
            employeeId: 'ADM001',
            email: 'admin@company.com',
            password: adminPassword,
            role: 'ADMIN',
        },
    })

    // Create Employees
    const emp1 = await prisma.user.upsert({
        where: { email: 'john@company.com' },
        update: {},
        create: {
            name: 'John Smith',
            employeeId: 'EMP001',
            email: 'john@company.com',
            password: empPassword,
            role: 'EMPLOYEE',
        },
    })

    const emp2 = await prisma.user.upsert({
        where: { email: 'sarah@company.com' },
        update: {},
        create: {
            name: 'Sarah Johnson',
            employeeId: 'EMP002',
            email: 'sarah@company.com',
            password: empPassword,
            role: 'EMPLOYEE',
        },
    })

    const emp3 = await prisma.user.upsert({
        where: { email: 'mike@company.com' },
        update: {},
        create: {
            name: 'Mike Davis',
            employeeId: 'EMP003',
            email: 'mike@company.com',
            password: empPassword,
            role: 'EMPLOYEE',
        },
    })

    // Create sample reports
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    await prisma.report.upsert({
        where: { userId_date: { userId: emp1.id, date: today } },
        update: {},
        create: {
            userId: emp1.id,
            date: today,
            morningReport: 'Completed code review for feature #234. Attended standup meeting. Fixed 3 bugs in the login module.',
            afternoonReport: 'Worked on API integration for payment gateway. Wrote unit tests for user service.',
            dailySummary: 'Productive day. All planned tasks completed. Ready for tomorrow\'s sprint planning.',
            remarks: 'Need clarification on payment gateway docs',
        },
    })

    await prisma.report.upsert({
        where: { userId_date: { userId: emp2.id, date: today } },
        update: {},
        create: {
            userId: emp2.id,
            date: today,
            morningReport: 'Designed new dashboard UI mockups. Reviewed client feedback on previous designs.',
            afternoonReport: 'Implemented responsive layout for mobile dashboard. Fixed CSS issues in header component.',
            dailySummary: 'Completed all UI design tasks. Mockups approved by client.',
            remarks: '',
        },
    })

    await prisma.report.upsert({
        where: { userId_date: { userId: emp1.id, date: yesterday } },
        update: {},
        create: {
            userId: emp1.id,
            date: yesterday,
            morningReport: 'Sprint planning meeting. Assigned tasks for the week.',
            afternoonReport: 'Setup development environment for new service. Documented API endpoints.',
            dailySummary: 'Good day overall. Sprint started successfully.',
            remarks: '',
        },
    })

    console.log('✅ Seed complete!')
    console.log('📋 Credentials:')
    console.log('   Admin: admin@company.com / admin123')
    console.log('   Employee: john@company.com / emp123')
    console.log('   Employee: sarah@company.com / emp123')
    console.log('   Employee: mike@company.com / emp123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
