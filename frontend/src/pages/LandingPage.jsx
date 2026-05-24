import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
    green: '#0d7c4f',
    greenLight: '#e8f5ee',
    greenMid: '#10b981',
    teal: '#0e9f82',
    amber: '#f59e0b',
    amberLight: '#fef3c7',
    navy: '#0f2044',
    navyMid: '#1e3a5f',
    text: '#1a2e1a',
    muted: '#5c7060',
    bg: '#f8fdf9',
    white: '#ffffff',
}

// ─── Reusable section wrapper ─────────────────────────────────────────────────
function Section({ id, style, children }) {
    return (
        <section id={id} style={{ padding: '5rem 1.5rem', ...style }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                {children}
            </div>
        </section>
    )
}

function SectionLabel({ children }) {
    return (
        <span style={{
            display: 'inline-block',
            background: C.greenLight,
            color: C.green,
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '5px 14px',
            borderRadius: 999,
            marginBottom: '1rem',
            border: `1px solid #b6e2cb`,
        }}>
            {children}
        </span>
    )
}

function SectionTitle({ children, light }) {
    return (
        <h2 style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            color: light ? C.white : C.navy,
            lineHeight: 1.15,
            margin: '0 0 1rem',
            fontFamily: "'Georgia', serif",
        }}>
            {children}
        </h2>
    )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
    return (
        <div style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 55%, #0a4a6e 100%)`,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative blobs */}
            <div style={{ position: 'absolute', top: -120, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(16,185,129,0.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />

            {/* Spacer for fixed header */}
            <div style={{ height: 68 }} />

            {/* Hero content */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                padding: '3rem 2.5rem 4rem',
                maxWidth: 1120, margin: '0 auto', width: '100%',
                gap: '3rem',
            }}>
                <div style={{ flex: 1, maxWidth: 580 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 999, padding: '5px 14px',
                        marginBottom: '1.5rem',
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        <span style={{ color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em' }}>NOW ENROLLING — 2025–2026</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: 900,
                        color: '#fff',
                        lineHeight: 1.08,
                        margin: '0 0 1.4rem',
                        fontFamily: "'Georgia', serif",
                        letterSpacing: '-0.02em',
                    }}>
                        A nurturing home <br />
                        <span style={{ color: '#6ee7b7' }}>where children thrive</span>
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: '1.1rem',
                        lineHeight: 1.75,
                        marginBottom: '2.5rem',
                        maxWidth: 480,
                    }}>
                        NestCare provides premium early childhood care in a safe, loving environment. From infants to preschoolers — every child gets the attention and warmth they deserve.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        <Link to="/register" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '0.9rem 1.8rem',
                            background: 'linear-gradient(135deg, #10b981, #0d7c4f)',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: 14,
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            boxShadow: '0 6px 24px rgba(16,185,129,0.4)',
                            transition: 'transform 0.2s',
                        }}>
                            Register as Parent →
                        </Link>
                        <a href="#about" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '0.9rem 1.8rem',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1.5px solid rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.9)',
                            textDecoration: 'none',
                            borderRadius: 14,
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            backdropFilter: 'blur(8px)',
                        }}>
                            Learn More
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', gap: 24, marginTop: '2.5rem', flexWrap: 'wrap' }}>
                        {[['200+', 'Happy Families'], ['8+', 'Years of Care'], ['15', 'Expert Staff']].map(([num, label]) => (
                            <div key={label}>
                                <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{num}</div>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 500, marginTop: 3 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard preview card */}
                <div style={{ flex: '0 0 380px', display: 'none' }} className="hero-card-lg">
                    <HeroDashboardCard />
                </div>
            </div>

            {/* Scroll hint */}
            <div style={{ textAlign: 'center', paddingBottom: '1.5rem' }}>
                <a href="#about" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem' }}>↓ scroll to explore</a>
            </div>
        </div>
    )
}

function NavLink({ to, children }) {
    const isAnchor = to.startsWith('#')
    const props = isAnchor
        ? { href: to, style: navLinkStyle }
        : { as: 'link', style: navLinkStyle }
    if (isAnchor) {
        return <a href={to} style={navLinkStyle}>{children}</a>
    }
    return <Link to={to} style={navLinkStyle}>{children}</Link>
}

const navLinkStyle = {
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: 8,
    transition: 'color 0.2s',
}

