import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function AdminLinkRequests() {
    const [requests, setRequests] = useState([])
    const [filter, setFilter] = useState('PENDING')
    const [loading, setLoading] = useState(false)

    const loadRequests = async () => {
        try {
            const res = await api.get(`/api/admin/link-requests?status=${filter}`)
            setRequests(res.data.data || [])
        } catch (err) {
            console.error('Failed to load requests', err)
        }
    }

    useEffect(() => { loadRequests() }, [filter])

    const handleApprove = async (id) => {
        setLoading(true)
        try {
            await api.post(`/api/admin/link-requests/${id}/approve`)
            await loadRequests()
        } catch (err) {
            alert('Failed to approve')
        }
        setLoading(false)
    }

    const handleReject = async (id) => {
        setLoading(true)
        try {
            await api.post(`/api/admin/link-requests/${id}/reject`)
            await loadRequests()
        } catch (err) {
            alert('Failed to reject')
        }
        setLoading(false)
    }

    const statusColor = { PENDING: '#d97706', APPROVED: '#15803d', REJECTED: '#dc2626' }
    const statusBg = { PENDING: '#fef3c7', APPROVED: '#f0fdf4', REJECTED: '#fef2f2' }

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', padding: '2rem 2rem 2.5rem' }}>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Parent Link Requests
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 4 }}>
                    Approve or reject parent requests to be linked to children
                </p>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
                    {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{
                            background: filter === s ? '#1a1a2e' : '#fff',
                            color: filter === s ? '#fff' : '#6b7280',
                            border: '1px solid #e5e7eb', borderRadius: 8,
                            padding: '0.5rem 1rem', cursor: 'pointer',
                            fontSize: '0.82rem', fontWeight: 600
                        }}>{s}</button>
                    ))}
                </div>

                {requests.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f0f0f0' }}>
                        No {filter.toLowerCase()} requests found
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {requests.map(req => (
                            <div key={req.id} style={{ background: '#fff', borderRadius: 16, padding: '1.2rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                                            {req.parent_name?.[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>{req.parent_name}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{req.parent_email}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                                        Requesting to link to <strong>{req.child_name}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 4 }}>
                                        Reg# {req.registration_number} · {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ background: statusBg[req.status], color: statusColor[req.status], borderRadius: 20, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                                        {req.status}
                                    </span>
                                    {req.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleApprove(req.id)} disabled={loading} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                                                ✅ Approve
                                            </button>
                                            <button onClick={() => handleReject(req.id)} disabled={loading} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                                                ❌ Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
