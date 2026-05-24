import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Logo({ size = 40, showText = true, light = false }) {
    return (
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
                width: size, height: size,
                borderRadius: Math.round(size * 0.28),
                background: 'linear-gradient(135deg, #10b981 0%, #0d7c4f 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: Math.round(size * 0.5),
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                flexShrink: 0,
            }}>
                🌿
            </div>
            {showText && (
                <div>
                    <div style={{
                        fontWeight: 900,
                        fontSize: `${size * 0.38}px`,
                        color: light ? '#fff' : '#0f2044',
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                        fontFamily: "'Georgia', serif",
                    }}>
                        NestCare
                    </div>
                    <div style={{
                        fontSize: `${size * 0.22}px`,
                        color: light ? 'rgba(255,255,255,0.45)' : '#5c7060',
                        fontWeight: 500,
                        letterSpacing: '0.03em',
                        lineHeight: 1,
                        marginTop: 2,
                    }}>
                        Early Learning Centre
                    </div>
                </div>
            )}
        </Link>
    )
}

export default function SiteHeader() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // On landing page: transparent → frosted on scroll. On other pages: always solid.
    const isLanding = location.pathname === '/'
    const transparent = isLanding && !scrolled

    const headerStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        background: transparent
            ? 'linear-gradient(to bottom, rgba(15,32,68,0.9), transparent)'
            : 'rgba(255,255,255,0.97)',
        backdropFilter: transparent ? 'none' : 'blur(20px)',
        borderBottom: transparent ? 'none' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: transparent ? 'none' : '0 2px 20px rgba(0,0,0,0.06)',
    }

    const linkColor = transparent ? 'rgba(255,255,255,0.75)' : '#374151'
    const linkHoverColor = transparent ? '#fff' : '#0d7c4f'

    const navLinks = [
        { label: 'About', href: isLanding ? '#about' : '/#about' },
        { label: 'Programs', href: isLanding ? '#programs' : '/#programs' },
        { label: 'Fees', href: isLanding ? '#fees' : '/#fees' },
        { label: 'Contact', href: isLanding ? '#contact' : '/#contact' },
    ]

    return (
        <>
            <header style={headerStyle}>
                <div style={{
                    maxWidth: 1200, margin: '0 auto',
                    padding: '0 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    height: 68,
                }}>
                    <Logo size={38} light={transparent} />

                    {/* Desktop nav */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {navLinks.map(link => (
                            <a key={link.label} href={link.href} style={{
                                color: linkColor,
                                textDecoration: 'none', padding: '7px 13px',
                                borderRadius: 8, fontSize: '0.87rem', fontWeight: 500,
                                transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = linkHoverColor; e.currentTarget.style.background = transparent ? 'rgba(255,255,255,0.08)' : '#f0fdf4' }}
                            onMouseLeave={e => { e.currentTarget.style.color = linkColor; e.currentTarget.style.background = 'transparent' }}
                            >
                                {link.label}
                            </a>
                        ))}

                        <div style={{ width: 1, height: 20, background: transparent ? 'rgba(255,255,255,0.15)' : '#e5e7eb', margin: '0 6px' }} />

                        <Link to="/login?role=staff" style={{
                            color: linkColor,
                            textDecoration: 'none', padding: '7px 13px',
                            borderRadius: 8, fontSize: '0.87rem', fontWeight: 600,
                            border: `1.5px solid ${transparent ? 'rgba(255,255,255,0.2)' : '#e8f0ea'}`,
                            transition: 'all 0.18s',
                        }}>
                            Staff Login
                        </Link>

                        <Link to="/login?role=parent" style={{
                            color: '#fff',
                            textDecoration: 'none', padding: '8px 18px',
                            borderRadius: 10, fontSize: '0.87rem', fontWeight: 700,
                            background: 'linear-gradient(135deg, #10b981, #0d7c4f)',
                            boxShadow: '0 3px 12px rgba(16,185,129,0.3)',
                            marginLeft: 4,
                            transition: 'all 0.18s',
                        }}>
                            Parent Portal
                        </Link>
                    </nav>
                </div>
            </header>
            {/* Spacer so fixed header doesn't overlap content on non-landing pages */}
            {!isLanding && <div style={{ height: 68 }} />}
        </>
    )
}
