import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

export default function StaffDashboard() {
    const [children, setChildren] = useState([])
    const [stats, setStats] = useState({ total: 0, checkedIn: 0, logs: 0 })
    const [loading, setLoading] = useState(true)
    const [attendance, setAttendance] = useState({ status: null, checked_in_at: null, checked_out_at: null })
    const [attLoading, setAttLoading] = useState(false)
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const today = new Date().toISOString().split('T')[0]

    const fetchAttendance = async () => {
        try {
            const r = await api.get('/api/staff/attendance/me')
            setAttendance(r.data.data || {})
        } catch { }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const childRes = await api.get('/api/children')
                const childList = childRes.data.data || []
                setChildren(childList)

                let logCount = 0
                if (childList.length > 0) {
                    try {
                        const logsRes = await api.get(`/api/health/daily-logs/${childList[0].id}`, {
                            params: { start_date: today, end_date: today }
                        })
                        logCount = (logsRes.data.data || []).length
                    } catch { }
                }

                setStats({ total: childList.length, checkedIn: 0, logs: logCount })
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            }
            setLoading(false)
        }
        fetchData()
        fetchAttendance()
    }, [])

    const handleCheckIn = async () => {
        setAttLoading(true)
        try {
            await api.post('/api/staff/checkin')
            await fetchAttendance()
        } catch (err) {
            alert(err.response?.data?.detail || 'Check-in failed')
        }
        setAttLoading(false)
    }

    const handleCheckOut = async () => {
        setAttLoading(true)
        try {
            await api.post('/api/staff/checkout')
            await fetchAttendance()
        } catch (err) {
            alert(err.response?.data?.detail || 'Check-out failed')
        }
        setAttLoading(false)
    }

    const handleLogout = () => { logout(); navigate('/') }

    const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

    const greet = () => {
        const h = new Date().getHours()
        return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
    }

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)', padding: '1.2rem 2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>NestCare</div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: -2 }}>Staff Portal</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                                {user?.full_name?.[0] || 'S'}
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>{user?.full_name}</span>
                        </div>
                        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.4rem' }}>
                    {greet()}, {user?.full_name?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {/* Attendance Check-In Card */}
                {(() => {
                    const isCheckedIn = !!attendance.checked_in_at
                    const isCheckedOut = !!attendance.checked_out_at
                    const borderColor = isCheckedOut ? '#bbf7d0' : isCheckedIn ? '#bfdbfe' : '#e5e7eb'
                    const bgColor = isCheckedOut ? '#f0fdf4' : isCheckedIn ? '#eff6ff' : '#fff'
                    return (
                        <div style={{ background: bgColor, borderRadius: 16, padding: '1.2rem 1.5rem', border: `1.5px solid ${borderColor}`, marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1a2e' }}>
                                    {isCheckedOut ? 'Day complete' : isCheckedIn ? 'Checked in' : 'Not checked in yet'}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>
                                    {isCheckedIn && `Arrived ${fmtTime(attendance.checked_in_at)}`}
                                    {isCheckedOut && ` · Left ${fmtTime(attendance.checked_out_at)}`}
                                    {!isCheckedIn && 'Tap Check In to record your arrival — time is set automatically.'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {!isCheckedIn && (
                                    <button onClick={handleCheckIn} disabled={attLoading}
                                        style={{ background: attLoading ? '#9ca3af' : 'linear-gradient(135deg, #0d9488, #14b8a6)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 800, fontSize: '0.9rem', cursor: attLoading ? 'not-allowed' : 'pointer' }}>
                                        {attLoading ? '...' : 'Check In'}
                                    </button>
                                )}
                                {isCheckedIn && !isCheckedOut && (
                                    <button onClick={handleCheckOut} disabled={attLoading}
                                        style={{ background: attLoading ? '#9ca3af' : '#fff', color: '#0d9488', border: '2px solid #0d9488', borderRadius: 10, padding: '10px 22px', fontWeight: 800, fontSize: '0.9rem', cursor: attLoading ? 'not-allowed' : 'pointer' }}>
                                        {attLoading ? '...' : 'Check Out'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })()}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Children', value: loading ? '…' : stats.total, color: '#0d9488', bg: '#f0fdfa', icon: '👶' },
                        { label: "Today's Logs", value: loading ? '…' : stats.logs, color: '#7c3aed', bg: '#f5f3ff', icon: '📝' },
                        { label: 'Today', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: '#d97706', bg: '#fffbeb', icon: '📅' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '1.2rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { to: '/staff/attendance', icon: '✅', title: 'Attendance', desc: 'Check children in and out for today.', color: '#0d9488' },
                        { to: '/staff/daily-log', icon: '📝', title: 'Daily Reports', desc: 'Fill daily logs for meals, naps, activities.', color: '#7c3aed' },
                        { to: '/staff/messages', icon: '💬', title: 'Messages', desc: 'Chat with parents and other staff.', color: '#2563eb' },
                        { to: '/children', icon: '👶', title: 'Children Directory', desc: 'Browse and view child profiles.', color: '#d97706' },
                    ].map(item => (
                        <Link key={item.to} to={item.to} style={{ display: 'block', background: '#fff', borderRadius: 16, padding: '1.2rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
                        >
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                            <div style={{ fontWeight: 700, color: item.color, fontSize: '1rem', marginBottom: 4 }}>{item.title}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.5 }}>{item.desc}</div>
                        </Link>
                    ))}
                </div>

                {/* Children List */}
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>Children Today</h2>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                    ) : children.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No children found.</div>
                    ) : (
                        children.slice(0, 8).map((child, i) => (
                            <div key={child.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', borderBottom: i < children.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: child.photo_url ? 'transparent' : 'linear-gradient(135deg, #0d9488, #7c3aed)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {child.photo_url ? <img src={child.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (child.first_name?.[0] || '?')}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' }}>{child.first_name} {child.last_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{child.room_name || 'No room'}</div>
                                    </div>
                                </div>
                                <Link to={`/children/${child.id}`} style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>View →</Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
