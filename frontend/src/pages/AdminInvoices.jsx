import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export default function AdminInvoices() {
    const [invoices, setInvoices] = useState([])

    useEffect(() => {
        api.get('/api/billing/invoices').then(r => setInvoices(r.data.data)).catch(() => { })
    }, [])

    return (
        <div className="p-6">
            <h1 className="text-2xl mb-4">Invoices</h1>
            <div className="space-y-2">
                {invoices.map(inv => (
                    <div key={inv.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                        <div>
                            <div className="font-semibold">Invoice {inv.invoice_number}</div>
                            <div className="text-sm text-gray-500">Child: {inv.child_id} — Due: {new Date(inv.due_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <Link to={`/invoices/${inv.id}`} className="px-3 py-1 bg-blue-600 text-white rounded">View / Pay</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
