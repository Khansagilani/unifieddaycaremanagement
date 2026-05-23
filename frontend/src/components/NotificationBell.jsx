// NotificationBell.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const navigate = useNavigate()

    const fetchUnread = async () => {
        try {
            const res = await api.get('/api/notifications/unread-count')
            setUnreadCount(res.data.data?.count || 0)
        } catch {}
    }

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications')
            setNotifications(res.data.data || [])
        } catch {}
    }

    useEffect(() => {
        fetchUnread()
        const interval = setInterval(fetchUnread, 30000) // poll every 30s
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (open) fetchNotifications()
    }, [open])

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const markRead = async (id) => {
        try {
            await api.post('/api/notifications/mark-read', { notification_id: id })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch {}
    }

    const markAllRead = async () => {
        try {
            await api.post('/api/notifications/mark-all-read')
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch {}
    }

    const typeIcon = {
        LINK_REQUEST: '🔗',
        LINK_APPROVED: '✅',
        LINK_REJECTED: '❌',
        CHILD_UPDATED: '📝',
        DEFAULT: '🔔'
    }

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(!open)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backdropFilter: 'blur(4px)' }}
            >
                <span style={{ fontSize: 18 }}>🔔</span>
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid transparent' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{ position: 'absolute', right: 0, top: 48, width: 340, background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #f0f0f0', zIndex: 1000, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>Notifications</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                                    Mark all read
                                </button>
                            )}
                            <button onClick={() => { setOpen(false); navigate('/notifications') }} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.78rem', cursor: 'pointer' }}>
                                See all
                            </button>
                        </div>
                    </div>

                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.slice(0, 8).map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => markRead(n.id)}
                                    style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid #f9fafb', cursor: 'pointer', background: n.is_read ? '#fff' : '#f0fdf4', transition: 'background 0.2s' }}
                                >
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon[n.type] || typeIcon.DEFAULT}</span>
                                        <div>
                                            <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: '0.85rem', color: '#1a1a2e' }}>{n.title}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>{n.message}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#d1d5db', marginTop: 4 }}>
                                                {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0, marginTop: 4 }} />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
