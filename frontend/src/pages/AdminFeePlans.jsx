import React, { useEffect, useState } from 'react'
import api from '../api/axios'

const initialForm = {
    name: '',
    monthly_amount: '',
    registration_fee: '',
    sibling_discount: false,
    sibling_discount_pct: '',
    billing_cycle: 'MONTHLY',
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
                monthly_amount: Number(form.monthly_amount),
                registration_fee: form.registration_fee ? Number(form.registration_fee) : undefined,
                sibling_discount: form.sibling_discount,
                sibling_discount_pct: form.sibling_discount_pct ? Number(form.sibling_discount_pct) : undefined,
                billing_cycle: form.billing_cycle,
            })
            setForm(initialForm)
            await loadPlans()
        } catch (err) {
            setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Unable to create fee plan')
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
                                    <div className="text-sm text-gray-600">{Number(plan.monthly_amount).toFixed(2)} USD / {plan.billing_cycle.toLowerCase()}</div>
                                    <div className="text-sm text-gray-500">
                                        Registration fee: {Number(plan.registration_fee || 0).toFixed(2)} USD
                                        {plan.sibling_discount ? ` - Sibling discount ${Number(plan.sibling_discount_pct || 0).toFixed(2)}%` : ''}
                                    </div>
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
                            <label className="block mb-1">Monthly amount</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full p-2 border rounded"
                                value={form.monthly_amount}
                                onChange={(e) => setForm({ ...form, monthly_amount: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Registration fee</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full p-2 border rounded"
                                value={form.registration_fee}
                                onChange={(e) => setForm({ ...form, registration_fee: e.target.value })}
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
                                <option value="DAILY">Daily</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.sibling_discount}
                                    onChange={(e) => setForm({ ...form, sibling_discount: e.target.checked })}
                                />
                                <span>Sibling discount</span>
                            </label>
                        </div>
                        {form.sibling_discount && (
                            <div>
                                <label className="block mb-1">Sibling discount percent</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={form.sibling_discount_pct}
                                    onChange={(e) => setForm({ ...form, sibling_discount_pct: e.target.value })}
                                />
                            </div>
                        )}
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
                            {loading ? 'Saving...' : 'Create Fee Plan'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
