import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import useAuth from '../hooks/useAuth'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await login(email, password)
            const token = res.data.data.access_token
            const refreshToken = res.data.data.refresh_token
            const user = res.data.data.user

            if (!token || !user) {
                setError('Invalid response from server')
                setLoading(false)
                return
            }

            if (user.role !== 'ADMIN') {
                setError('Access denied. This portal is for administrators only.')
                setLoading(false)
                return
            }

            localStorage.setItem('refresh_token', refreshToken)
            useAuth.getState().loginLocal(token, user)
            navigate('/admin')
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed')
        }
        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: '1.5rem',
        }}>
            {/* Subtle background pattern */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none',
                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(16,185,129,0.06) 0%, transparent 50%)',
            }} />

            <div style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '2.5rem',
                width: '100%',
                maxWidth: 400,
                position: 'relative',
            }}>
                {/* Lock icon */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        margin: '0 auto 1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                    }}>
                        🔐
                    </div>
                    <h1 style={{
                        color: '#f8fafc', fontSize: '1.5rem',
                        fontWeight: 800, margin: '0 0 4px',
                        letterSpacing: '-0.02em',
                    }}>
                        NestCare Admin
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: 0 }}>
                        Secure management portal
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#fca5a5',
                        borderRadius: 10,
                        padding: '0.65rem 1rem',
                        fontSize: '0.83rem',
                        marginBottom: '1.2rem',
                        fontWeight: 500,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.72rem', fontWeight: 700,
                            color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                            letterSpacing: '0.1em', marginBottom: 6,
                        }}>
                            Admin Email
                        </label>
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@nestcare.com"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, padding: '0.75rem 1rem',
                                color: '#f8fafc', fontSize: '0.9rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.72rem', fontWeight: 700,
                            color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                            letterSpacing: '0.1em', marginBottom: 6,
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, padding: '0.75rem 1rem',
                                color: '#f8fafc', fontSize: '0.9rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: '#fff', border: 'none', borderRadius: 12,
                            padding: '0.8rem', fontWeight: 700, fontSize: '0.95rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? 'Verifying...' : 'Access Admin Dashboard'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center', marginTop: '1.5rem',
                    fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)',
                }}>
                    This URL is confidential. Do not share.
                </p>
            </div>
        </div>
    )
}
