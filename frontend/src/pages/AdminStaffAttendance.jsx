import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function AdminStaffAttendance() {
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [summary, setSummary] = useState([])
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)

    const daysInMonth = new Date(year, month, 0).getDate()
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [sumRes, recRes] = await Promise.all([
                api.get('/api/admin/staff-attendance/summary', { params: { year, month } }),
                api.get('/api/admin/staff-attendance', { params: { year, month } }),
            ])
            setSummary(sumRes.data.data || [])
            setRecords(recRes.data.data || [])
        } catch { }
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [year, month])

    // Build a map: staff_id → { day → record }
    const recordMap = {}
    for (const r of records) {
        if (!recordMap[r.staff_id]) recordMap[r.staff_id] = {}
        const day = new Date(r.date).getDate()
        recordMap[r.staff_id][day] = r
    }

    const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

    const totalStaff = summary.length
    const presentToday = records.filter(r => r.date === today.toISOString().split('T')[0] && r.checked_in_at).length

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Link to="/admin" style={{ color: '#6b7280', fontSize: '0.88rem', textDecoration: 'none' }}>← Admin</Link>
                        <span style={{ color: '#d1d5db' }}>|</span>
                        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Staff Attendance</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <select value={month} onChange={e => setMonth(Number(e.target.value))}
                            style={{ padding: '7px 12px', borderRadius: 9, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', background: '#fff' }}>
                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2020} max={2100}
                            style={{ width: 80, padding: '7px 10px', borderRadius: 9, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', background: '#fff' }} />
                    </div>
                </div>

                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total Staff', value: totalStaff, icon: '👥', color: '#2563eb', bg: '#eff6ff' },
                        { label: 'Present Today', value: presentToday, icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
                        { label: 'Month', value: `${MONTHS[month - 1].slice(0, 3)} ${year}`, icon: '📅', color: '#7c3aed', bg: '#f5f3ff' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '0.9rem 1.1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Per-staff table */}
                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                ) : summary.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No staff found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {summary.map(staff => {
                            const staffRecs = recordMap[staff.staff_id] || {}
                            const isOpen = expanded === staff.staff_id
                            return (
                                <div key={staff.staff_id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                                    {/* Row header */}
                                    <div
                                        onClick={() => setExpanded(isOpen ? null : staff.staff_id)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', cursor: 'pointer', gap: 12 }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                                                {staff.staff_name?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{staff.staff_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{staff.staff_email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>{staff.days_present}</div>
                                                <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Days Present</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>{daysInMonth - staff.days_present}</div>
                                                <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Absent</div>
                                            </div>
                                            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{isOpen ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {/* Expanded: day-by-day dots + times */}
                                    {isOpen && (
                                        <div style={{ padding: '0 1.5rem 1.2rem', borderTop: '1px solid #f3f4f6' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: '1rem' }}>
                                                {dayNumbers.map(day => {
                                                    const rec = staffRecs[day]
                                                    const isPresent = rec && rec.checked_in_at
                                                    const isFuture = new Date(year, month - 1, day) > today
                                                    return (
                                                        <div key={day} title={isPresent ? `In: ${fmtTime(rec.checked_in_at)}${rec.checked_out_at ? ` · Out: ${fmtTime(rec.checked_out_at)}` : ''}` : isFuture ? 'Future' : 'Absent'}
                                                            style={{
                                                                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.72rem', fontWeight: 700,
                                                                background: isFuture ? '#f9fafb' : isPresent ? '#dcfce7' : '#fee2e2',
                                                                color: isFuture ? '#d1d5db' : isPresent ? '#16a34a' : '#dc2626',
                                                                border: `1px solid ${isFuture ? '#f3f4f6' : isPresent ? '#bbf7d0' : '#fecaca'}`,
                                                                cursor: isPresent ? 'help' : 'default'
                                                            }}>
                                                            {day}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8, display: 'flex', gap: 12 }}>
                                                <span><span style={{ color: '#16a34a', fontWeight: 700 }}>■</span> Present</span>
                                                <span><span style={{ color: '#dc2626', fontWeight: 700 }}>■</span> Absent</span>
                                                <span><span style={{ color: '#d1d5db', fontWeight: 700 }}>■</span> Future</span>
                                                <span style={{ marginLeft: 'auto' }}>Hover a day to see check-in/out times</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
