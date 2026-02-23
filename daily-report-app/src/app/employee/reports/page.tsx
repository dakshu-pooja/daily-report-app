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

export default function EmployeeReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [filterDate, setFilterDate] = useState('')
    const [filterFrom, setFilterFrom] = useState('')
    const [filterTo, setFilterTo] = useState('')
    const [loading, setLoading] = useState(true)
    const [editReport, setEditReport] = useState<Report | null>(null)
    const [editForm, setEditForm] = useState({ morningReport: '', afternoonReport: '', dailySummary: '', remarks: '' })
    const [editLoading, setEditLoading] = useState(false)
    const [editSuccess, setEditSuccess] = useState('')

    useEffect(() => { fetchReports() }, [])

    async function fetchReports() {
        if (filterFrom && filterTo && filterFrom > filterTo) {
            alert('Hint: Your "From Date" should be before your "To Date".')
            return
        }
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filterDate) params.set('date', filterDate)
            if (filterFrom) params.set('from', filterFrom)
            if (filterTo) params.set('to', filterTo)
            const res = await fetch(`/api/reports?${params}`)
            const data = await res.json()
            setReports(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    function openEdit(r: Report) {
        setEditReport(r)
        setEditForm({
            morningReport: r.morningReport || '',
            afternoonReport: r.afternoonReport || '',
            dailySummary: r.dailySummary || '',
            remarks: r.remarks || '',
        })
        setEditSuccess('')
    }

    async function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!editReport) return
        setEditLoading(true)
        try {
            const res = await fetch(`/api/reports/${editReport.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            })
            if (!res.ok) throw new Error('Failed to update')
            setEditSuccess('✅ Report updated!')
            await fetchReports()
            setTimeout(() => { setEditReport(null); setEditSuccess('') }, 1500)
        } catch {
            setEditSuccess('❌ Update failed')
        } finally {
            setEditLoading(false)
        }
    }

    function getStatus(r: Report) {
        const filled = [r.morningReport, r.afternoonReport, r.dailySummary].filter(Boolean).length
        if (filled === 3) return { label: 'Complete', cls: 'badge-complete' }
        if (filled > 0) return { label: 'Partial', cls: 'badge-partial' }
        return { label: 'Empty', cls: '' }
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">📋 My Reports</h1>
                <p className="page-subtitle">View and manage your daily reports</p>
            </div>
            <div className="page-body">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Report History</h2>
                        <div className="filter-row" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: 10 }}>Filter by Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={filterDate}
                                        onChange={e => {
                                            setFilterDate(e.target.value)
                                            setFilterFrom('')
                                            setFilterTo('')
                                        }}
                                        style={{ width: 140, padding: '4px 8px', fontSize: 13 }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: 10 }}>From Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={filterFrom}
                                        onChange={e => {
                                            setFilterFrom(e.target.value)
                                            setFilterDate('')
                                        }}
                                        style={{ width: 140, padding: '4px 8px', fontSize: 13 }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: 10 }}>To Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={filterTo}
                                        onChange={e => {
                                            setFilterTo(e.target.value)
                                            setFilterDate('')
                                        }}
                                        style={{ width: 140, padding: '4px 8px', fontSize: 13 }}
                                    />
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={fetchReports} style={{ height: 32, padding: '0 12px' }}>
                                    🔍 Apply
                                </button>
                                {(filterFrom || filterTo || filterDate) && (
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setFilterFrom(''); setFilterTo(''); setFilterDate(''); setTimeout(fetchReports, 0) }} style={{ height: 32, padding: '0 12px' }}>
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="desktop-only" style={{ opacity: 0.5, marginBottom: 5 }}>
                                <Logo size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        {loading ? (
                            <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
                        ) : reports.length === 0 ? (
                            <div className="empty-state">
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                                <p>No reports found. Submit your first report from the dashboard.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Morning Report</th>
                                        <th>Afternoon Report</th>
                                        <th>Daily Summary</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(report => {
                                        const status = getStatus(report)
                                        const isToday = report.date === new Date().toISOString().split('T')[0]
                                        return (
                                            <tr key={report.id}>
                                                <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                                                    {report.date}
                                                    {isToday && <span className="badge badge-morning" style={{ marginLeft: 6, fontSize: 10 }}>Today</span>}
                                                </td>
                                                <td><div className="report-text">{report.morningReport || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div></td>
                                                <td><div className="report-text">{report.afternoonReport || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div></td>
                                                <td><div className="report-text">{report.dailySummary || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div></td>
                                                <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                                                <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                                                    {new Date(report.submittedAt).toLocaleString('en-IN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td>
                                                    {isToday ? (
                                                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(report)}>✏️ Edit</button>
                                                    ) : (
                                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>🔒 Locked</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editReport && (
                <div className="modal-overlay" onClick={() => setEditReport(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Report — {editReport.date}</h3>
                            <button className="modal-close" onClick={() => setEditReport(null)}>×</button>
                        </div>
                        {editSuccess && <div className="alert alert-success">{editSuccess}</div>}
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Morning Report</label>
                                <textarea className="form-textarea" value={editForm.morningReport}
                                    onChange={e => setEditForm(p => ({ ...p, morningReport: e.target.value }))} rows={3} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Afternoon Report</label>
                                <textarea className="form-textarea" value={editForm.afternoonReport}
                                    onChange={e => setEditForm(p => ({ ...p, afternoonReport: e.target.value }))} rows={3} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Daily Summary</label>
                                <textarea className="form-textarea" value={editForm.dailySummary}
                                    onChange={e => setEditForm(p => ({ ...p, dailySummary: e.target.value }))} rows={3} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Remarks</label>
                                <textarea className="form-textarea" value={editForm.remarks}
                                    onChange={e => setEditForm(p => ({ ...p, remarks: e.target.value }))} rows={2} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                                    {editLoading ? <><span className="spinner" /> Saving...</> : '💾 Save Changes'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditReport(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
