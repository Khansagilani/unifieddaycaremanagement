import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import NotificationBell from '../components/NotificationBell'
import useAuth from '../hooks/useAuth'

export default function AdminDashboard() {
    const [stats, setStats] = useState({ children: 0, invoices: 0, feePlans: 0 })
    const [pendingRequests, setPendingRequests] = useState([])
    const [approvingId, setApprovingId] = useState(null)
    const [rejectingId, setRejectingId] = useState(null)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const fetchPendingRequests = async () => {
        try {
            const res = await api.get('/api/admin/link-requests?status=PENDING')
            setPendingRequests(res.data.data || [])
        } catch { }
    }

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [childrenRes, invoicesRes, feePlansRes] = await Promise.all([
                    api.get('/api/children'),
                    api.get('/api/billing/invoices'),
                    api.get('/api/billing/fee-plans')
                ])
                setStats({
                    children: childrenRes.data.total || childrenRes.data.data?.length || 0,
                    invoices: invoicesRes.data.data?.length || 0,
                    feePlans: feePlansRes.data.data?.length || 0
                })
            } catch (err) {
                console.error('Unable to load admin dashboard stats', err)
            }
        }
        fetchStats()
        fetchPendingRequests()
    }, [])

    const handleApprove = async (id) => {
        setApprovingId(id)
        try {
            await api.post(`/api/admin/link-requests/${id}/approve`)
            fetchPendingRequests()
        } catch { alert('Failed to approve') }
        setApprovingId(null)
    }

    const handleReject = async (id) => {
        setRejectingId(id)
        try {
            await api.post(`/api/admin/link-requests/${id}/reject`)
            fetchPendingRequests()
        } catch { alert('Failed to reject') }
        setRejectingId(null)
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', padding: '1.2rem 2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(16,185,129,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>NestCare</div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: -2 }}>Admin Portal</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <NotificationBell />
                        <Link to="/admin/link-requests" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            🔗 Link Requests
                            {pendingRequests.length > 0 && (
                                <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                    {pendingRequests.length}
                                </span>
                            )}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                                {user?.full_name?.[0] || 'A'}
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{user?.full_name}</span>
                        </div>
                        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.4rem' }}>
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.full_name?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>Here's what's happening at your center today.</p>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Active Children', value: stats.children, color: '#3b82f6', bg: '#eff6ff', icon: '👶' },
                        { label: 'Outstanding Invoices', value: stats.invoices, color: '#10b981', bg: '#f0fdf4', icon: '📄' },
                        { label: 'Fee Plans', value: stats.feePlans, color: '#8b5cf6', bg: '#f5f3ff', icon: '💳' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '1.2rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pending Parent Link Requests — shown inline so admin can act without leaving the page */}
                {pendingRequests.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.8rem' }}>
                            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                                Parent Link Requests
                            </h2>
                            <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 800 }}>
                                {pendingRequests.length} pending
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {pendingRequests.map(req => (
                                <div key={req.id} style={{ background: '#fff', borderRadius: 14, padding: '1rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>{req.parent_name}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>
                                            Wants to link to <strong>{req.child_name}</strong> &nbsp;·&nbsp; Reg# {req.registration_number}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>{req.parent_email}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleApprove(req.id)} disabled={approvingId === req.id}
                                            style={{ background: approvingId === req.id ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: approvingId === req.id ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                                            {approvingId === req.id ? '...' : 'Approve'}
                                        </button>
                                        <button onClick={() => handleReject(req.id)} disabled={rejectingId === req.id}
                                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '7px 14px', cursor: rejectingId === req.id ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                                            {rejectingId === req.id ? '...' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick links */}
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>Quick Access</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    {[
                        { to: '/admin/children', icon: '👶', title: 'Child Management', desc: 'Create new children, review existing profiles, and manage enrollment details.' },
                        { to: '/admin/fee-plans', icon: '💳', title: 'Billing & Fee Plans', desc: 'Create fee schedules, issue invoices, and keep billing aligned with center policies.' },
                        { to: '/admin/staff', icon: '👥', title: 'Staff Management', desc: 'Add and manage staff members, set roles, and track center personnel.' },
                        { to: '/admin/reports', icon: '📊', title: 'Reports & Analytics', desc: 'View enrollment statistics, revenue tracking, and center performance metrics.' },
                        { to: '/invoices', icon: '📄', title: 'Invoices', desc: 'Review all invoices and follow payment status for families.' },
                        { to: '/admin/link-requests', icon: '🔗', title: 'Parent Link Requests', desc: 'Approve or reject parent requests to be linked to children.' },
                        { to: '/notifications', icon: '🔔', title: 'Notifications', desc: 'View all notifications and updates from parents and staff.' },
                        { to: '/children', icon: '📋', title: 'Children Directory', desc: 'Browse the full roster and drill into individual child records.' },
                    ].map(item => (
                        <Link key={item.to} to={item.to} style={{ display: 'block', background: '#fff', borderRadius: 16, padding: '1.2rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
                        >
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                            <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem', marginBottom: 4 }}>{item.title}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.5 }}>{item.desc}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}