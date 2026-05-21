import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function DailyLog() {
    const [children, setChildren] = useState([])
    const [selectedChild, setSelectedChild] = useState(null)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        naps: '',
        meals: '',
        activities: '',
        diapers: '',
        potty: '',
        incidents: '',
        notes: ''
    })

    useEffect(() => {
        fetchChildren()
    }, [])

    const fetchChildren = async () => {
        try {
            const res = await api.get('/api/children')
            setChildren(res.data.data || [])
            if (res.data.data?.length) setSelectedChild(res.data.data[0].id)
        } catch (err) {
            console.error('Error fetching children:', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedChild) {
            alert('Select a child first')
            return
        }

        setLoading(true)
        const today = new Date().toISOString().split('T')[0]

        try {
            // Step 1: Create the daily log
            await api.post('/api/health/daily-logs', {
                child_id: selectedChild,
                log_date: today,
                notes: form.notes
            })

            // Step 2: Post sub-entries with correct URLs
            if (form.naps) {
                await api.post(`/api/health/daily-logs/${selectedChild}/${today}/naps`, {
                    start_time: form.naps,
                    duration_minutes: 60
                }).catch(() => { })
            }

            if (form.meals) {
                await api.post(`/api/health/daily-logs/${selectedChild}/${today}/meals`, {
                    meal_type: 'LUNCH',
                    amount_consumed: form.meals
                }).catch(() => { })
            }

            if (form.activities) {
                await api.post(`/api/health/daily-logs/${selectedChild}/${today}/activities`, {
                    activity_name: form.activities,
                    notes: 'Staff logged activity'
                }).catch(() => { })
            }

            if (form.diapers) {
                await api.post(`/api/health/daily-logs/${selectedChild}/${today}/diapers`, {
                    diaper_type: form.diapers,
                    notes: 'Diaper change logged'
                }).catch(() => { })
            }

            if (form.potty) {
                await api.post(`/api/health/daily-logs/${selectedChild}/${today}/potty`, {
                    potty_type: form.potty
                }).catch(() => { })
            }

            if (form.incidents) {
                await api.post(`/api/health/${selectedChild}/incidents`, {
                    description: form.incidents,
                    severity: 'LOW',
                    incident_type: 'OTHER'
                }).catch(() => { })
            }

            alert('Daily log saved successfully')
            setForm({ naps: '', meals: '', activities: '', diapers: '', potty: '', incidents: '', notes: '' })
        } catch (err) {
            alert('Error saving log: ' + err.message)
        }
        setLoading(false)
    }

    const child = children.find(c => c.id === selectedChild)

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Daily Log</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Child Selector */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Select Child</label>
                    <select
                        value={selectedChild || ''}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        {children.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.first_name} {c.last_name} ({c.room_name})
                            </option>
                        ))}
                    </select>
                </div>

                {child && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                        <strong>{child.first_name} {child.last_name}</strong> - DOB: {child.date_of_birth}
                    </div>
                )}

                <fieldset className="border p-4 rounded">
                    <legend className="font-semibold">Naps</legend>
                    <input
                        type="time"
                        value={form.naps}
                        onChange={(e) => setForm({ ...form, naps: e.target.value })}
                        className="w-full border rounded p-2"
                    />
                </fieldset>

                <fieldset className="border p-4 rounded">
                    <legend className="font-semibold">Meals</legend>
                    <select
                        value={form.meals}
                        onChange={(e) => setForm({ ...form, meals: e.target.value })}
                        className="w-full border rounded p-2"
                    >
                        <option value="">Select meal consumption</option>
                        <option value="FULL">Full</option>
                        <option value="HALF">Half</option>
                        <option value="LIGHT">Light</option>
                        <option value="NONE">None</option>
                    </select>
                </fieldset>

                <fieldset className="border p-4 rounded">
                    <legend className="font-semibold">Activities</legend>
                    <input
                        type="text"
                        value={form.activities}
                        onChange={(e) => setForm({ ...form, activities: e.target.value })}
                        className="w-full border rounded p-2"
                        placeholder="e.g., Played in sandbox, Art class"
                    />
                </fieldset>

                <fieldset className="border p-4 rounded">
                    <legend className="font-semibold">Diapers</legend>
                    <select
                        value={form.diapers}
                        onChange={(e) => setForm({ ...form, diapers: e.target.value })}
                        className="w-full border rounded p-2"
                    >
                        <option value="">Select diaper type</option>
                        <option value="WET">Wet</option>
                        <option value="SOILED">Soiled</option>
                        <option value="BOTH">Both</option>
                    </select>
                </fieldset>

                <fieldset className="border p-4 rounded">
                    <legend className="font-semibold">Potty</legend>
                    <select
                        value={form.potty}
                        onChange={(e) => setForm({ ...form, potty: e.target.value })}
                        className="w-full border rounded p-2"
                    >
                        <option value="">Select type</option>
                        <option value="WET">Wet</option>
                        <option value="BM">BM</option>
                        <option value="BOTH">Both</option>
                    </select>
                </fieldset>

                <fieldset className="border p-4 rounded">
                    <legend className="font-semibold">Incidents</legend>
                    <textarea
                        value={form.incidents}
                        onChange={(e) => setForm({ ...form, incidents: e.target.value })}
                        className="w-full border rounded p-2"
                        placeholder="e.g., Minor fall, bumped head"
                        rows="3"
                    />
                </fieldset>

                <fieldset className="border p-4 rounded">
                    <legend className="font-semibold">General Notes</legend>
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full border rounded p-2"
                        placeholder="Any other observations or notes for parents"
                        rows="4"
                    />
                </fieldset>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                    {loading ? 'Saving...' : 'Save Daily Log'}
                </button>
            </form>
        </div>
    )
}