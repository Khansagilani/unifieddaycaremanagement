import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications')
            setNotifications(res.data.data || [])
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    useEffect(() => { fetchNotifications() }, [])

    const markRead = async (id) => {
        try {
            await api.post('/api/notifications/mark-read', { notification_id: id })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch {}
    }

    const markAllRead = async () => {
        try {
            await api.post('/api/notifications/mark-all-read')
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        } catch {}
    }

    const typeIcon = {
        LINK_REQUEST: '🔗',
        LINK_APPROVED: '✅',
        LINK_REJECTED: '❌',
        CHILD_UPDATED: '📝',
        DEFAULT: '🔔'
    }

    const typeBg = {
        LINK_REQUEST: '#eff6ff',
        LINK_APPROVED: '#f0fdf4',
        LINK_REJECTED: '#fef2f2',
        CHILD_UPDATED: '#fefce8',
        DEFAULT: '#f9fafb'
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', padding: '2rem 2rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(16,185,129,0.08)' }} />
                <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.2rem', backdropFilter: 'blur(4px)' }}>
                    ← Back
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 4 }}>
                                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ background: '#10b981', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem' }}>Loading...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f0f0f0' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
                        <div style={{ fontWeight: 600 }}>No notifications yet</div>
                        <div style={{ fontSize: '0.85rem', marginTop: 4 }}>You'll see updates here when something happens</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => !n.is_read && markRead(n.id)}
                                style={{
                                    background: n.is_read ? '#fff' : typeBg[n.type] || typeBg.DEFAULT,
                                    borderRadius: 14, padding: '1rem 1.2rem',
                                    border: `1px solid ${n.is_read ? '#f0f0f0' : '#e5e7eb'}`,
                                    cursor: n.is_read ? 'default' : 'pointer',
                                    display: 'flex', gap: 14, alignItems: 'flex-start',
                                    boxShadow: n.is_read ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'
                                }}
                            >
                                <span style={{ fontSize: 24, flexShrink: 0 }}>{typeIcon[n.type] || typeIcon.DEFAULT}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: '0.92rem', color: '#1a1a2e' }}>{n.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 3 }}>{n.message}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#d1d5db', marginTop: 6 }}>
                                        {new Date(n.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                {!n.is_read && (
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', flexShrink: 0, marginTop: 4 }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
