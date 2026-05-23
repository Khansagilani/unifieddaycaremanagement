import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

export default function ParentRegister() {
    const navigate = useNavigate()
    const { loginLocal } = useAuth()
    const [step, setStep] = useState(1) // 1: register, 2: link child
    const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' })
    const [regNumber, setRegNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [linkRequests, setLinkRequests] = useState([])

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await api.post('/api/auth/register-parent', form)
            const { access_token, refresh_token, user } = res.data.data
            loginLocal(access_token, user, refresh_token)
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed')
        }
        setLoading(false)
    }

    const handleLinkChild = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            await api.post('/api/parent/link-request', { registration_number: regNumber })
            setSuccess('Request submitted! The admin will review and approve your request.')
            setRegNumber('')
            // Refresh requests list
            const res = await api.get('/api/parent/link-requests')
            setLinkRequests(res.data.data || [])
        } catch (err) {
            setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Failed to submit request')
        }
        setLoading(false)
    }

    const inputStyle = {
        width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #e5e7eb',
        borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box',
        outline: 'none', background: '#fafafa'
    }

    const labelStyle = {
        fontSize: '0.78rem', fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 5
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <div style={{ position: 'absolute', top: 60, right: 80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(16,185,129,0.06)' }} />
            <div style={{ position: 'absolute', bottom: 40, left: 60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.06)' }} />

            <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 440, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', position: 'relative' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #10b981, #6366f1)', margin: '0 auto 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌿</div>
                    <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>NestCare</h1>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: 4 }}>Parent Portal</p>
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '2rem' }}>
                    {[1, 2].map(s => (
                        <React.Fragment key={s}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700,
                                background: step >= s ? '#10b981' : '#f3f4f6',
                                color: step >= s ? '#fff' : '#9ca3af'
                            }}>{s}</div>
                            {s < 2 && <div style={{ width: 40, height: 2, background: step > s ? '#10b981' : '#f3f4f6', borderRadius: 2 }} />}
                        </React.Fragment>
                    ))}
                </div>

                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '0.65rem 1rem', fontSize: '0.85rem', marginBottom: 16 }}>❌ {error}</div>}
                {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, padding: '0.65rem 1rem', fontSize: '0.85rem', marginBottom: 16 }}>✅ {success}</div>}

                {/* STEP 1: Register */}
                {step === 1 && (
                    <>
                        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' }}>Create your account</h2>
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input style={inputStyle} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required placeholder="Sarah Khan" />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="sarah@example.com" />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone (optional)</label>
                                <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 0000000" />
                            </div>
                            <div>
                                <label style={labelStyle}>Password</label>
                                <input type="password" style={inputStyle} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 8 characters" />
                            </div>
                            <button type="submit" disabled={loading} style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                                {loading ? 'Creating account...' : 'Create Account →'}
                            </button>
                        </form>
                        <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            Already have an account? <Link to="/login" style={{ color: '#10b981', fontWeight: 600 }}>Sign in</Link>
                        </p>
                    </>
                )}

                {/* STEP 2: Link Child */}
                {step === 2 && (
                    <>
                        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.5rem' }}>Link your child</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Enter the registration number provided by your daycare center.</p>

                        <form onSubmit={handleLinkChild} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Child Registration Number</label>
                                <input
                                    style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, fontSize: '1rem' }}
                                    value={regNumber}
                                    onChange={e => setRegNumber(e.target.value.toUpperCase())}
                                    required
                                    placeholder="e.g. NC-2024-001"
                                />
                            </div>
                            <button type="submit" disabled={loading} style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>

                        {/* Existing requests */}
                        {linkRequests.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Your Requests</p>
                                {linkRequests.map(r => (
                                    <div key={r.id} style={{ background: '#f9fafb', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: 8, border: '1px solid #f0f0f0' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.child_name}</div>
                                        <div style={{ fontSize: '0.78rem', color: r.status === 'APPROVED' ? '#15803d' : r.status === 'REJECTED' ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                                            {r.status === 'APPROVED' ? '✅ Approved' : r.status === 'REJECTED' ? '❌ Rejected — try again' : '⏳ Pending approval'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
                            <button onClick={() => navigate('/parent')} style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: '0.65rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                                Skip for now
                            </button>
                            <button onClick={() => navigate('/parent')} style={{ flex: 1, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                                Go to Dashboard
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
