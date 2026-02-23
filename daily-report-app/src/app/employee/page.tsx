'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Logo from '@/components/Logo'

interface Report {
    id: string
    date: string
    morningReport: string | null
    afternoonReport: string | null
    dailySummary: string | null
    remarks: string | null
    submittedAt: string
}

export default function EmployeeDashboard() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState<'morning' | 'afternoon' | 'daily'>('morning')
    const [formData, setFormData] = useState({
        morningReport: '',
        afternoonReport: '',
        dailySummary: '',
        remarks: '',
    })
    const [todayReport, setTodayReport] = useState<Report | null>(null)
    const [allReports, setAllReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const today = new Date().toISOString().split('T')[0]
    const todayFormatted = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    useEffect(() => {
        fetchReports()
    }, [])

    async function fetchReports() {
        try {
            const res = await fetch('/api/reports')
            const data = await res.json()
            setAllReports(data)
            const todays = data.find((r: Report) => r.date === today)
            if (todays) {
                setTodayReport(todays)
                setFormData({
                    morningReport: todays.morningReport || '',
                    afternoonReport: todays.afternoonReport || '',
                    dailySummary: todays.dailySummary || '',
                    remarks: todays.remarks || '',
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: today, ...formData }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Submission failed')
            }

            setSuccess('✅ Report saved successfully!')
            await fetchReports()
            setTimeout(() => setSuccess(''), 4000)
        } catch (e: any) {
            setError(e.message || 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    const totalThisMonth = allReports.filter(r => {
        const d = new Date(r.date)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Welcome, {session?.user?.name?.split(' ')[0]} 👋</h1>
                    <p className="page-subtitle">{todayFormatted}</p>
                </div>
            </div>

            <div className="page-body">
                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">📋</div>
                        <div className="stat-value">{allReports.length}</div>
                        <div className="stat-label">Total Reports</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">📅</div>
                        <div className="stat-value">{totalThisMonth}</div>
                        <div className="stat-label">This Month</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple">🏷️</div>
                        <div className="stat-value">{session?.user?.employeeId || '-'}</div>
                        <div className="stat-label">Employee ID</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber">✅</div>
                        <div className="stat-value">{todayReport ? 'Done' : 'Pending'}</div>
                        <div className="stat-label">Today's Status</div>
                    </div>
                </div>

                {/* Report Form */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">
                            📝 Today's Report
                            {todayReport && <span className="badge badge-complete" style={{ marginLeft: 10 }}>Submitted</span>}
                        </h2>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{today}</span>
                    </div>
                    <div className="card-body">
                        {success && <div className="alert alert-success">{success}</div>}
                        {error && <div className="alert alert-error">{error}</div>}

                        {/* Tabs */}
                        <div className="tab-list">
                            <button
                                className={`tab-btn ${activeTab === 'morning' ? 'active' : ''}`}
                                onClick={() => setActiveTab('morning')}
                            >🌅 Morning</button>
                            <button
                                className={`tab-btn ${activeTab === 'afternoon' ? 'active' : ''}`}
                                onClick={() => setActiveTab('afternoon')}
                            >☀️ Afternoon</button>
                            <button
                                className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
                                onClick={() => setActiveTab('daily')}
                            >📊 Daily Summary</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {activeTab === 'morning' && (
                                <div className="form-group">
                                    <label className="form-label">Morning Report</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Describe your morning activities, meetings, tasks completed..."
                                        value={formData.morningReport}
                                        onChange={e => setFormData(prev => ({ ...prev, morningReport: e.target.value }))}
                                        rows={6}
                                    />
                                </div>
                            )}
                            {activeTab === 'afternoon' && (
                                <div className="form-group">
                                    <label className="form-label">Afternoon Report</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Describe your afternoon activities, tasks in progress, completed work..."
                                        value={formData.afternoonReport}
                                        onChange={e => setFormData(prev => ({ ...prev, afternoonReport: e.target.value }))}
                                        rows={6}
                                    />
                                </div>
                            )}
                            {activeTab === 'daily' && (
                                <div className="form-group">
                                    <label className="form-label">Daily Summary</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Overall summary of the day, key achievements, blockers..."
                                        value={formData.dailySummary}
                                        onChange={e => setFormData(prev => ({ ...prev, dailySummary: e.target.value }))}
                                        rows={6}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Remarks / Comments (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Any additional remarks, requests, or notes..."
                                    value={formData.remarks}
                                    onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <><span className="spinner" /> Saving...</> : (todayReport ? '💾 Update Report' : '📤 Submit Report')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
