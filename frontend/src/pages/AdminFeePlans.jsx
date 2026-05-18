import React, { useEffect, useState } from 'react'
import api from '../api/axios'

const initialForm = {
    name: '',
    amount_cents: '',
    billing_cycle: 'MONTHLY',
    description: ''
}

export default function AdminFeePlans() {
    const [plans, setPlans] = useState([])
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const loadPlans = async () => {
        try {
            const res = await api.get('/api/billing/fee-plans')
            setPlans(res.data.data || [])
        } catch (err) {
            console.error('Unable to load fee plans', err)
        }
    }

    useEffect(() => {
        loadPlans()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await api.post('/api/billing/fee-plans', {
                name: form.name,
                amount_cents: Number(form.amount_cents),
                billing_cycle: form.billing_cycle,
                description: form.description || undefined
            })
            setForm(initialForm)
            await loadPlans()
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Unable to create fee plan')
        }
        setLoading(false)
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Fee Plan Management</h1>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Existing Fee Plans</h2>
                    {plans.length === 0 ? (
                        <p className="text-gray-500">No fee plans yet. Add one to get started.</p>
                    ) : (
                        <div className="space-y-3">
                            {plans.map((plan) => (
                                <div key={plan.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="font-semibold">{plan.name}</div>
                                    <div className="text-sm text-gray-600">{(plan.amount_cents / 100).toFixed(2)} USD / {plan.billing_cycle.toLowerCase()}</div>
                                    <div className="text-sm text-gray-500">{plan.description || 'No description provided.'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Create Fee Plan</h2>
                    {error && <div className="mb-4 text-red-600">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1">Name</label>
                            <input
                                className="w-full p-2 border rounded"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Amount (cents)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={form.amount_cents}
                                onChange={(e) => setForm({ ...form, amount_cents: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Billing cycle</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={form.billing_cycle}
                                onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="ANNUAL">Annual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">Description</label>
                            <textarea
                                className="w-full p-2 border rounded"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
                            {loading ? 'Saving...' : 'Create Fee Plan'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
