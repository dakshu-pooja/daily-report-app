import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import BrandedHeader from '@/components/BrandedHeader'

const navItems = [
    { href: '/employee', icon: '🏠', label: 'Dashboard' },
    { href: '/employee/reports', icon: '📋', label: 'My Reports' },
]

export default async function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect('/login')
    if (session.user.role !== 'EMPLOYEE') redirect('/admin')

    return (
        <div className="app-layout">
            <Sidebar navItems={navItems} role="EMPLOYEE" />
            <BrandedHeader />
            <main className="main-content">{children}</main>
        </div>
    )
}

