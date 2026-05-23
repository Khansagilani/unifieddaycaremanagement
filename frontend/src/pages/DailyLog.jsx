import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

const initialForm = {
    mood: '',
    notes: '',
    nap_start: '',
    nap_end: '',
    meal_type: 'LUNCH',
    meal_amount: '',
    activity: '',
    diaper_type: '',
    potty_type: '',
    incident: ''
}

export default function DailyLog() {
    const [children, setChildren] = useState([])
    const [selectedChild, setSelectedChild] = useState('')
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState(initialForm)
    const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
    const { logout } = useAuth()
    const navigate = useNavigate()
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        api.get('/api/children')
            .then(r => {
                const list = r.data.data || []
                setChildren(list)
                if (list.length) setSelectedChild(list[0].id)
            })
            .catch(() => { })
    }, [])

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedChild) return
        setLoading(true)
        setStatus(null)
        try {
            await api.post('/api/health/daily-logs', {
                child_id: selectedChild,
                log_date: today,
                mood: form.mood || undefined,
                notes: form.notes || undefined
            })

            const sub = (url, body) => api.post(url, body).catch(() => { })

            if (form.nap_start) {
                await sub(`/api/health/daily-logs/${selectedChild}/${today}/naps`, {
                    start_time: form.nap_start,
                    end_time: form.nap_end || undefined,
                    duration_minutes: form.nap_end
                        ? Math.round((new Date(`2000-01-01T${form.nap_end}`) - new Date(`2000-01-01T${form.nap_start}`)) / 60000)
                        : undefined
                })
            }
            if (form.meal_amount) {
                await sub(`/api/health/daily-logs/${selectedChild}/${today}/meals`, {
                    meal_type: form.meal_type,
                    amount_consumed: form.meal_amount,
                    meal_time: new Date().toISOString()
                })
            }
            if (form.activity) {
                await sub(`/api/health/daily-logs/${selectedChild}/${today}/activities`, {
                    activity_name: form.activity,
                    notes: 'Logged by staff'
                })
            }
            if (form.diaper_type) {
                await sub(`/api/health/daily-logs/${selectedChild}/${today}/diapers`, {
                    diaper_type: form.diaper_type,
                    change_time: new Date().toISOString()
                })
            }
            if (form.potty_type) {
                await sub(`/api/health/daily-logs/${selectedChild}/${today}/potty`, {
                    potty_type: form.potty_type,
                    attempt_time: new Date().toISOString()
                })
            }
            if (form.incident) {
                await sub(`/api/health/${selectedChild}/incidents`, {
                    description: form.incident,
                    severity: 'LOW',
                    incident_type: 'OTHER',
                    action_taken: 'Staff notified parent',
                    occurred_at: new Date().toISOString()
                })
            }

            setStatus({ type: 'success', msg: 'Daily log saved successfully!' })
            setForm(initialForm)
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.detail || 'Error saving log. Please try again.' })
        }
        setLoading(false)
    }

    const selectedChildObj = children.find(c => c.id === selectedChild)

    const fieldStyle = { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.9rem', background: '#fafafa', boxSizing: 'border-box', outline: 'none' }
    const labelStyle = { fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 5 }
    const sectionStyle = { background: '#fff', borderRadius: 14, padding: '1.2rem 1.4rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)', padding: '1.2rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link to="/staff" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>← Dashboard</Link>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>📝 Daily Report</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Link to="/staff/attendance" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Attendance</Link>
                        <Link to="/staff/messages" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Messages</Link>
                        <button onClick={() => { logout(); navigate('/') }} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.3rem' }}>Daily Report</h1>
                <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.5rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                {status && (
                    <div style={{ background: status.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`, color: status.type === 'success' ? '#15803d' : '#dc2626', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
                        {status.type === 'success' ? '✅' : '❌'} {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Child Selector */}
                    <div style={sectionStyle}>
                        <label style={labelStyle}>Select Child</label>
                        <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} style={fieldStyle} required>
                            <option value="">-- Choose a child --</option>
                            {children.map(c => (
                                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} {c.room_name ? `(${c.room_name})` : ''}</option>
                            ))}
                        </select>
                        {selectedChildObj && (
                            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: selectedChildObj.photo_url ? 'transparent' : 'linear-gradient(135deg, #0d9488, #7c3aed)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                    {selectedChildObj.photo_url ? <img src={selectedChildObj.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedChildObj.first_name?.[0]}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e' }}>{selectedChildObj.first_name} {selectedChildObj.last_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>DOB: {selectedChildObj.date_of_birth} · {selectedChildObj.room_name || 'No room'}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mood & Notes */}
                    <div style={sectionStyle}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '0.8rem', fontSize: '0.95rem' }}>😊 Mood & General Notes</div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>Mood Today</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {['HAPPY', 'CALM', 'FUSSY', 'SAD', 'TIRED', 'ENERGETIC'].map(m => (
                                    <button key={m} type="button" onClick={() => set('mood', m)}
                                        style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${form.mood === m ? '#0d9488' : '#e5e7eb'}`, background: form.mood === m ? '#f0fdfa' : '#fff', color: form.mood === m ? '#0d9488' : '#6b7280', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Notes for Parents</label>
                            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...fieldStyle, height: 80, resize: 'vertical' }} placeholder="Share anything worth noting about today..." />
                        </div>
                    </div>

                    {/* Nap */}
                    <div style={sectionStyle}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '0.8rem', fontSize: '0.95rem' }}>😴 Nap</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Start Time</label>
                                <input type="time" value={form.nap_start} onChange={e => set('nap_start', e.target.value)} style={fieldStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>End Time</label>
                                <input type="time" value={form.nap_end} onChange={e => set('nap_end', e.target.value)} style={fieldStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Meals */}
                    <div style={sectionStyle}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '0.8rem', fontSize: '0.95rem' }}>🍽 Meal</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Meal Type</label>
                                <select value={form.meal_type} onChange={e => set('meal_type', e.target.value)} style={fieldStyle}>
                                    <option value="BREAKFAST">Breakfast</option>
                                    <option value="LUNCH">Lunch</option>
                                    <option value="SNACK">Snack</option>
                                    <option value="DINNER">Dinner</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Amount Eaten</label>
                                <select value={form.meal_amount} onChange={e => set('meal_amount', e.target.value)} style={fieldStyle}>
                                    <option value="">-- Select --</option>
                                    <option value="FULL">Full</option>
                                    <option value="MOST">Most</option>
                                    <option value="HALF">Half</option>
                                    <option value="LITTLE">A little</option>
                                    <option value="NONE">None</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Activities */}
                    <div style={sectionStyle}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '0.8rem', fontSize: '0.95rem' }}>🎨 Activities</div>
                        <label style={labelStyle}>What did they do today?</label>
                        <input value={form.activity} onChange={e => set('activity', e.target.value)} style={fieldStyle} placeholder="e.g., Painting, Storytime, Sandbox play" />
                    </div>

                    {/* Diaper / Potty */}
                    <div style={sectionStyle}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '0.8rem', fontSize: '0.95rem' }}>🚼 Diaper / Potty</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Diaper Change</label>
                                <select value={form.diaper_type} onChange={e => set('diaper_type', e.target.value)} style={fieldStyle}>
                                    <option value="">-- None --</option>
                                    <option value="WET">Wet</option>
                                    <option value="SOILED">Soiled</option>
                                    <option value="BOTH">Both</option>
                                    <option value="DRY">Dry / No change</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Potty</label>
                                <select value={form.potty_type} onChange={e => set('potty_type', e.target.value)} style={fieldStyle}>
                                    <option value="">-- None --</option>
                                    <option value="WET">Wet</option>
                                    <option value="BM">BM</option>
                                    <option value="BOTH">Both</option>
                                    <option value="DRY">Dry / Accident-free</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Incident */}
                    <div style={sectionStyle}>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '0.8rem', fontSize: '0.95rem' }}>⚠️ Incident Report <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.8rem' }}>(optional)</span></div>
                        <textarea value={form.incident} onChange={e => set('incident', e.target.value)} style={{ ...fieldStyle, height: 70, resize: 'vertical' }} placeholder="Describe any incident that occurred..." />
                    </div>

                    <button type="submit" disabled={loading || !selectedChild} style={{ width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.85rem', fontWeight: 700, fontSize: '1rem', cursor: loading || !selectedChild ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                        {loading ? 'Saving...' : 'Save Daily Report'}
                    </button>
                </form>
            </div>
        </div>
    )
}
