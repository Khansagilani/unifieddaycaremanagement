import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function InvoicePay() {
    const { id } = useParams()
    const [invoice, setInvoice] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/api/billing/invoices').then(r => {
            const inv = (r.data.data || []).find(x => x.id == id)
            setInvoice(inv)
        }).catch(() => {
            setInvoice(null)
        }).finally(() => {
            setLoading(false)
        })
    }, [id])

    if (loading) return <div className="p-6">Loading invoice...</div>
    if (!invoice) return <div className="p-6">Invoice not found.</div>

    return (
        <div className="p-6">
            <h1 className="text-2xl mb-4">Invoice {invoice.invoice_number}</h1>
            <p className="mb-2">Amount: {(invoice.amount_cents / 100).toFixed(2)} USD</p>
            <p className="mb-2">Due date: {new Date(invoice.due_date).toLocaleDateString()}</p>
            <p className="mb-4 text-gray-600">Payment is currently unavailable. Please contact your daycare to complete this invoice.</p>
            <Link to="/invoices" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Back to invoices</Link>
        </div>
    )
}
