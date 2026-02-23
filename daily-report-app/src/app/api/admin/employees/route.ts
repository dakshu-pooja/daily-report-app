import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET — list all employees
export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const employees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        select: { id: true, name: true, employeeId: true, email: true, dateOfBirth: true, isActive: true, createdAt: true },
        orderBy: { employeeId: 'asc' },
    })
    return NextResponse.json(employees)
}

// POST — create new employee
export async function POST(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { name, email, password, dateOfBirth } = await req.json()
    if (!name || !email || !password) {
        return NextResponse.json({ error: 'Name, Email, and Password are required.' }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({ where: { email } })
    if (existing) {
        return NextResponse.json({ error: 'An employee with this email already exists.' }, { status: 400 })
    }

    // Auto-generate Employee ID: count only employees and pick next number
    const count = await prisma.user.count({ where: { role: 'EMPLOYEE' } })
    let employeeId = `EMP${String(count + 1).padStart(3, '0')}`
    // Make sure it's unique (retry if collision)
    while (await prisma.user.findUnique({ where: { employeeId } })) {
        const num = parseInt(employeeId.replace('EMP', '')) + 1
        employeeId = `EMP${String(num).padStart(3, '0')}`
    }

    const hashed = await bcrypt.hash(password, 12)
    const employee = await prisma.user.create({
        data: { name, employeeId, email, password: hashed, dateOfBirth: dateOfBirth || null, role: 'EMPLOYEE' }
    })
    return NextResponse.json({ id: employee.id, name: employee.name, email: employee.email, employeeId: employee.employeeId })
}
