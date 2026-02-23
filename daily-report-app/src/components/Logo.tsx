'use client'
import React from 'react'

interface LogoProps {
    size?: number
    showText?: boolean
    className?: string
}

const Logo: React.FC<LogoProps> = ({ size = 40, showText = false, className = "" }) => {
    return (
        <div className={`logo-mark ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
                className="logo-icon-wrap"
                style={{
                    width: size,
                    height: size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    flexShrink: 0
                }}
            >
                {/* Exact Rounded Inverted Arch / "a" Symbol */}
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Main Logo Path: Symmetrical inverted arch with soft legs */}
                    <path
                        d="M50 15C35 15 25 35 22 55C20 70 20 80 28 85C32 87 38 85 41 80C44 75 46 65 50 65C54 65 56 75 59 80C62 85 68 87 72 85C80 80 80 70 78 55C75 35 65 15 50 15Z"
                        fill="url(#exact-gradient)"
                    />

                    <defs>
                        <linearGradient id="exact-gradient" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ff4d4d" />    {/* Top: Red */}
                            <stop offset="20%" stopColor="#ff9f4d" />   {/* Orange */}
                            <stop offset="40%" stopColor="#ffeb3b" />   {/* Yellow */}
                            <stop offset="60%" stopColor="#4caf50" />   {/* Green */}
                            <stop offset="80%" stopColor="#00bcd4" />   {/* Cyan */}
                            <stop offset="100%" stopColor="#2196f3" />  {/* Bottom: Blue */}
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {showText && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.9 }}>
                    <div style={{
                        fontSize: size * 0.42,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        letterSpacing: '0.02em',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                        Antigraviity
                    </div>
                </div>
            )}
        </div>
    )
}

export default Logo
