const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- Renumbering IDs ---')

    // 1. Change Admin to a temporary ID to free up EMP001
    const admin = await prisma.user.findUnique({ where: { employeeId: 'EMP001' } })
    if (admin && admin.role === 'ADMIN') {
        await prisma.user.update({
            where: { employeeId: 'EMP001' },
            data: { employeeId: 'ADM001' }
        })
        console.log('Changed Admin to ADM001')
    }

    // 2. Map of current IDs to new IDs
    const shifts = [
        { from: 'EMP002', to: 'EMP001' },
        { from: 'EMP003', to: 'EMP002' },
        { from: 'EMP004', to: 'EMP003' },
        { from: 'EMP005', to: 'EMP004' },
        { from: 'EMP006', to: 'EMP005' },
    ]

    for (const s of shifts) {
        const user = await prisma.user.findUnique({ where: { employeeId: s.from } })
        if (user) {
            await prisma.user.update({
                where: { employeeId: s.from },
                data: { employeeId: s.to }
            })
            console.log(`Shifted ${user.name}: ${s.from} -> ${s.to}`)
        }
    }

    console.log('--- Done ---')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
