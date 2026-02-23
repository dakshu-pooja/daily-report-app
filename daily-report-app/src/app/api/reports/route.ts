import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const employee = searchParams.get('employee')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const date = searchParams.get('date')

    const where: any = {}

    // Role-based filtering
    if (session.user.role === 'EMPLOYEE') {
        where.userId = session.user.id
    } else if (session.user.role === 'ADMIN') {
        if (employee) {
            where.user = { name: { contains: employee } }
        }
    }

    if (date) {
        where.date = date
    } else if (from || to) {
        where.date = {}
        if (from) where.date.gte = from
        if (to) where.date.lte = to
    }

    try {
        const reports = await prisma.report.findMany({
            where,
            include: {
                user: {
                    select: { name: true, employeeId: true, email: true },
                },
            },
            orderBy: { submittedAt: 'desc' },
        })

        return NextResponse.json(reports)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { date, morningReport, afternoonReport, dailySummary, remarks } = body

        const today = new Date().toISOString().split('T')[0]

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 })
        }

        // Employees can only submit/update reports for today
        if (session.user.role === 'EMPLOYEE' && date !== today) {
            return NextResponse.json(
                { error: 'You can only submit reports for today.' },
                { status: 403 }
            )
        }

        if (!morningReport && !afternoonReport && !dailySummary) {
            return NextResponse.json(
                { error: 'At least one report field is required' },
                { status: 400 }
            )
        }

        const report = await prisma.report.upsert({
            where: { userId_date: { userId: session.user.id, date } },
            update: {
                morningReport: morningReport || undefined,
                afternoonReport: afternoonReport || undefined,
                dailySummary: dailySummary || undefined,
                remarks: remarks || undefined,
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                date,
                morningReport,
                afternoonReport,
                dailySummary,
                remarks,
            },
            include: {
                user: { select: { name: true, employeeId: true } },
            },
        })

        return NextResponse.json(report, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
