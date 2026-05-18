import React, { useEffect, useState } from 'react'
import api from '../api/axios'

const initialForm = {
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'MALE',
    room_id: '',
    enrollment_date: ''
}

export default function AdminChildren() {
    const [children, setChildren] = useState([])
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const loadChildren = async () => {
        try {
            const res = await api.get('/api/children')
            setChildren(res.data.data || [])
        } catch (err) {
            console.error('Failed to load children', err)
        }
    }

    useEffect(() => {
        loadChildren()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await api.post('/api/children', {
                first_name: form.first_name,
                last_name: form.last_name,
                date_of_birth: form.date_of_birth,
                gender: form.gender,
                room_id: Number(form.room_id),
                enrollment_date: form.enrollment_date || undefined
            })
            setForm(initialForm)
            await loadChildren()
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Unable to create child')
        }
        setLoading(false)
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Child Management</h1>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Roster</h2>
                    {children.length === 0 ? (
                        <p className="text-gray-500">No children found yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {children.map((child) => (
                                <div key={child.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="font-semibold">{child.first_name} {child.last_name}</div>
                                    <div className="text-sm text-gray-600">Room {child.room_id} · {child.gender}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Add New Child</h2>
                    {error && <div className="mb-4 text-red-600">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1">First name</label>
                            <input
                                className="w-full p-2 border rounded"
                                value={form.first_name}
                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Last name</label>
                            <input
                                className="w-full p-2 border rounded"
                                value={form.last_name}
                                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Date of birth</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded"
                                value={form.date_of_birth}
                                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Gender</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">Room ID</label>
                            <input
                                className="w-full p-2 border rounded"
                                value={form.room_id}
                                onChange={(e) => setForm({ ...form, room_id: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Enrollment date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded"
                                value={form.enrollment_date}
                                onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
                            {loading ? 'Saving...' : 'Create Child'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
