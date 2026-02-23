'use client'
import React from 'react'
import Logo from './Logo'
import { useSession } from 'next-auth/react'

interface BrandedHeaderProps {
    className?: string
}

const BrandedHeader: React.FC<BrandedHeaderProps> = ({ className = "" }) => {
    const { data: session } = useSession()

    return (
        <div className={`branded-header ${className}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '16px 24px',
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 100,
            pointerEvents: 'none'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
                background: 'rgba(15, 22, 40, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                border: '1px solid var(--border)',
                pointerEvents: 'auto',
                boxShadow: 'var(--shadow-md)'
            }}>
                <div className="branded-header-info">
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {session?.user?.name || 'User'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {session?.user?.role === 'ADMIN' ? '🛡️ Administrator' : '👤 Employee'}
                    </div>
                </div>
                <div className="branded-header-divider" />
                <Logo size={28} showText={true} />
            </div>
        </div>
    )
}

export default BrandedHeader
