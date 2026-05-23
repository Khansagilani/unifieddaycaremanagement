import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

const statusColor = {
    PAID: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    OVERDUE: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    SENT: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    DRAFT: { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },
    CANCELLED: { bg: '#fafafa', border: '#e5e7eb', text: '#9ca3af' },
}

export default function InvoicePay() {
    const { id } = useParams()
    const [invoice, setInvoice] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()

    const fetchInvoice = async () => {
        try {
            const r = await api.get('/api/billing/invoices')
            const inv = (r.data.data || []).find(x => x.id === id)
            setInvoice(inv || null)
        } catch {
            setInvoice(null)
        }
        setLoading(false)
    }

    useEffect(() => { fetchInvoice() }, [id])

    const handleCashPaid = async () => {
        if (!confirm('Mark this invoice as paid by cash? This cannot be undone.')) return
        setPaying(true)
        setError(null)
        try {
            await api.post(`/api/billing/invoices/${id}/mark-cash-paid`)
            await fetchInvoice()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to mark as paid')
        }
        setPaying(false)
    }

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontFamily: 'system-ui' }}>Loading invoice...</div>
    if (!invoice) return (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <div style={{ color: '#6b7280', marginBottom: '1rem' }}>Invoice not found.</div>
            <Link to="/invoices" style={{ color: '#2563eb' }}>Back to invoices</Link>
        </div>
    )

    const st = statusColor[invoice.status] || statusColor.DRAFT
    const amount = parseFloat(invoice.amount_due || 0).toFixed(2)
    const paid = parseFloat(invoice.amount_paid || 0).toFixed(2)
    const isAdmin = user?.role === 'ADMIN'

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
                <Link to="/invoices" style={{ color: '#6b7280', fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' }}>
                    ← Back to Invoices
                </Link>

                <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Invoice</div>
                                <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginTop: 2 }}>{invoice.invoice_number}</div>
                            </div>
                            <div style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.text, borderRadius: 20, padding: '4px 14px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {invoice.status}
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '1.8rem 2rem' }}>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '0.7rem 1rem', fontSize: '0.85rem', marginBottom: '1.2rem' }}>❌ {error}</div>}

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                            {[
                                { label: 'Amount Due', value: `PKR ${amount}`, bold: true },
                                { label: 'Amount Paid', value: `PKR ${paid}` },
                                { label: 'Due Date', value: new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                invoice.paid_at ? { label: 'Paid On', value: new Date(invoice.paid_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) } : null,
                                invoice.notes ? { label: 'Notes', value: invoice.notes } : null,
                            ].filter(Boolean).map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid #f3f4f6' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{row.label}</span>
                                    <span style={{ fontSize: row.bold ? '1.15rem' : '0.9rem', fontWeight: row.bold ? 800 : 600, color: row.bold ? '#1a1a2e' : '#374151' }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {invoice.status === 'PAID' ? (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>✅</div>
                                <div style={{ color: '#15803d', fontWeight: 700 }}>Invoice Paid</div>
                                <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 4 }}>Thank you — payment recorded.</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {isAdmin && (
                                    <button onClick={handleCashPaid} disabled={paying}
                                        style={{ width: '100%', background: paying ? '#9ca3af' : 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', borderRadius: 14, padding: '0.9rem', fontWeight: 800, fontSize: '1rem', cursor: paying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        {paying ? 'Processing...' : '💵 Mark as Cash Received'}
                                    </button>
                                )}
                                {!isAdmin && (
                                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ color: '#92400e', fontSize: '0.88rem', fontWeight: 600 }}>💳 Online payment coming soon</div>
                                        <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: 4 }}>Please pay at the center and ask staff to record your payment.</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
