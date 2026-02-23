import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const report = await prisma.report.findUnique({ where: { id: params.id } })
        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 })
        }

        // Employees can only edit their own reports
        if (session.user.role === 'EMPLOYEE' && report.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Employees can only edit today's report
        const today = new Date().toISOString().split('T')[0]
        if (session.user.role === 'EMPLOYEE' && report.date !== today) {
            return NextResponse.json(
                { error: 'Past reports are locked and cannot be edited.' },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { morningReport, afternoonReport, dailySummary, remarks } = body

        const updated = await prisma.report.update({
            where: { id: params.id },
            data: {
                morningReport,
                afternoonReport,
                dailySummary,
                remarks,
                updatedAt: new Date(),
            },
            include: {
                user: { select: { name: true, employeeId: true } },
            },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
