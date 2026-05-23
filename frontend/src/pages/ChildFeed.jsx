import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

function moodEmoji(mood) {
    const map = { HAPPY: '😊', CALM: '😌', FUSSY: '😤', SAD: '😢', TIRED: '😴', ENERGETIC: '⚡' }
    return map[mood] || '😐'
}

export default function ChildFeed() {
    const [children, setChildren] = useState([])
    const [selectedChild, setSelectedChild] = useState(null)
    const [logs, setLogs] = useState([])
    const [todayLog, setTodayLog] = useState(null)
    const [attendance, setAttendance] = useState(null)
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const isParent = user?.role === 'PARENT'

    useEffect(() => {
        const endpoint = isParent ? '/api/parent/my-children' : '/api/children'
        api.get(endpoint)
            .then(r => {
                const list = r.data.data || []
                setChildren(list)
                if (list.length) setSelectedChild(list[0].id)
            })
            .catch(() => {})
    }, [isParent])

    useEffect(() => {
        if (!selectedChild) return
        setLoading(true)

        const today = new Date().toISOString().split('T')[0]
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        const startDate = twoWeeksAgo.toISOString().split('T')[0]

        Promise.all([
            api.get(`/api/health/daily-logs/${selectedChild}`, { params: { start_date: startDate, end_date: today } }),
            api.get(`/api/health/attendance/${selectedChild}/today`).catch(() => ({ data: { data: null } }))
        ]).then(([logsRes, attRes]) => {
            const allLogs = logsRes.data.data || []
            setLogs(allLogs)
            setTodayLog(allLogs.find(l => l.date === today) || null)
            setAttendance(attRes.data.data)
        }).catch(() => {}).finally(() => setLoading(false))
    }, [selectedChild])

    const child = children.find(c => c.id === selectedChild)

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)', padding: '1.2rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Link to="/parent" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>← Dashboard</Link>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
                        <span style={{ color: '#fff', fontWeight: 700 }}>📋 Activity Feed</span>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 820, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.3rem' }}>Activity Feed</h1>
                <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Daily updates from your child's care team.</p>

                {/* Child selector */}
                {children.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {children.map(c => (
                            <button key={c.id} onClick={() => setSelectedChild(c.id)}
                                style={{ padding: '6px 16px', borderRadius: 20, border: `2px solid ${selectedChild === c.id ? '#2563eb' : '#e5e7eb'}`, background: selectedChild === c.id ? '#eff6ff' : '#fff', color: selectedChild === c.id ? '#1d4ed8' : '#6b7280', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                                {c.first_name}
                            </button>
                        ))}
                    </div>
                )}

                {children.length === 0 && !loading && (
                    <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', textAlign: 'center', border: '1px solid #f0f0f0' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>👶</div>
                        <div style={{ color: '#6b7280', fontWeight: 600, marginBottom: '0.4rem' }}>No children linked yet</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Ask your daycare center to approve your link request.</div>
                    </div>
                )}

                {child && (
                    <>
                        {/* Child header card */}
                        <div style={{ background: '#fff', borderRadius: 16, padding: '1.2rem 1.5rem', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: child.photo_url ? 'transparent' : 'linear-gradient(135deg, #2563eb, #8b5cf6)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                                {child.photo_url ? <img src={child.photo_url} alt={child.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : child.first_name?.[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1rem' }}>{child.first_name} {child.last_name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{child.room_name || 'No room assigned'}</div>
                            </div>
                            {attendance && (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Today</div>
                                    {attendance.checked_in_at && (
                                        <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>
                                            In {new Date(attendance.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                    {attendance.checked_out_at && (
                                        <div style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 600 }}>
                                            Out {new Date(attendance.checked_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                    {!attendance.checked_in_at && (
                                        <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Not checked in</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Today's Summary */}
                        {todayLog && (
                            <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', borderRadius: 16, padding: '1.4rem 1.5rem', border: '1px solid #c7d2fe', marginBottom: '1.5rem' }}>
                                <div style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                    ✨ Today's Summary — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                                    {todayLog.mood && (
                                        <div style={{ background: '#fff', borderRadius: 12, padding: '0.7rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.4rem' }}>{moodEmoji(todayLog.mood)}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>Mood</div>
                                            <div style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 700, marginTop: 2 }}>{todayLog.mood}</div>
                                        </div>
                                    )}
                                    {todayLog.nap_records?.length > 0 && (
                                        <div style={{ background: '#fff', borderRadius: 12, padding: '0.7rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.4rem' }}>😴</div>
                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>Naps</div>
                                            <div style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 700, marginTop: 2 }}>{todayLog.nap_records.length} nap{todayLog.nap_records.length > 1 ? 's' : ''}</div>
                                        </div>
                                    )}
                                    {todayLog.meal_logs?.length > 0 && (
                                        <div style={{ background: '#fff', borderRadius: 12, padding: '0.7rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.4rem' }}>🍽</div>
                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>Meals</div>
                                            <div style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 700, marginTop: 2 }}>{todayLog.meal_logs[0]?.amount_consumed || 'Logged'}</div>
                                        </div>
                                    )}
                                    {todayLog.activity_logs?.length > 0 && (
                                        <div style={{ background: '#fff', borderRadius: 12, padding: '0.7rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.4rem' }}>🎨</div>
                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>Activities</div>
                                            <div style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 700, marginTop: 2 }}>{todayLog.activity_logs.length} logged</div>
                                        </div>
                                    )}
                                </div>
                                {todayLog.notes && (
                                    <div style={{ marginTop: '0.8rem', background: '#fff', borderRadius: 10, padding: '0.7rem 1rem', fontSize: '0.85rem', color: '#374151', fontStyle: 'italic' }}>
                                        "{todayLog.notes}"
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Log history */}
                        {loading ? (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Loading activity...</div>
                        ) : logs.length === 0 ? (
                            <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', textAlign: 'center', border: '1px solid #f0f0f0', color: '#9ca3af' }}>
                                No activity logged yet for the past 2 weeks.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <h2 style={{ fontWeight: 700, color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Recent Logs</h2>
                                {logs.map(log => (
                                    <div key={log.id || log.date} style={{ background: '#fff', borderRadius: 14, padding: '1rem 1.4rem', border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: log.notes ? 8 : 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: '1.1rem' }}>{log.mood ? moodEmoji(log.mood) : '📋'}</span>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem' }}>
                                                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                                        {[
                                                            log.meal_logs?.length && `${log.meal_logs.length} meal`,
                                                            log.nap_records?.length && `${log.nap_records.length} nap`,
                                                            log.activity_logs?.length && `${log.activity_logs.length} activity`,
                                                        ].filter(Boolean).join(' · ') || 'Daily log'}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to={`/children/${selectedChild}`} style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Details →</Link>
                                        </div>
                                        {log.notes && (
                                            <div style={{ fontSize: '0.83rem', color: '#6b7280', marginTop: 8, borderTop: '1px solid #f3f4f6', paddingTop: 8, fontStyle: 'italic' }}>
                                                "{log.notes}"
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
