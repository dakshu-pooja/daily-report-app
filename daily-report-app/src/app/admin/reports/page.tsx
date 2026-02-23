'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

interface Report {
    id: string
    date: string
    morningReport: string | null
    afternoonReport: string | null
    dailySummary: string | null
    remarks: string | null
    submittedAt: string
    user: { name: string; employeeId: string; email: string }
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [filterEmployee, setFilterEmployee] = useState('')
    const [filterDate, setFilterDate] = useState('')
    const [exportFrom, setExportFrom] = useState('')
    const [exportTo, setExportTo] = useState('')
    const [viewReport, setViewReport] = useState<Report | null>(null)
    const [exporting, setExporting] = useState(false)

    useEffect(() => { fetchReports() }, [])

    async function fetchReports() {
        if (exportFrom && exportTo && exportFrom > exportTo) {
            alert('Wait! "From Date" should be earlier than or equal to "To Date".')
            return
        }
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filterEmployee) params.set('employee', filterEmployee)
            if (filterDate) params.set('date', filterDate)
            if (exportFrom) params.set('from', exportFrom)
            if (exportTo) params.set('to', exportTo)
            const res = await fetch(`/api/reports?${params}`)
            const data = await res.json()
            setReports(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function downloadExcel() {
        setExporting(true)
        try {
            const params = new URLSearchParams()
            if (filterEmployee) params.set('employee', filterEmployee)
            if (exportFrom) params.set('from', exportFrom)
            if (exportTo) params.set('to', exportTo)

            const res = await fetch(`/api/reports/export?${params}`)
            if (!res.ok) throw new Error('Export failed')

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `reports-${new Date().toISOString().split('T')[0]}.xlsx`
            a.click()
            URL.revokeObjectURL(url)
        } catch (e) {
            alert('Export failed. Please try again.')
        } finally {
            setExporting(false)
        }
    }

    function getStatus(r: Report) {
        const ct = [r.morningReport, r.afternoonReport, r.dailySummary].filter(Boolean).length
        if (ct === 3) return { label: 'Complete', cls: 'badge-complete' }
        if (ct > 0) return { label: 'Partial', cls: 'badge-partial' }
        return { label: 'Empty', cls: '' }
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">📊 All Reports</h1>
                <p className="page-subtitle">View, filter, and export all employee reports</p>
            </div>

            <div className="page-body">
                {/* Filters Card */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header">
                        <h2 className="card-title">🔍 Filters & Export</h2>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Employee Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by name..."
                                    value={filterEmployee}
                                    onChange={e => setFilterEmployee(e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Filter by Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={filterDate}
                                    onChange={e => {
                                        setFilterDate(e.target.value)
                                        setExportFrom('')
                                        setExportTo('')
                                    }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Export From Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={exportFrom}
                                    onChange={e => {
                                        setExportFrom(e.target.value)
                                        setFilterDate('')
                                    }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Export To Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={exportTo}
                                    onChange={e => {
                                        setExportTo(e.target.value)
                                        setFilterDate('')
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button className="btn btn-primary" onClick={fetchReports}>
                                    🔍 Apply Filters
                                </button>
                                <button className="btn btn-secondary" onClick={() => {
                                    setFilterEmployee(''); setFilterDate(''); setExportFrom(''); setExportTo(''); setTimeout(fetchReports, 0)
                                }}>
                                    Clear Filters
                                </button>
                            </div>
                            <div className="desktop-only" style={{ opacity: 0.5, marginRight: 5 }}>
                                <Logo size={20} />
                            </div>
                            <button
                                className="btn btn-success"
                                onClick={downloadExcel}
                                disabled={exporting}
                                style={{ marginLeft: 'auto' }}
                            >
                                {exporting ? <><span className="spinner" /> Exporting...</> : '📥 Download Excel'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">
                            Reports
                            <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
                                ({reports.length} records)
                            </span>
                        </h2>
                    </div>
                    <div className="table-wrapper">
                        {loading ? (
                            <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
                        ) : reports.length === 0 ? (
                            <div className="empty-state">
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                                <p>No reports found matching the current filters.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Employee</th>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Morning</th>
                                        <th>Afternoon</th>
                                        <th>Summary</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report, i) => {
                                        const status = getStatus(report)
                                        return (
                                            <tr key={report.id}>
                                                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{report.user.name}</td>
                                                <td>
                                                    <span className="badge badge-employee">{report.user.employeeId}</span>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{report.date}</td>
                                                <td><div className="report-text">{report.morningReport || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div></td>
                                                <td><div className="report-text">{report.afternoonReport || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div></td>
                                                <td><div className="report-text">{report.dailySummary || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div></td>
                                                <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                                                <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                                                    {new Date(report.submittedAt).toLocaleString('en-IN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setViewReport(report)}>
                                                        👁 View
                                                    </button>
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

            {/* View Report Modal */}
            {viewReport && (
                <div className="modal-overlay" onClick={() => setViewReport(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">📋 {viewReport.user.name}'s Report</h3>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {viewReport.user.employeeId} · {viewReport.date}
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setViewReport(null)}>×</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: '🌅 Morning Report', value: viewReport.morningReport },
                                { label: '☀️ Afternoon Report', value: viewReport.afternoonReport },
                                { label: '📊 Daily Summary', value: viewReport.dailySummary },
                                { label: '💬 Remarks', value: viewReport.remarks },
                            ].map(({ label, value }) => value ? (
                                <div key={label}>
                                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        padding: 14,
                                        fontSize: 14,
                                        lineHeight: 1.7,
                                        color: 'var(--text-secondary)',
                                        whiteSpace: 'pre-wrap',
                                    }}>{value}</div>
                                </div>
                            ) : null)}
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                Submitted: {new Date(viewReport.submittedAt).toLocaleString('en-IN', {
                                    weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
