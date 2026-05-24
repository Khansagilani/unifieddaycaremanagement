import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './SiteHeader'

export default function SiteFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer style={{
            background: '#0f2044',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            {/* Main footer grid */}
            <div style={{
                maxWidth: 1200, margin: '0 auto',
                padding: '3.5rem 1.5rem 2.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2.5rem',
            }}>
                {/* Brand column */}
                <div>
                    <Logo size={42} showText light />
                    <p style={{
                        marginTop: '1.2rem', fontSize: '0.85rem',
                        lineHeight: 1.75, color: 'rgba(255,255,255,0.5)',
                        maxWidth: 280,
                    }}>
                        Premium early childhood care where every child is nurtured, known, and loved. Enrolling children aged 3 months to 5 years.
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: '1.2rem', flexWrap: 'wrap' }}>
                        <FooterCTA to="/register" primary>Register Now</FooterCTA>
                        <FooterCTA to="/login?role=parent">Parent Login</FooterCTA>
                    </div>
                </div>

                {/* Programs */}
                <div>
                    <FooterHeading>Programs</FooterHeading>
                    <FooterLinks links={[
                        ['Infant Care (3m–1yr)', '/#programs'],
                        ['Toddler Room (1–3yr)', '/#programs'],
                        ['Pre-Nursery (3–4yr)', '/#programs'],
                        ['KG Prep (4–5yr)', '/#programs'],
                        ['Half Day Option', '/#fees'],
                    ]} />
                </div>

                {/* Quick links */}
                <div>
                    <FooterHeading>Quick Links</FooterHeading>
                    <FooterLinks links={[
                        ['About NestCare', '/#about'],
                        ['Fee Structure', '/#fees'],
                        ['Our Environment', '/#environment'],
                        ['Parent Stories', '/'],
                        ['Register as Parent', '/register'],
                        ['Staff Login', '/login?role=staff'],
                    ]} />
                </div>

                {/* Contact */}
                <div>
                    <FooterHeading>Contact Us</FooterHeading>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { icon: '📍', text: '123 Children Street, DHA Phase 2, Lahore, Pakistan' },
                            { icon: '📞', text: '+92 42 3456 7890' },
                            { icon: '✉️', text: 'info@nestcaredaycare.com' },
                            { icon: '🕐', text: 'Mon–Sat: 7:00 AM – 6:00 PM' },
                        ].map(item => (
                            <div key={item.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                                <span style={{ fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.5)' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Trust badges */}
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {['🏅 Licensed Daycare Facility', '🛡️ CCTV Monitored 24/7', '🍽️ Halal Certified Meals'].map(b => (
                            <div key={b} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.2)',
                                borderRadius: 8, padding: '4px 10px',
                                fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 500,
                            }}>
                                {b}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.07)',
                maxWidth: 1200, margin: '0 auto',
                padding: '1.2rem 1.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 10,
            }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    © {currentYear} NestCare Early Learning Centre. All rights reserved.
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    Registered with Punjab Dept. of Education · Licensed Childcare Facility
                </span>
            </div>
        </footer>
    )
}

function FooterHeading({ children }) {
    return (
        <div style={{
            color: '#fff', fontWeight: 700,
            fontSize: '0.82rem', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: '1rem',
        }}>
            {children}
        </div>
    )
}

function FooterLinks({ links }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {links.map(([label, href]) => (
                <a key={label} href={href} style={{
                    color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none', fontSize: '0.84rem',
                    transition: 'color 0.18s',
                    lineHeight: 1.5,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#6ee7b7'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                    → {label}
                </a>
            ))}
        </div>
    )
}

function FooterCTA({ to, children, primary }) {
    return (
        <Link to={to} style={{
            display: 'inline-block',
            padding: '7px 16px',
            borderRadius: 9, fontWeight: 700, fontSize: '0.8rem',
            textDecoration: 'none',
            background: primary ? 'linear-gradient(135deg, #10b981, #0d7c4f)' : 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: primary ? 'none' : '1px solid rgba(255,255,255,0.15)',
            boxShadow: primary ? '0 3px 12px rgba(16,185,129,0.3)' : 'none',
        }}>
            {children}
        </Link>
    )
}
