import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import NotificationBell from '../components/NotificationBell'
import useAuth from '../hooks/useAuth'

export default function ParentDashboard() {
    const [children, setChildren] = useState([])
    const [todayAttendance, setTodayAttendance] = useState([])
    const [stats, setStats] = useState({ children: 0, logs: 0, messages: 0 })
    const [regNumber, setRegNumber] = useState('')
    const [linkStatus, setLinkStatus] = useState(null)
    const [linkLoading, setLinkLoading] = useState(false)

    const { user, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Children (parent's linked children only)
                const childRes = await api.get('/api/parent/my-children')
                const childList = childRes.data.data || []

                setChildren(childList)

                // Logs (using first child)
                let logList = []

                if (childList.length > 0) {
                    const firstChildId = childList[0].id

                    const today = new Date()
                    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
                    const end = today.toISOString().split('T')[0]

                    try {
                        const logsRes = await api.get(
                            `/api/health/daily-logs/${firstChildId}?start_date=${start}&end_date=${end}`
                        )
                        logList = (logsRes.data.data || []).slice(0, 5)
                    } catch (logErr) {
                        console.error('Error fetching daily logs:', logErr)
                    }

                    // Attendance for all linked children (today)
                    const attResults = await Promise.all(
                        childList.map(c =>
                            api.get(`/api/health/attendance/${c.id}/today`)
                                .then(r => ({ childId: c.id, name: `${c.first_name} ${c.last_name}`, ...r.data.data }))
                                .catch(() => ({ childId: c.id, name: `${c.first_name} ${c.last_name}` }))
                        )
                    )
                    setTodayAttendance(attResults)
                }

                // Conversations
                const convRes = await api.get('/api/messages/conversations')
                const convs = convRes.data.data || []

                setStats({
                    children: childList.length,
                    logs: logList.length,
                    messages: convs.length
                })

            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            }
        }

        fetchData()
    }, [])

    const handleLinkRequest = async (e) => {
        e.preventDefault()
        if (!regNumber.trim()) return
        setLinkLoading(true)
        setLinkStatus(null)
        try {
            const res = await api.post('/api/parent/link-request', { registration_number: regNumber.trim().toUpperCase() })
            setLinkStatus({ ok: true, msg: res.data.message || 'Request submitted. Waiting for admin approval.' })
            setRegNumber('')
        } catch (err) {
            const detail = err.response?.data?.detail || err.response?.data?.message || 'Failed to submit request'
            setLinkStatus({ ok: false, msg: detail })
        }
        setLinkLoading(false)
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div
            style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: '#f8fafb',
                minHeight: '100vh'
            }}
        >

            {/* Header */}
            <div
                style={{
                    background:
                        'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
                    padding: '1.2rem 2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: -40,
                        right: -40,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)'
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative'
                    }}
                >
                    {/* Left */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}
                    >
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background:
                                    'linear-gradient(135deg, #60a5fa, #a78bfa)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18
                            }}
                        >
                            👨‍👩‍👧
                        </div>

                        <div>
                            <div
                                style={{
                                    fontFamily:
                                        "'Playfair Display', Georgia, serif",
                                    fontWeight: 700,
                                    color: '#fff',
                                    fontSize: '1.1rem'
                                }}
                            >
                                NestCare
                            </div>

                            <div
                                style={{
                                    fontSize: '0.72rem',
                                    color: 'rgba(255,255,255,0.6)',
                                    marginTop: -2
                                }}
                            >
                                Parent Portal
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <NotificationBell />

                        <Link
                            to="/parent/messages"
                            style={{
                                background: 'rgba(255,255,255,0.12)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: 10,
                                padding: '8px 14px',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            💬 Messages
                        </Link>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background:
                                        'linear-gradient(135deg, #60a5fa, #a78bfa)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.85rem'
                                }}
                            >
                                {user?.full_name?.[0] || 'P'}
                            </div>

                            <span
                                style={{
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {user?.full_name}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'rgba(255,255,255,0.12)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: 8,
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                style={{
                    maxWidth: 1100,
                    margin: '0 auto',
                    padding: '2rem 1.5rem'
                }}
            >
                <h1
                    style={{
                        fontFamily:
                            "'Playfair Display', Georgia, serif",
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: '#1a1a2e',
                        marginBottom: '0.4rem'
                    }}
                >
                    Welcome back, {user?.full_name?.split(' ')[0]} 👋
                </h1>

                <p
                    style={{
                        color: '#6b7280',
                        marginBottom: '2rem',
                        fontSize: '0.9rem'
                    }}
                >
                    Stay updated with your child’s activities and messages.
                </p>

                {/* Stats */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}
                >
                    {[
                        {
                            label: 'My Children',
                            value: stats.children,
                            color: '#2563eb',
                            bg: '#dbeafe',
                            icon: '👶'
                        },
                        {
                            label: 'Recent Activities',
                            value: stats.logs,
                            color: '#16a34a',
                            bg: '#dcfce7',
                            icon: '📝'
                        },
                        {
                            label: 'Messages',
                            value: stats.messages,
                            color: '#9333ea',
                            bg: '#f3e8ff',
                            icon: '💬'
                        }
                    ].map((s) => (
                        <div
                            key={s.label}
                            style={{
                                background: '#fff',
                                borderRadius: 16,
                                padding: '1.2rem 1.5rem',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                border: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    background: s.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22
                                }}
                            >
                                {s.icon}
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontSize: '0.75rem',
                                        color: '#9ca3af',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5
                                    }}
                                >
                                    {s.label}
                                </div>

                                <div
                                    style={{
                                        fontSize: '1.8rem',
                                        fontWeight: 800,
                                        color: s.color
                                    }}
                                >
                                    {s.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Today's Attendance */}
                {todayAttendance.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.8rem' }}>
                            Today's Attendance
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {todayAttendance.map(att => (
                                <div key={att.childId} style={{ background: '#fff', borderRadius: 14, padding: '0.9rem 1.2rem', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' }}>{att.name}</div>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        {att.checked_in_at ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Arrived</div>
                                                <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                                                    {new Date(att.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Not checked in</div>
                                        )}
                                        {att.checked_out_at && (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Departed</div>
                                                <div style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 700 }}>
                                                    {new Date(att.checked_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Connect a Child */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '1.4rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.3rem' }}>
                        🔗 Connect to a Child
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1rem' }}>
                        Enter the registration number given by the daycare to request access to your child's profile.
                    </p>
                    <form onSubmit={handleLinkRequest} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                            value={regNumber}
                            onChange={e => setRegNumber(e.target.value)}
                            placeholder="e.g. NC-2024-001"
                            style={{
                                flex: 1, minWidth: 200, padding: '0.55rem 1rem',
                                border: '1px solid #e5e7eb', borderRadius: 8,
                                fontSize: '0.88rem', outline: 'none', color: '#1f2937'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={linkLoading || !regNumber.trim()}
                            style={{
                                background: linkLoading || !regNumber.trim() ? '#9ca3af' : '#2563eb',
                                color: '#fff', border: 'none', borderRadius: 8,
                                padding: '0.55rem 1.2rem', cursor: linkLoading ? 'not-allowed' : 'pointer',
                                fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap'
                            }}
                        >
                            {linkLoading ? 'Sending…' : 'Send Request'}
                        </button>
                    </form>
                    {linkStatus && (
                        <div style={{
                            marginTop: 10, padding: '0.55rem 1rem', borderRadius: 8, fontSize: '0.82rem',
                            background: linkStatus.ok ? '#f0fdf4' : '#fef2f2',
                            color: linkStatus.ok ? '#15803d' : '#dc2626',
                            border: `1px solid ${linkStatus.ok ? '#bbf7d0' : '#fecaca'}`
                        }}>
                            {linkStatus.ok ? '✅ ' : '❌ '}{linkStatus.msg}
                        </div>
                    )}
                </div>

                {/* Quick Access */}
                <h2
                    style={{
                        fontFamily:
                            "'Playfair Display', Georgia, serif",
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#1a1a2e',
                        marginBottom: '1rem'
                    }}
                >
                    Quick Access
                </h2>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '1rem'
                    }}
                >
                    {[
                        {
                            to: '/children',
                            icon: '👶',
                            title: 'My Children',
                            desc: 'View profiles and classroom information.'
                        },
                        {
                            to: '/parent/feed',
                            icon: '📝',
                            title: 'Activity Feed',
                            desc: 'See recent updates and daily logs.'
                        },
                        {
                            to: '/parent/messages',
                            icon: '💬',
                            title: 'Messages',
                            desc: 'Chat with teachers and daycare staff.'
                        },
                        {
                            to: '/invoices',
                            icon: '📄',
                            title: 'Invoices',
                            desc: 'Track billing and payment history.'
                        }
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={{
                                display: 'block',
                                background: '#fff',
                                borderRadius: 16,
                                padding: '1.2rem 1.5rem',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                border: '1px solid #f0f0f0',
                                textDecoration: 'none',
                                transition:
                                    'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(-2px)'
                                e.currentTarget.style.boxShadow =
                                    '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(0)'
                                e.currentTarget.style.boxShadow =
                                    '0 1px 4px rgba(0,0,0,0.06)'
                            }}
                        >
                            <div style={{ fontSize: 24, marginBottom: 8 }}>
                                {item.icon}
                            </div>

                            <div
                                style={{
                                    fontWeight: 700,
                                    color: '#1a1a2e',
                                    fontSize: '0.95rem',
                                    marginBottom: 4
                                }}
                            >
                                {item.title}
                            </div>

                            <div
                                style={{
                                    color: '#6b7280',
                                    fontSize: '0.82rem',
                                    lineHeight: 1.5
                                }}
                            >
                                {item.desc}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}