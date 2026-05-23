import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const statusBadge = {
    PAID:      { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: 'Paid' },
    OVERDUE:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: 'Overdue' },
    SENT:      { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'Sent' },
    DRAFT:     { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280', label: 'Draft' },
    CANCELLED: { bg: '#fafafa', border: '#e5e7eb', text: '#9ca3af', label: 'Cancelled' },
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function AdminInvoices() {
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [payingId, setPayingId] = useState(null)
    const [sendingId, setSendingId] = useState(null)
    const [feePlans, setFeePlans] = useState([])
    const [activeTab, setActiveTab] = useState('ALL')
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'

    // Generate modal state
    const [showGenModal, setShowGenModal] = useState(false)
    const [genYear, setGenYear] = useState(new Date().getFullYear())
    const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1)
    const [genFeePlan, setGenFeePlan] = useState('')
    const [genLoading, setGenLoading] = useState(false)
    const [genMsg, setGenMsg] = useState('')

    const fetchInvoices = () => {
        api.get('/api/billing/invoices')
            .then(r => setInvoices(r.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchInvoices()
        if (isAdmin) {
            api.get('/api/billing/fee-plans')
                .then(r => setFeePlans(r.data.data || []))
                .catch(() => {})
        }
    }, [isAdmin])

    const handleCashPaid = async (inv) => {
        if (!confirm(`Mark invoice ${inv.invoice_number} as paid by cash?`)) return
        setPayingId(inv.id)
        try {
            await api.post(`/api/billing/invoices/${inv.id}/mark-cash-paid`)
            fetchInvoices()
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to mark as paid')
        }
        setPayingId(null)
    }

    const handleSendToParent = async (inv) => {
        if (!confirm(`Send invoice ${inv.invoice_number} to parent?`)) return
        setSendingId(inv.id)
        try {
            await api.post(`/api/billing/invoices/${inv.id}/send`)
            fetchInvoices()
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to send invoice')
        }
        setSendingId(null)
    }

    const handleGenerate = async () => {
        setGenLoading(true)
        setGenMsg('')
        try {
            const payload = { year: genYear, month: genMonth }
            if (genFeePlan) payload.fee_plan_id = genFeePlan
            const r = await api.post('/api/billing/invoices/generate-monthly', payload)
            const count = (r.data.data || []).length
            setGenMsg(count === 0
                ? 'No new invoices generated (all children already have invoices for this month, or no fee plans found).'
                : `Generated ${count} draft invoice(s) for ${MONTHS[genMonth - 1]} ${genYear}.`)
            fetchInvoices()
        } catch (err) {
            setGenMsg(err.response?.data?.detail || 'Generation failed.')
        }
        setGenLoading(false)
    }

    const tabs = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE']
    const filtered = activeTab === 'ALL' ? invoices : invoices.filter(i => i.status === activeTab)

    const paid = invoices.filter(i => i.status === 'PAID').length
    const unpaid = invoices.filter(i => ['SENT', 'OVERDUE'].includes(i.status)).length
    const draft = invoices.filter(i => i.status === 'DRAFT').length
    const totalDue = invoices.filter(i => !['PAID', 'CANCELLED', 'DRAFT'].includes(i.status))
        .reduce((s, i) => s + parseFloat(i.amount_due || 0), 0)

    const monthLabel = (inv) => {
        if (inv.billing_month && inv.billing_year) return `${inv.billing_month} ${inv.billing_year}`
        if (inv.billing_month) return inv.billing_month
        if (inv.due_date) return new Date(inv.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        return '—'
    }

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Link to={isAdmin ? '/admin' : '/parent'} style={{ color: '#6b7280', fontSize: '0.88rem', textDecoration: 'none' }}>
                            ← {isAdmin ? 'Admin' : 'Dashboard'}
                        </Link>
                        <span style={{ color: '#d1d5db' }}>|</span>
                        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                            {isAdmin ? 'Invoice Management' : 'My Fee Vouchers'}
                        </h1>
                    </div>
                    {isAdmin && (
                        <button onClick={() => { setShowGenModal(true); setGenMsg('') }}
                            style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                            + Generate Monthly
                        </button>
                    )}
                </div>

                {/* Summary cards */}
                {isAdmin && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Total', value: invoices.length, icon: '📄', color: '#2563eb', bg: '#eff6ff' },
                            { label: 'Draft', value: draft, icon: '✏️', color: '#6b7280', bg: '#f9fafb' },
                            { label: 'Unpaid / Overdue', value: unpaid, icon: '⏳', color: '#d97706', bg: '#fffbeb' },
                            { label: 'Paid', value: paid, icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
                            { label: 'Outstanding', value: `PKR ${totalDue.toFixed(0)}`, icon: '💰', color: '#dc2626', bg: '#fef2f2' },
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
                )}

                {/* Status tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {(isAdmin ? tabs : ['ALL', 'SENT', 'PAID', 'OVERDUE']).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                                background: activeTab === t ? '#2563eb' : '#f3f4f6',
                                color: activeTab === t ? '#fff' : '#6b7280' }}>
                            {t === 'ALL' ? 'All' : statusBadge[t]?.label || t}
                            {t === 'ALL' ? ` (${invoices.length})` : ` (${invoices.filter(i => i.status === t).length})`}
                        </button>
                    ))}
                </div>

                {/* Invoice List */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading invoices...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                            {activeTab === 'ALL' ? 'No invoices found.' : `No ${statusBadge[activeTab]?.label || activeTab} invoices.`}
                        </div>
                    ) : (
                        filtered.map((inv, i) => {
                            const badge = statusBadge[inv.status] || statusBadge.DRAFT
                            const isProcessingPay = payingId === inv.id
                            const isProcessingSend = sendingId === inv.id
                            return (
                                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none', flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        {/* Month name — most prominent */}
                                        <div style={{ fontWeight: 800, color: '#1a1a2e', fontSize: '1rem' }}>{monthLabel(inv)}</div>
                                        {inv.child_name && (
                                            <div style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, marginTop: 2 }}>
                                                {inv.child_name}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>
                                            #{inv.invoice_number} &nbsp;·&nbsp; Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            {inv.paid_at && ` · Paid ${new Date(inv.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 800, fontSize: '1rem', color: inv.status === 'PAID' ? '#16a34a' : inv.status === 'OVERDUE' ? '#dc2626' : '#1a1a2e' }}>
                                            PKR {parseFloat(inv.amount_due || 0).toFixed(0)}
                                        </span>

                                        <span style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text, borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                            {badge.label}
                                        </span>

                                        {/* Admin: send DRAFT to parent */}
                                        {isAdmin && inv.status === 'DRAFT' && (
                                            <button onClick={() => handleSendToParent(inv)} disabled={isProcessingSend}
                                                style={{ padding: '5px 12px', background: isProcessingSend ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: isProcessingSend ? 'not-allowed' : 'pointer' }}>
                                                {isProcessingSend ? '...' : 'Send to Parent'}
                                            </button>
                                        )}

                                        {/* Admin: mark as cash paid */}
                                        {isAdmin && ['SENT', 'OVERDUE'].includes(inv.status) && (
                                            <button onClick={() => handleCashPaid(inv)} disabled={isProcessingPay}
                                                style={{ padding: '5px 12px', background: isProcessingPay ? '#9ca3af' : 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: isProcessingPay ? 'not-allowed' : 'pointer' }}>
                                                {isProcessingPay ? '...' : 'Mark Cash Paid'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Generate Monthly Modal */}
            {showGenModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
                        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.2rem', color: '#1a1a2e' }}>Generate Monthly Invoices</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                            <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Month</label>
                                <select value={genMonth} onChange={e => setGenMonth(Number(e.target.value))}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.88rem' }}>
                                    {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Year</label>
                                <input type="number" value={genYear} onChange={e => setGenYear(Number(e.target.value))} min={2020} max={2100}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Fee Plan (optional — uses first plan if not selected)</label>
                            <select value={genFeePlan} onChange={e => setGenFeePlan(e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.88rem' }}>
                                <option value=''>Auto-select</option>
                                {feePlans.map(fp => <option key={fp.id} value={fp.id}>{fp.name} — PKR {parseFloat(fp.monthly_amount).toFixed(0)}/mo</option>)}
                            </select>
                        </div>

                        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#1d4ed8' }}>
                            Invoices will be created as <strong>Draft</strong>. Review and send to parents individually when ready.
                            Due date will be set to the <strong>6th of {MONTHS[genMonth - 1]} {genYear}</strong>.
                        </div>

                        {genMsg && (
                            <div style={{ background: genMsg.includes('No new') ? '#fffbeb' : '#f0fdf4', border: `1px solid ${genMsg.includes('No new') ? '#fde68a' : '#bbf7d0'}`, color: genMsg.includes('No new') ? '#92400e' : '#15803d', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                                {genMsg}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => { setShowGenModal(false); setGenMsg('') }}
                                style={{ padding: '8px 18px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
                                Close
                            </button>
                            <button onClick={handleGenerate} disabled={genLoading}
                                style={{ padding: '8px 20px', borderRadius: 9, border: 'none', background: genLoading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', fontWeight: 700, cursor: genLoading ? 'not-allowed' : 'pointer', fontSize: '0.88rem' }}>
                                {genLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
