'use client'
import { useState, useEffect, useCallback } from 'react'

interface Employee {
    id: string
    name: string
    employeeId: string
    email: string
    dateOfBirth: string | null
    isActive: boolean
    createdAt: string
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0f4ff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: 6,
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [editEmployee, setEditEmployee] = useState<Employee | null>(null)
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    // Add form state
    const [form, setForm] = useState({ name: '', email: '', password: '', dateOfBirth: '' })
    const [saving, setSaving] = useState(false)

    // Edit form state
    const [editForm, setEditForm] = useState({ name: '', dateOfBirth: '', password: '' })
    const [editSaving, setEditSaving] = useState(false)

    const fetchEmployees = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/admin/employees', { cache: 'no-store' })
        const data = await res.json()
        setEmployees(data)
        setLoading(false)
    }, [])

    useEffect(() => { fetchEmployees() }, [fetchEmployees])

    function showAlert(type: 'success' | 'error', msg: string) {
        setAlert({ type, msg })
        setTimeout(() => setAlert(null), 4000)
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const res = await fetch('/api/admin/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        const data = await res.json()
        setSaving(false)
        if (!res.ok) {
            showAlert('error', data.error || 'Failed to create employee.')
        } else {
            showAlert('success', `Employee "${data.name}" created! Employee ID: ${data.employeeId}`)
            setForm({ name: '', email: '', password: '', dateOfBirth: '' })
            setShowAdd(false)
            fetchEmployees()
        }
    }

    async function handleDelete(emp: Employee) {
        if (!confirm(`Delete ${emp.name}? This will also delete all their reports.`)) return
        const res = await fetch(`/api/admin/employees/${emp.id}`, { method: 'DELETE' })
        if (res.ok) {
            showAlert('success', `${emp.name} deleted.`)
            fetchEmployees()
        } else {
            showAlert('error', 'Failed to delete employee.')
        }
    }

    async function handleToggleActive(emp: Employee) {
        const action = emp.isActive ? 'deactivate' : 'activate'
        if (!confirm(`${emp.isActive ? 'Deactivate' : 'Activate'} ${emp.name}? ${emp.isActive ? 'They will not be able to log in.' : 'They will be able to log in again.'}`)) return
        const res = await fetch(`/api/admin/employees/${emp.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !emp.isActive }),
        })
        if (res.ok) {
            showAlert('success', `${emp.name} ${action}d successfully.`)
            fetchEmployees()
        } else {
            showAlert('error', `Failed to ${action} employee.`)
        }
    }

    async function handleEdit(e: React.FormEvent) {
        e.preventDefault()
        if (!editEmployee) return
        setEditSaving(true)
        console.log('handleEdit started for:', editEmployee.id)

        try {
            const body: Record<string, any> = {
                name: editForm.name,
                dateOfBirth: editForm.dateOfBirth,
            }
            if (editForm.password) body.password = editForm.password
            console.log('Sending PATCH body:', body)

            const res = await fetch(`/api/admin/employees/${editEmployee.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const text = await res.text()
            console.log('PATCH raw response:', res.status, text)

            let data: any = {}
            if (text) {
                try {
                    data = JSON.parse(text)
                } catch (e) {
                    console.error('Failed to parse response as JSON:', text)
                }
            }

            setEditSaving(false)
            if (res.ok) {
                showAlert('success', 'Employee updated successfully!')
                setEditEmployee(null)
                fetchEmployees()
            } else {
                showAlert('error', data.error || `Failed to update employee (Status: ${res.status})`)
            }
        } catch (err) {
            console.error('Error in handleEdit:', err)
            setEditSaving(false)
            showAlert('error', 'An unexpected error occurred.')
        }
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">👥 Employee Management</h1>
                <p className="page-subtitle">Add, edit, or remove employee accounts and set their login credentials</p>
            </div>

            <div className="page-body">
                {/* Alert */}
                {alert && (
                    <div className={`alert alert-${alert.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 20 }}>
                        {alert.type === 'success' ? '✅' : '❌'} {alert.msg}
                    </div>
                )}

                {/* Add Employee Button */}
                <div style={{ marginBottom: 20 }}>
                    <button className="btn btn-primary" onClick={() => { setShowAdd(!showAdd); setEditEmployee(null) }}>
                        {showAdd ? '✕ Cancel' : '➕ Add New Employee'}
                    </button>
                </div>

                {/* Add Form */}
                {showAdd && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <h2 className="card-title">➕ New Employee</h2>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Employee ID will be auto-generated</span>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleAdd}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div>
                                        <label style={labelStyle}>Full Name *</label>
                                        <input style={inputStyle} placeholder="e.g. Pooja Sharma" value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })} required
                                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email Address *</label>
                                        <input style={inputStyle} type="email" placeholder="e.g. pooja@gmail.com" value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })} required
                                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Password *</label>
                                        <input style={inputStyle} type="password" placeholder="Set initial login password" value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })} required
                                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Date of Birth <span style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional — alternate login)</span></label>
                                        <input style={inputStyle} placeholder="e.g. 15/04/2001" value={form.dateOfBirth}
                                            onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                                            pattern="\d{2}/\d{2}/\d{4}"
                                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Format: DD/MM/YYYY (e.g. 15/04/2001)</div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? '⏳ Creating...' : '✅ Create Employee'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editEmployee && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: 480 }}>
                            <div className="modal-header">
                                <h2 className="modal-title">✏️ Edit: {editEmployee.name}</h2>
                                <button className="modal-close" onClick={() => setEditEmployee(null)}>✕</button>
                            </div>
                            <form onSubmit={handleEdit}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Full Name</label>
                                    <input style={inputStyle} placeholder={editEmployee.name} value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Date of Birth (DD/MM/YYYY)</label>
                                    <input style={inputStyle}
                                        placeholder={editEmployee.dateOfBirth || 'e.g. 15/04/2001'}
                                        value={editForm.dateOfBirth}
                                        onChange={e => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                        Current: {editEmployee.dateOfBirth || 'Not set'} — Employees can use this as their login password
                                    </div>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={labelStyle}>Reset Password <span style={{ color: 'var(--text-muted)', textTransform: 'none' }}>(leave blank to keep current)</span></label>
                                    <input style={inputStyle} type="password" placeholder="New password..."
                                        value={editForm.password}
                                        onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="submit" className="btn btn-primary" disabled={editSaving}>
                                        {editSaving ? '⏳ Saving...' : '💾 Save Changes'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditEmployee(null)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Employees Table */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">All Employees ({employees.length})</h2>
                    </div>
                    <div className="table-wrapper">
                        {loading ? (
                            <div className="empty-state"><p>Loading...</p></div>
                        ) : employees.length === 0 ? (
                            <div className="empty-state"><p>No employees yet. Add one above.</p></div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Email</th>
                                        <th>Date of Birth</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{emp.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.employeeId}</div>
                                            </td>
                                            <td>{emp.email}</td>
                                            <td>
                                                {emp.dateOfBirth ? (
                                                    <span className="badge badge-morning" style={{ fontFamily: 'monospace' }}>{emp.dateOfBirth}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Not set</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${emp.isActive ? 'badge-complete' : 'badge-partial'}`}>
                                                    {emp.isActive ? '✅ Active' : '⛔ Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 12 }}>{new Date(emp.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className="btn btn-secondary btn-sm"
                                                        onClick={() => { setEditEmployee(emp); setEditForm({ name: emp.name, dateOfBirth: emp.dateOfBirth || '', password: '' }); setShowAdd(false) }}>
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${emp.isActive ? 'btn-warning' : 'btn-success'}`}
                                                        onClick={() => handleToggleActive(emp)}
                                                        style={{ background: emp.isActive ? '#f59e0b' : '#10b981', color: '#fff', border: 'none' }}
                                                    >
                                                        {emp.isActive ? '🚫 Deactivate' : '✅ Activate'}
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)}>
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
