import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

function PayForm({ clientSecret }) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)

    async function handlePay(e) {
        e.preventDefault()
        if (!stripe || !elements) return
        setLoading(true)
        const card = elements.getElement(CardElement)
        const res = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card }
        })
        if (res.error) {
            alert('Payment failed: ' + res.error.message)
        } else {
            alert('Payment succeeded')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handlePay} className="p-4 bg-white rounded">
            <CardElement />
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>Pay</button>
        </form>
    )
}

export default function InvoicePay() {
    const { id } = useParams()
    const [invoice, setInvoice] = useState(null)
    const [clientSecret, setClientSecret] = useState(null)

    useEffect(() => {
        api.get(`/api/billing/invoices?child_id=`).catch(() => { })
        api.get(`/api/billing/invoices`).then(() => { })
        api.get(`/api/billing/invoices`).catch(() => { })
        // get invoice details via list and filter client-side (quick)
        api.get('/api/billing/invoices').then(r => {
            const inv = (r.data.data || []).find(x => x.id == id)
            setInvoice(inv)
        })
    }, [id])

    useEffect(() => {
        if (!invoice) return
        api.post('/api/billing/stripe/create-payment-intent', null, { params: { invoice_id: invoice.id } }).then(r => {
            setClientSecret(r.data.data.client_secret)
        }).catch(() => { })
    }, [invoice])

    if (!invoice) return <div className="p-6">Loading...</div>
    if (!clientSecret) return <div className="p-6">Preparing payment...</div>

    return (
        <div className="p-6">
            <h1 className="text-2xl mb-4">Pay Invoice {invoice.invoice_number}</h1>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PayForm clientSecret={clientSecret} />
            </Elements>
        </div>
    )
}
