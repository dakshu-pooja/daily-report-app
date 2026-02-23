'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Logo from './Logo'
import { X, Menu, LogOut, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavItem {
    href: string
    icon: string
    label: string
}

interface SidebarProps {
    navItems: NavItem[]
    role: 'ADMIN' | 'EMPLOYEE'
}

export default function Sidebar({ navItems, role }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Set initial state for desktop
        if (window.innerWidth > 768) {
            setIsOpen(true)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('sidebar-open')
        } else {
            document.body.classList.remove('sidebar-open')
        }
    }, [isOpen])

    const toggleSidebar = () => setIsOpen(!isOpen)

    return (
        <>
            {/* Desktop toggle button (only shows when sidebar is closed) */}
            {!isOpen && (
                <button
                    onClick={toggleSidebar}
                    className="sidebar-toggle-btn desktop-only"
                    style={{
                        position: 'fixed',
                        top: 20,
                        left: 20,
                        zIndex: 900,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Mobile Header */}
            <header className="mobile-header">
                <Link href={role === 'ADMIN' ? '/admin' : '/employee'} onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                    <Logo size={32} showText={true} />
                </Link>
                <button onClick={toggleSidebar} className="btn btn-secondary" style={{ padding: 8, minHeight: 40 }}>
                    <Menu size={20} />
                </button>
            </header>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={toggleSidebar}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <Link href={role === 'ADMIN' ? '/admin' : '/employee'} style={{ textDecoration: 'none' }}>
                        <Logo size={36} showText={true} />
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="sidebar-close-btn"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-label">Navigation</div>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                            >
                                <span style={{ fontSize: 16 }}>{item.icon}</span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                <ChevronRight size={14} className="nav-arrow" style={{ opacity: 0.5 }} />
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info-bar">
                        <div className="user-info-text">
                            <div className="user-name">{session?.user?.name || 'User'}</div>
                            <span className={`badge badge-${role.toLowerCase()}`}>{role}</span>
                        </div>
                    </div>
                    <button
                        className="logout-btn-full"
                        onClick={() => signOut({ callbackUrl: '/login' })}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    )
}
