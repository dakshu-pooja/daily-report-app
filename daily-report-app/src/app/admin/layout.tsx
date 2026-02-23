import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import BrandedHeader from '@/components/BrandedHeader'

const navItems = [
    { href: '/admin', icon: '🏠', label: 'Dashboard' },
    { href: '/admin/reports', icon: '📊', label: 'All Reports' },
    { href: '/admin/employees', icon: '👥', label: 'Employees' },
]

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect('/login')
    if (session.user.role !== 'ADMIN') redirect('/employee')

    return (
        <div className="app-layout">
            <Sidebar navItems={navItems} role="ADMIN" />
            <BrandedHeader />
            <main className="main-content">{children}</main>
        </div>
    )
}

