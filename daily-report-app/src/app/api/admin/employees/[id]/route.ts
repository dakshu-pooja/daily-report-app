import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// DELETE — delete employee by id
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
}

// PATCH — update employee (DOB, password)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        console.log(`PATCH /api/admin/employees/${params.id} - REQUEST RECEIVED`)
        const session = await auth()
        console.log('PATCH Session (no-args):', JSON.stringify(session, null, 2))

        if (!session || session.user.role !== 'ADMIN') {
            const reqSession = await auth(req as any)
            console.log('PATCH Session (with-req):', JSON.stringify(reqSession, null, 2))

            if (!reqSession || (reqSession.user as any).role !== 'ADMIN') {
                console.log('PATCH Auth Check - FAILED')
                return NextResponse.json({
                    error: 'Unauthorized: Admin role required',
                    debug: {
                        noArgsSession: !!session,
                        withReqSession: !!reqSession,
                        role: session?.user?.role || (reqSession?.user as any)?.role
                    }
                }, { status: 401 })
            }
        }
        const body = await req.json()
        console.log(`PATCH /api/admin/employees/${params.id} received:`, body)
        const updateData: any = {}

        if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth || null
        if (body.password) updateData.password = await bcrypt.hash(body.password, 12)
        if (body.name !== undefined) updateData.name = body.name
        if (body.isActive !== undefined) updateData.isActive = body.isActive

        console.log('Final Update Data:', updateData)

        const updated = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: { id: true, name: true, email: true, dateOfBirth: true, isActive: true, employeeId: true },
        })
        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('PATCH /api/admin/employees ERROR:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
