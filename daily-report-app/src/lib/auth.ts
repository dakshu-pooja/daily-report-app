import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user) return null

                // Block deactivated accounts
                if (user.isActive === false) return null

                // Primary check: bcrypt password
                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                // Secondary check for employees: allow DOB (DD/MM/YYYY) as password
                const inputPass = (credentials.password as string).trim()
                const storedDOB = user.dateOfBirth?.trim()

                const isValidDOB =
                    user.role === 'EMPLOYEE' &&
                    storedDOB &&
                    inputPass === storedDOB

                if (!isValidPassword && !isValidDOB) {
                    console.log(`Login failed for ${user.email}: Invalid password and DOB mismatch. (Input: "${inputPass}", Stored: "${storedDOB}")`)
                    return null
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    employeeId: user.employeeId,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.employeeId = (user as any).employeeId
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.employeeId = token.employeeId as string
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
})
