'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Moon, Sun, ArrowLeft, Search, HelpCircle, ShieldCheck } from 'lucide-react'
import Logo from '@/components/Logo'


export default function LoginPage() {
    const router = useRouter()
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Forgot password state
    const [showForgot, setShowForgot] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotResult, setForgotResult] = useState<{ success: boolean; message: string; hint?: string } | null>(null)
    const [forgotLoading, setForgotLoading] = useState(false)

    // Handle theme initialization and changes
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
        if (savedTheme) {
            setTheme(savedTheme)
            if (savedTheme === 'light') document.body.classList.add('light-mode')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        if (newTheme === 'light') document.body.classList.add('light-mode')
        else document.body.classList.remove('light-mode')
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await signIn('credentials', { email, password, redirect: false })
            if (res?.error) {
                setError('Invalid email or password / date of birth. Please try again.')
            } else {
                const sessionRes = await fetch('/api/auth/session')
                const session = await sessionRes.json()
                if (session?.user?.role === 'ADMIN') router.push('/admin')
                else router.push('/employee')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    async function handleForgotPassword(e: React.FormEvent) {
        e.preventDefault()
        setForgotLoading(true)
        setForgotResult(null)
        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            })
            const data = await res.json()
            setForgotResult(data)
        } catch {
            setForgotResult({ success: false, message: 'Something went wrong. Please try again.' })
        } finally {
            setForgotLoading(false)
        }
    }

    function quickLogin(type: 'admin' | 'employee') {
        if (type === 'admin') {
            setEmail('admin@company.com')
            setPassword('admin123')
        } else {
            // Pick an employee from previous resets or common test emails
            setEmail('pooja@company.com')
            setPassword('15/04/2001')
        }
        setShowForgot(false)
    }

    return (
        <div className="login-page">
            {/* Background Orbs */}
            <div className="login-bg-orb login-bg-orb-1" aria-hidden="true" />
            <div className="login-bg-orb login-bg-orb-2" aria-hidden="true" />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="btn btn-secondary"
                style={{
                    position: 'absolute', top: 24, right: 24, padding: 10, borderRadius: '50%',
                    width: 44, height: 44, zIndex: 100, border: '1px solid var(--border)'
                }}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="login-box">
                <div className="login-card">
                    {/* Brand Branding */}
                    <div className="login-logo">
                        <Logo size={56} showText={true} />
                        <p>Employee Reporting System</p>
                    </div>

                    {!showForgot ? (
                        <>
                            <div style={{ marginBottom: 32 }}>
                                <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Welcome Back</h2>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Sign in to access your dashboard</p>
                            </div>

                            {error && (
                                <div className="alert alert-error">{error}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="you@company.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            autoComplete="email"
                                            style={{ paddingLeft: 44 }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                                        <button
                                            type="button"
                                            onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotResult(null); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--accent-blue)', fontWeight: 600, padding: 0 }}
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                            style={{ paddingLeft: 44, paddingRight: 44 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <HelpCircle size={14} />
                                        <span>Use DOB for employee login (DD/MM/YYYY)</span>
                                    </div>
                                </div>

                                <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: 8 }}>
                                    {loading ? '⏳ Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            {/* Demo Login */}
                            <div style={{ marginTop: 28 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>Quick Demo Access</span>
                                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <button onClick={() => quickLogin('admin')} className="btn btn-secondary" style={{ padding: '8px', fontSize: 13, fontWeight: 700 }}>
                                        🛡️ Admin
                                    </button>
                                    <button onClick={() => quickLogin('employee')} className="btn btn-secondary" style={{ padding: '8px', fontSize: 13, fontWeight: 700 }}>
                                        👤 Employee
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Forgot Password */
                        <>
                            <button
                                type="button"
                                onClick={() => { setShowForgot(false); setForgotResult(null); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: 0 }}
                            >
                                <ArrowLeft size={16} /> Back to Sign In
                            </button>

                            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Forgot Password?</h2>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
                                Enter your email and we&apos;ll show your password hint.
                            </p>

                            {!forgotResult ? (
                                <form onSubmit={handleForgotPassword}>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="email"
                                                className="form-input"
                                                placeholder="you@company.com"
                                                value={forgotEmail}
                                                onChange={e => setForgotEmail(e.target.value)}
                                                required
                                                autoComplete="email"
                                                style={{ paddingLeft: 44 }}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="login-btn" disabled={forgotLoading}>
                                        {forgotLoading ? '⏳ Checking...' : 'Get Hint'}
                                    </button>
                                </form>
                            ) : (
                                <div>
                                    <div style={{
                                        padding: 24, borderRadius: 'var(--radius-md)', marginBottom: 20,
                                        background: forgotResult.success ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                                        border: `1px solid ${forgotResult.success ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                                        opacity: 0.9
                                    }}>
                                        <p style={{ fontSize: 15, color: forgotResult.success ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600, marginBottom: 12 }}>
                                            {forgotResult.message}
                                        </p>
                                        {forgotResult.hint && (
                                            <div style={{
                                                padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                                color: 'var(--text-primary)', fontSize: 14, fontWeight: 700,
                                                display: 'flex', alignItems: 'center', gap: 10
                                            }}>
                                                <Search size={16} color="var(--accent-blue)" />
                                                <span>{forgotResult.hint}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => { setShowForgot(false); setForgotResult(null); }} className="login-btn">
                                        Return to Sign In
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    <div style={{ marginTop: 32, textAlign: 'center' }}>
                        <span className="badge badge-employee" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>
                            <ShieldCheck size={12} style={{ marginRight: 6 }} /> Secure JWT Authentication
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
