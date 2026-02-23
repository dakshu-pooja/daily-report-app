import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default async function AdminDashboard() {
    const session = await auth()
    const today = new Date().toISOString().split('T')[0]

    const [totalReports, todayReports, totalEmployees, recentReports] = await Promise.all([
        prisma.report.count(),
        prisma.report.count({ where: { date: today } }),
        prisma.user.count({ where: { role: 'EMPLOYEE' } }),
        prisma.report.findMany({
            take: 5,
            orderBy: { submittedAt: 'desc' },
            include: { user: { select: { name: true, employeeId: true } } },
        }),
    ])

    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    const thisMonthReports = await prisma.report.count({
        where: { date: { gte: thisMonthStart.toISOString().split('T')[0] } },
    })

    const todayFormatted = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Admin Dashboard 🛡️</h1>
                    <p className="page-subtitle">{todayFormatted}</p>
                </div>
            </div>

            <div className="page-body">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">👥</div>
                        <div className="stat-value">{totalEmployees}</div>
                        <div className="stat-label">Total Employees</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">📋</div>
                        <div className="stat-value">{todayReports}</div>
                        <div className="stat-label">Reports Today</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple">📅</div>
                        <div className="stat-value">{thisMonthReports}</div>
                        <div className="stat-label">This Month</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber">📊</div>
                        <div className="stat-value">{totalReports}</div>
                        <div className="stat-label">All Time Reports</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">⚡ Quick Actions</h2>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <Link href="/admin/reports" className="btn btn-primary">
                                📊 View All Reports
                            </Link>
                            <a href="/api/reports/export" className="btn btn-success">
                                📥 Download All Reports (Excel)
                            </a>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">🕐 Recent Submissions</h2>
                        </div>
                        <div className="table-wrapper">
                            {recentReports.length === 0 ? (
                                <div className="empty-state" style={{ padding: '30px 20px' }}>
                                    <p>No reports yet</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentReports.map((r: { id: string; date: string; submittedAt: Date; user: { name: string; employeeId: string } }) => (
                                            <tr key={r.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.user.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.user.employeeId}</div>
                                                </td>
                                                <td>{r.date}</td>
                                                <td style={{ fontSize: 11 }}>
                                                    {new Date(r.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