function HeroDashboardCard() {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 24,
            padding: '1.5rem',
            color: '#fff',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Care Overview</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '4px 10px', fontSize: '0.75rem', color: '#6ee7b7' }}>Live</div>
            </div>
            {['Maya — Checked in ✓', 'Noah — Daily log ready', 'Ayaan — Nap time'].map((item) => (
                <div key={item} style={{
                    background: 'rgba(255,255,255,0.06)', borderRadius: 10,
                    padding: '0.6rem 0.8rem', marginBottom: 8,
                    fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #0d7c4f)', flexShrink: 0 }} />
                    {item}
                </div>
            ))}
        </div>
    )
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
    const values = [
        { icon: '💛', title: 'Warmth & Safety', desc: 'A home-like environment where every child feels secure, loved, and cared for every single day.' },
        { icon: '🌱', title: 'Holistic Development', desc: 'We nurture cognitive, social, emotional, and physical growth through play-based learning.' },
        { icon: '🤝', title: 'Parent Partnership', desc: 'We keep parents connected with real-time updates, daily logs, and open communication.' },
        { icon: '🎓', title: 'Qualified Caregivers', desc: 'Our staff are trained in early childhood education and certified in first aid and childcare.' },
    ]

    return (
        <Section id="about" style={{ background: C.bg }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
                <div>
                    <SectionLabel>About NestCare</SectionLabel>
                    <SectionTitle>Where every child is known by name</SectionTitle>
                    <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.97rem' }}>
                        Founded with a mission to provide exceptional early childhood care, NestCare has been a trusted partner for families since 2016. Our center offers a warm, stimulating environment that supports every stage of your child's development.
                    </p>
                    <p style={{ color: C.muted, lineHeight: 1.8, fontSize: '0.97rem', marginBottom: '2rem' }}>
                        We believe childcare is more than just supervision — it's a foundation for lifelong learning. With low child-to-staff ratios and individualized care plans, each child at NestCare receives the attention they need to flourish.
                    </p>
                    <Link to="/register" style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '0.75rem 1.5rem',
                        background: C.green, color: '#fff',
                        borderRadius: 12, fontWeight: 700, fontSize: '0.9rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 16px rgba(13,124,79,0.25)',
                    }}>
                        Register Your Child →
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {values.map(v => (
                        <div key={v.title} style={{
                            background: C.white,
                            borderRadius: 18,
                            padding: '1.4rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                            border: '1px solid #eef3f0',
                        }}>
                            <div style={{ fontSize: 28, marginBottom: '0.7rem' }}>{v.icon}</div>
                            <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.93rem', marginBottom: '0.4rem' }}>{v.title}</div>
                            <div style={{ color: C.muted, fontSize: '0.8rem', lineHeight: 1.6 }}>{v.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

// ─── Programs ─────────────────────────────────────────────────────────────────
function Programs() {
    const programs = [
        {
            icon: '🍼',
            name: 'Infant Care',
            age: '3 months – 1 year',
            color: '#fef3c7',
            accent: '#f59e0b',
            features: ['Low 1:3 ratio', 'Feeding & sleep schedules', 'Milestone tracking', 'Parent daily updates'],
            desc: 'Gentle, responsive care for your youngest family members. We work closely with parents to maintain familiar routines.',
        },
        {
            icon: '🧸',
            name: 'Toddler Room',
            age: '1 – 3 years',
            color: '#e8f5ee',
            accent: C.green,
            features: ['Play-based learning', 'Language development', 'Social skills', 'Potty training support'],
            desc: 'An active, exploratory environment where toddlers build independence, language, and early social bonds.',
        },
        {
            icon: '🎨',
            name: 'Pre-Nursery',
            age: '3 – 4 years',
            color: '#eff6ff',
            accent: '#2563eb',
            features: ['Creative arts', 'Early literacy', 'Group activities', 'Structured play'],
            desc: 'Preparing young minds for school with structured creative activities, stories, and collaborative play.',
        },
        {
            icon: '🔤',
            name: 'Nursery / KG Prep',
            age: '4 – 5 years',
            color: '#f5f3ff',
            accent: '#7c3aed',
            features: ['School readiness', 'Numeracy & literacy', 'Science exploration', 'Confidence building'],
            desc: 'A focused, school-readiness program that equips children with the skills and confidence to excel in formal education.',
        },
    ]

    return (
        <Section id="programs" style={{ background: '#fff' }}>
            <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 3rem' }}>
                <SectionLabel>Our Programs</SectionLabel>
                <SectionTitle>Care tailored to every age</SectionTitle>
                <p style={{ color: C.muted, lineHeight: 1.75 }}>
                    From newborns to kindergarten-ready children, our age-specific programs are designed by early childhood educators to support each developmental stage.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                {programs.map(p => (
                    <div key={p.name} style={{
                        background: p.color,
                        borderRadius: 22,
                        padding: '1.8rem',
                        border: `1.5px solid ${p.accent}22`,
                        transition: 'transform 0.2s',
                    }}>
                        <div style={{ fontSize: 36, marginBottom: '1rem' }}>{p.icon}</div>
                        <div style={{
                            display: 'inline-block',
                            background: p.accent + '18',
                            color: p.accent,
                            fontSize: '0.7rem', fontWeight: 700,
                            padding: '3px 10px', borderRadius: 999,
                            marginBottom: '0.6rem',
                            border: `1px solid ${p.accent}30`,
                        }}>
                            {p.age}
                        </div>
                        <h3 style={{ color: C.navy, fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.6rem', fontFamily: "'Georgia', serif" }}>{p.name}</h3>
                        <p style={{ color: C.muted, fontSize: '0.82rem', lineHeight: 1.65, marginBottom: '1rem' }}>{p.desc}</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {p.features.map(f => (
                                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.muted, fontSize: '0.78rem', marginBottom: 5 }}>
                                    <span style={{ color: p.accent, fontWeight: 700 }}>✓</span> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Section>
    )
}

// ─── Environment / Gallery ────────────────────────────────────────────────────
function Environment() {
    const spaces = [
        { icon: '🌳', title: 'Outdoor Play Area', desc: 'Spacious, safe outdoor space with age-appropriate play equipment, sandpit, and garden.' },
        { icon: '📚', title: 'Reading Corner', desc: 'Cozy library nook stocked with age-appropriate books to build a love of reading early.' },
        { icon: '🎵', title: 'Music & Movement', desc: 'Dedicated space for music, dance, and creative expression through movement and instruments.' },
        { icon: '🍽️', title: 'Dining Hall', desc: 'Clean, bright dining area where children enjoy nutritious halal-certified meals together.' },
        { icon: '😴', title: 'Sleep Room', desc: 'Quiet, safe nap rooms with individual beds and soft lighting for restful afternoon sleep.' },
        { icon: '🎭', title: 'Creative Arts Studio', desc: 'A dedicated arts space for painting, clay, craft, and sensory activities every day.' },
    ]

    return (
        <Section id="environment" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)` }}>
            <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 3rem' }}>
                <SectionLabel>Our Environment</SectionLabel>
                <SectionTitle light>A space designed for wonder</SectionTitle>
                <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                    Every corner of NestCare is thoughtfully designed to spark curiosity, encourage exploration, and ensure your child's safety and comfort.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {spaces.map(s => (
                    <div key={s.title} style={{
                        background: 'rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 18,
                        padding: '1.5rem',
                        transition: 'background 0.2s',
                    }}>
                        <div style={{ fontSize: 32, marginBottom: '0.8rem' }}>{s.icon}</div>
                        <h3 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem' }}>{s.title}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                    </div>
                ))}
            </div>

            {/* Feature strip */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                gap: 12, marginTop: '3rem',
            }}>
                {['CCTV Monitored', 'Halal Meals', 'First Aid Certified Staff', 'Air Conditioned', 'Hygienic & Clean', 'Secure Entry System'].map(f => (
                    <span key={f} style={{
                        background: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        color: '#6ee7b7',
                        borderRadius: 999, padding: '6px 16px',
                        fontSize: '0.78rem', fontWeight: 600,
                    }}>
                        ✓ {f}
                    </span>
                ))}
            </div>
        </Section>
    )
}

// ─── Fees ─────────────────────────────────────────────────────────────────────
function Fees() {
    const plans = [
        {
            name: 'Infant Care',
            price: '25,000',
            period: '/month',
            highlight: false,
            includes: ['Full-day care (7am–5pm)', 'Formula/bottle feeding', 'Daily log & photos', 'Nap tracking', 'Parent app access'],
        },
        {
            name: 'Toddler & Pre-Nursery',
            price: '18,000',
            period: '/month',
            highlight: true,
            badge: 'Most Popular',
            includes: ['Full-day care (7am–5pm)', 'Healthy meals included', 'Daily activity updates', 'Monthly progress report', 'Parent app access'],
        },
        {
            name: 'Half Day',
            price: '12,000',
            period: '/month',
            highlight: false,
            includes: ['Half-day (7am–1pm)', 'Snack included', 'Daily log updates', 'Parent app access', 'Flexible timing'],
        },
    ]

    return (
        <Section id="fees" style={{ background: C.bg }}>
            <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 3rem' }}>
                <SectionLabel>Fee Structure</SectionLabel>
                <SectionTitle>Transparent, all-inclusive pricing</SectionTitle>
                <p style={{ color: C.muted, lineHeight: 1.75 }}>
                    No hidden charges. All fees are monthly and include meals, activities, and access to the NestCare parent portal. One-time registration fee of PKR 5,000.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                {plans.map(p => (
                    <div key={p.name} style={{
                        background: p.highlight ? C.navy : C.white,
                        borderRadius: 22,
                        padding: '2rem',
                        border: p.highlight ? 'none' : '1.5px solid #e8f0ea',
                        boxShadow: p.highlight ? '0 20px 60px rgba(15,32,68,0.25)' : '0 2px 12px rgba(0,0,0,0.04)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {p.badge && (
                            <div style={{
                                position: 'absolute', top: 16, right: 16,
                                background: 'linear-gradient(135deg, #10b981, #0d7c4f)',
                                color: '#fff', fontSize: '0.68rem', fontWeight: 800,
                                padding: '3px 10px', borderRadius: 999,
                                letterSpacing: '0.05em',
                            }}>
                                {p.badge}
                            </div>
                        )}
                        <h3 style={{ color: p.highlight ? '#fff' : C.navy, fontWeight: 700, fontSize: '1rem', margin: '0 0 0.8rem' }}>{p.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '1.5rem' }}>
                            <span style={{ color: p.highlight ? '#6ee7b7' : C.green, fontSize: '0.85rem', fontWeight: 700 }}>PKR</span>
                            <span style={{ color: p.highlight ? '#fff' : C.navy, fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{p.price}</span>
                            <span style={{ color: p.highlight ? 'rgba(255,255,255,0.4)' : C.muted, fontSize: '0.82rem' }}>{p.period}</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                            {p.includes.map(item => (
                                <li key={item} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 8,
                                    color: p.highlight ? 'rgba(255,255,255,0.7)' : C.muted,
                                    fontSize: '0.82rem', marginBottom: 8, lineHeight: 1.5,
                                }}>
                                    <span style={{ color: p.highlight ? '#6ee7b7' : C.green, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/register" style={{
                            display: 'block', textAlign: 'center',
                            padding: '0.75rem',
                            background: p.highlight ? 'linear-gradient(135deg, #10b981, #0d7c4f)' : C.greenLight,
                            color: p.highlight ? '#fff' : C.green,
                            borderRadius: 12, fontWeight: 700, fontSize: '0.88rem',
                            textDecoration: 'none',
                            border: p.highlight ? 'none' : `1.5px solid #b6e2cb`,
                        }}>
                            Enroll Now
                        </Link>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '2rem', background: C.amberLight,
                border: `1.5px solid #fde68a`, borderRadius: 14,
                padding: '1rem 1.5rem',
                display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div>
                    <strong style={{ color: '#92400e', fontSize: '0.88rem' }}>Sibling Discount: </strong>
                    <span style={{ color: '#78350f', fontSize: '0.85rem' }}>10% off monthly fees for your second child and 15% off for your third child enrolled at NestCare simultaneously.</span>
                </div>
            </div>
        </Section>
    )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
    const testimonials = [
        { name: 'Sarah Khan', role: 'Mother of Maya, 2 yrs', quote: 'NestCare has been a blessing for our family. The daily updates and photos keep us connected throughout the day. Maya absolutely loves going to daycare!' },
        { name: 'Ahmed & Fatima', role: 'Parents of Ali, 3 yrs', quote: 'The staff genuinely care about each child. Ali\'s development has been incredible since joining — his confidence and social skills have grown so much.' },
        { name: 'Zara Siddiqui', role: 'Mother of twins, 4 yrs', quote: 'As a working mother, NestCare gives me complete peace of mind. The parent app is a game changer — I know exactly what my children are doing all day.' },
    ]

    return (
        <Section style={{ background: '#fff' }}>
            <div style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto 3rem' }}>
                <SectionLabel>Parent Stories</SectionLabel>
                <SectionTitle>What families say about us</SectionTitle>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {testimonials.map(t => (
                    <div key={t.name} style={{
                        background: C.bg,
                        borderRadius: 20,
                        padding: '1.8rem',
                        border: '1.5px solid #e8f0ea',
                    }}>
                        <div style={{ fontSize: 28, marginBottom: '1rem', color: C.green }}>"</div>
                        <p style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '1.2rem', fontStyle: 'italic' }}>
                            {t.quote}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981, #0d7c4f)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                            }}>
                                {t.name[0]}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.88rem' }}>{t.name}</div>
                                <div style={{ color: C.muted, fontSize: '0.75rem' }}>{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
    return (
        <Section style={{ background: `linear-gradient(135deg, ${C.green} 0%, #0e9f82 100%)`, padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
                <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', margin: '0 0 1rem', fontFamily: "'Georgia', serif" }}>
                    Give your child the best start
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', lineHeight: 1.7, fontSize: '0.97rem' }}>
                    Limited spots available for 2025–2026. Register today to secure your child's place at NestCare.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    <Link to="/register" style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '0.85rem 1.8rem',
                        background: '#fff', color: C.green,
                        borderRadius: 12, fontWeight: 800, fontSize: '0.95rem',
                        textDecoration: 'none',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                    }}>
                        Register as Parent
                    </Link>
                    <Link to="/login?role=parent" style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '0.85rem 1.8rem',
                        background: 'rgba(255,255,255,0.15)',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        color: '#fff',
                        borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
                        textDecoration: 'none',
                    }}>
                        Parent Login
                    </Link>
                </div>
            </div>
        </Section>
    )
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
    return (
        <Section id="contact" style={{ background: C.bg }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: 'linear-gradient(135deg, #10b981, #0d7c4f)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        }}>🌿</div>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: C.navy }}>NestCare</span>
                    </div>
                    <p style={{ color: C.muted, lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.92rem' }}>
                        Premium early childhood care where every child is nurtured, known, and loved. Enrolling children aged 3 months to 5 years.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {['Parent Portal', 'Staff Login'].map((label, i) => (
                            <Link key={label} to={i === 0 ? '/login?role=parent' : '/login?role=staff'} style={{
                                padding: '7px 14px',
                                background: i === 0 ? C.green : C.white,
                                color: i === 0 ? '#fff' : C.navy,
                                borderRadius: 10, fontWeight: 600, fontSize: '0.8rem',
                                textDecoration: 'none',
                                border: i === 1 ? `1.5px solid #e8f0ea` : 'none',
                            }}>
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 style={{ color: C.navy, fontWeight: 700, marginBottom: '1rem', fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Links</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[['About Us', '#about'], ['Programs', '#programs'], ['Fees', '#fees'], ['Register', '/register'], ['Parent Login', '/login?role=parent']].map(([label, href]) => (
                            <a key={label} href={href} style={{ color: C.muted, fontSize: '0.88rem', textDecoration: 'none' }}>
                                → {label}
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 style={{ color: C.navy, fontWeight: 700, marginBottom: '1rem', fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact Us</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { icon: '📍', text: '123 Children Street, DHA Phase 2, Lahore, Pakistan' },
                            { icon: '📞', text: '+92 42 3456 7890' },
                            { icon: '✉️', text: 'info@nestcaredaycare.com' },
                            { icon: '🕐', text: 'Mon–Sat: 7:00 AM – 6:00 PM' },
                        ].map(c => (
                            <div key={c.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 16 }}>{c.icon}</span>
                                <span style={{ color: C.muted, fontSize: '0.85rem', lineHeight: 1.5 }}>{c.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                borderTop: '1px solid #e8f0ea',
                marginTop: '3rem', paddingTop: '1.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12,
            }}>
                <span style={{ color: C.muted, fontSize: '0.8rem' }}>© 2025 NestCare Early Learning Centre. All rights reserved.</span>
                <span style={{ color: C.muted, fontSize: '0.8rem' }}>Licensed daycare facility · Registered with Punjab Dept. of Education</span>
            </div>
        </Section>
    )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    return (
        <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
            <SiteHeader />
            <Hero />
            <About />
            <Programs />
            <Environment />
            <Fees />
            <Testimonials />
            <CTABanner />
            <Contact />
            <SiteFooter />
        </div>
    )
}
