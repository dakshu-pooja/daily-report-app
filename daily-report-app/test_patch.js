const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const id = "cmlyqpdra0005bncey62j1f94" // ALAGUVEL ID
    const newDOB = "22/06/2008"

    console.log(`Attempting to update ${id} with DOB="${newDOB}"...`)

    const updated = await prisma.user.update({
        where: { id },
        data: { dateOfBirth: newDOB },
        select: { id: true, name: true, dateOfBirth: true }
    })

    console.log('Result:', JSON.stringify(updated, null, 2))
    await prisma.$disconnect()
}

main()
