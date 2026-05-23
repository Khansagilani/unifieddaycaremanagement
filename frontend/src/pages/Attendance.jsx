import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'
import useWebSocket from '../hooks/useWebSocket'

export default function Attendance() {
    const [children, setChildren] = useState([])
    const [loading, setLoading] = useState(false)
    const { logout } = useAuth()
    const navigate = useNavigate()

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8001'}/api/ws/attendance`
    const { data: wsData, status: wsStatus } = useWebSocket(wsUrl)

    useEffect(() => {
        if (wsData?.type === 'attendance_update') fetchChildren()
    }, [wsData])

    useEffect(() => { fetchChildren() }, [])

    const fetchChildren = async () => {
        try {
            const res = await api.get('/api/children')
            setChildren(res.data.data || [])
        } catch (err) {
            console.error('Error fetching children:', err)
        }
    }

    const handleCheckIn = async (childId) => {
        setLoading(true)
        try {
            await api.post('/api/health/attendance/check-in', { child_id: childId, check_in_time: new Date().toISOString() })
            fetchChildren()
        } catch (err) {
            alert('Error checking in: ' + (err.response?.data?.detail || err.message))
        }
        setLoading(false)
    }

    const handleCheckOut = async (childId) => {
        setLoading(true)
        try {
            await api.post('/api/health/attendance/check-out', { child_id: childId, check_out_time: new Date().toISOString() })
            fetchChildren()
        } catch (err) {
            alert('Error checking out: ' + (err.response?.data?.detail || err.message))
        }
        setLoading(false)
    }

    const checkedInCount = children.filter(c => {
        const a = c.attendance?.find(a => new Date(a.date).toDateString() === new Date().toDateString())
        return a?.checked_in_at && !a?.checked_out_at
    }).length

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)', padding: '1.2rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link to="/staff" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>← Dashboard</Link>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>✅ Attendance</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.8rem', color: wsStatus === 'connected' ? '#6ee7b7' : 'rgba(255,255,255,0.5)' }}>
                            {wsStatus === 'connected' ? '● Live' : '○ Offline'}
                        </span>
                        <Link to="/staff/daily-log" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Daily Reports</Link>
                        <button onClick={() => { logout(); navigate('/') }} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.2rem' }}>Attendance</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 12, padding: '0.5rem 1rem', fontSize: '0.88rem', color: '#0d9488', fontWeight: 700 }}>
                        {checkedInCount} / {children.length} present
                    </div>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#92400e', marginBottom: '1.5rem' }}>
                    📱 QR scanner placeholder — in production, scan a child's badge to auto check-in/out.
                </div>

                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    {children.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No children found.</div>
                    ) : (
                        children.map((child, i) => {
                            const todayAtt = child.attendance?.find(a => new Date(a.date).toDateString() === new Date().toDateString())
                            const checkedIn = todayAtt?.checked_in_at
                            const checkedOut = todayAtt?.checked_out_at

                            return (
                                <div key={child.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: i < children.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: child.photo_url ? 'transparent' : 'linear-gradient(135deg, #0d9488, #7c3aed)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                                            {child.photo_url ? <img src={child.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (child.first_name?.[0] || '?')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.95rem' }}>{child.first_name} {child.last_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{child.room_name || 'No room'}</div>
                                            {checkedIn && <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: 2 }}>In {new Date(checkedIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                                            {checkedOut && <div style={{ fontSize: '0.72rem', color: '#dc2626' }}>Out {new Date(checkedOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                                        </div>
                                    </div>

                                    <div>
                                        {!checkedIn ? (
                                            <button onClick={() => handleCheckIn(child.id)} disabled={loading}
                                                style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.83rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                                                Check In
                                            </button>
                                        ) : !checkedOut ? (
                                            <button onClick={() => handleCheckOut(child.id)} disabled={loading}
                                                style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.83rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                                                Check Out
                                            </button>
                                        ) : (
                                            <span style={{ padding: '8px 18px', background: '#f3f4f6', color: '#6b7280', borderRadius: 10, fontSize: '0.83rem', fontWeight: 600 }}>✓ Done</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
