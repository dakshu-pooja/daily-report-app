import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { email } })

        // Always return a generic not-found to prevent email enumeration
        if (!user || user.role === 'ADMIN') {
            return NextResponse.json({
                success: false,
                message: 'No employee account found with this email. Please contact your admin.',
            })
        }

        if (user.dateOfBirth) {
            return NextResponse.json({
                success: true,
                message: `Your password hint: You can log in using your Date of Birth in DD/MM/YYYY format. Please contact admin if you need further help.`,
                hint: `Your registered Date of Birth is: ${user.dateOfBirth}`,
            })
        } else {
            return NextResponse.json({
                success: true,
                message: 'No date of birth is set for your account. Please contact your administrator to reset your password.',
            })
        }
    } catch {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}
