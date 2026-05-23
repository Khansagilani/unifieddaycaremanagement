import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ChildrenList() {
    const [children, setChildren] = useState([])
    const { user } = useAuth()
    const navigate = useNavigate()
    const isParent = user?.role === 'PARENT'

    useEffect(() => {
        const endpoint = isParent ? '/api/parent/my-children' : '/api/children'
        api.get(endpoint)
            .then(r => setChildren(r.data.data || []))
            .catch(() => { })
    }, [isParent])

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)', padding: '1.2rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '1.1rem' }}>NestCare</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem' }}>← Back</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' }}>
                    {isParent ? 'My Children' : 'All Children'}
                </h1>

                {children.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#9ca3af', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>👶</div>
                        <div style={{ fontWeight: 600 }}>{isParent ? 'No children linked yet' : 'No children registered yet'}</div>
                        {isParent && <div style={{ fontSize: '0.85rem', marginTop: 6 }}>Go to your dashboard to send a connection request.</div>}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                        {children.map(c => (
                            <Link to={`/children/${c.id}`} key={c.id} style={{
                                display: 'block', background: '#fff', borderRadius: 16, padding: '1.2rem 1.5rem',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', textDecoration: 'none',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                    <div style={{
                                        width: 46, height: 46, borderRadius: '50%',
                                        background: c.photo_url ? `url(${c.photo_url}) center/cover` : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: '1rem'
                                    }}>
                                        {!c.photo_url && `${c.first_name?.[0]}${c.last_name?.[0]}`}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{c.first_name} {c.last_name}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{c.room_name || 'No room assigned'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <span style={{ background: '#dbeafe', color: '#2563eb', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600 }}>{c.gender}</span>
                                    <span style={{ background: c.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6', color: c.status === 'ACTIVE' ? '#16a34a' : '#6b7280', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600 }}>{c.status || 'ACTIVE'}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
