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

// ─── Fee Voucher Component ────────────────────────────────────────────────────
function FeeVoucher({ invoice, onClose }) {
    const handlePrint = () => {
        const printContent = document.getElementById('fee-voucher-print')
        const originalBody = document.body.innerHTML
        document.body.innerHTML = printContent.innerHTML
        window.print()
        document.body.innerHTML = originalBody
        window.location.reload()
    }

    const badge = statusBadge[invoice.status] || statusBadge.DRAFT
    const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
    const issuedDate = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
    const monthYear = invoice.billing_month && invoice.billing_year
        ? `${invoice.billing_month} ${invoice.billing_year}`
        : dueDate

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '1.5rem',
        }}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600,
                maxHeight: '90vh', overflow: 'auto',
                boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            }}>
                {/* Modal controls */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #f0f0f0',
                    position: 'sticky', top: 0, background: '#fff', zIndex: 10,
                }}>
                    <span style={{ fontWeight: 700, color: '#374151' }}>Fee Voucher</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handlePrint} style={{
                            padding: '6px 16px', background: 'linear-gradient(135deg, #0d7c4f, #10b981)',
                            color: '#fff', border: 'none', borderRadius: 8,
                            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                        }}>
                            🖨️ Print Voucher
                        </button>
                        <button onClick={onClose} style={{
                            padding: '6px 14px', background: '#f3f4f6',
                            color: '#374151', border: 'none', borderRadius: 8,
                            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        }}>
                            Close
                        </button>
                    </div>
                </div>

                {/* Printable voucher */}
                <div id="fee-voucher-print">
                    <div style={{ padding: '2rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #0f2044, #1e3a5f)',
                            borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: 'linear-gradient(135deg, #10b981, #0d7c4f)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18,
                                    }}>🌿</div>
                                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>NestCare</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>Early Learning Centre</div>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', marginTop: 4 }}>123 Children Street, DHA Phase 2, Lahore</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fee Voucher</div>
                                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginTop: 2 }}>#{invoice.invoice_number}</div>
                                <div style={{
                                    display: 'inline-block', marginTop: 8,
                                    background: invoice.status === 'PAID' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)',
                                    color: invoice.status === 'PAID' ? '#6ee7b7' : '#fcd34d',
                                    border: `1px solid ${invoice.status === 'PAID' ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
                                    borderRadius: 999, padding: '3px 10px',
                                    fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                                }}>
                                    {badge.label}
                                </div>
                            </div>
                        </div>

                        {/* Child & billing details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <InfoCard label="Student Name" value={invoice.child_name || '—'} />
                            <InfoCard label="Billing Period" value={monthYear} />
                            <InfoCard label="Invoice Date" value={issuedDate} />
                            <InfoCard label="Due Date" value={dueDate} />
                        </div>

                        {/* Fee breakdown */}
                        <div style={{ border: '1.5px solid #e8f0ea', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#f8fdf9', padding: '0.7rem 1.2rem', borderBottom: '1px solid #e8f0ea' }}>
                                <span style={{ fontWeight: 700, color: '#0f2044', fontSize: '0.85rem' }}>Fee Breakdown</span>
                            </div>
                            <div style={{ padding: '0 1.2rem' }}>
                                <FeeRow label="Monthly Tuition Fee" amount={parseFloat(invoice.amount_due || 0)} />
                                {invoice.late_fee > 0 && <FeeRow label="Late Fee" amount={parseFloat(invoice.late_fee)} />}
                                {invoice.discount > 0 && <FeeRow label="Sibling Discount" amount={-parseFloat(invoice.discount)} isDiscount />}
                                <div style={{ borderTop: '1.5px solid #e8f0ea', padding: '0.8rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, color: '#0f2044', fontSize: '0.95rem' }}>Total Amount Due</span>
                                    <span style={{ fontWeight: 900, color: invoice.status === 'PAID' ? '#0d7c4f' : '#dc2626', fontSize: '1.2rem' }}>
                                        PKR {parseFloat(invoice.amount_due || 0).toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment info */}
                        <div style={{ background: '#f8fdf9', border: '1.5px solid #e8f0ea', borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1.2rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f2044', fontSize: '0.82rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment Instructions</div>
                            <div style={{ color: '#5c7060', fontSize: '0.8rem', lineHeight: 1.7 }}>
                                <div>Bank: <strong>Meezan Bank</strong> &nbsp;|&nbsp; Account Title: <strong>NestCare Early Learning</strong></div>
                                <div>Account No: <strong>0123-0123456789</strong> &nbsp;|&nbsp; IBAN: <strong>PK00MEZN0001234567890123</strong></div>
                                <div style={{ marginTop: 4, color: '#92400e', fontWeight: 600 }}>
                                    ⚠️ Please use invoice number #{invoice.invoice_number} as payment reference.
                                </div>
                            </div>
                        </div>

                        {invoice.status === 'PAID' && (
                            <div style={{
                                background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                                borderRadius: 12, padding: '0.8rem 1.2rem',
                                display: 'flex', alignItems: 'center', gap: 8,
                                marginBottom: '1.2rem',
                            }}>
                                <span style={{ fontSize: 18 }}>✅</span>
                                <div>
                                    <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>Payment Received</div>
                                    {invoice.paid_at && (
                                        <div style={{ color: '#166534', fontSize: '0.75rem' }}>
                                            Paid on {new Date(invoice.paid_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.72rem', marginTop: '1rem', borderTop: '1px dashed #e5e7eb', paddingTop: '1rem' }}>
                            NestCare Early Learning Centre · info@nestcaredaycare.com · +92 42 3456 7890
                            <br />This is a computer-generated voucher. For queries contact the center office.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoCard({ label, value }) {
    return (
        <div style={{ background: '#f9fafb', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
            <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem' }}>{value}</div>
        </div>
    )
}

function FeeRow({ label, amount, isDiscount }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#374151', fontSize: '0.85rem' }}>{label}</span>
            <span style={{ fontWeight: 600, color: isDiscount ? '#15803d' : '#1a1a2e', fontSize: '0.85rem' }}>
                {isDiscount ? '-' : ''}PKR {Math.abs(amount).toFixed(0)}
            </span>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminInvoices() {
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [payingId, setPayingId] = useState(null)
    const [sendingId, setSendingId] = useState(null)
    const [feePlans, setFeePlans] = useState([])
    const [activeTab, setActiveTab] = useState('ALL')
    const [voucherInvoice, setVoucherInvoice] = useState(null)
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

                                        {/* View voucher */}
                                        <button onClick={() => setVoucherInvoice(inv)}
                                            style={{ padding: '5px 12px', background: '#f8fdf9', color: '#0d7c4f', border: '1.5px solid #b6e2cb', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                                            📄 Voucher
                                        </button>

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
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Fee Plan (optional)</label>
                            <select value={genFeePlan} onChange={e => setGenFeePlan(e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.88rem' }}>
                                <option value=''>Auto-select</option>
                                {feePlans.map(fp => <option key={fp.id} value={fp.id}>{fp.name} — PKR {parseFloat(fp.monthly_amount).toFixed(0)}/mo</option>)}
                            </select>
                        </div>

                        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#1d4ed8' }}>
                            Invoices will be created as <strong>Draft</strong>. Due date: <strong>6th of {MONTHS[genMonth - 1]} {genYear}</strong>.
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

            {/* Fee Voucher Modal */}
            {voucherInvoice && (
                <FeeVoucher invoice={voucherInvoice} onClose={() => setVoucherInvoice(null)} />
            )}
        </div>
    )
}
