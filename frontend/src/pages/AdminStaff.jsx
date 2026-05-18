import React, { useEffect, useState } from 'react'
import api from '../api/axios'

const initialForm = {
    email: '',
    full_name: '',
    phone: '',
    password: '',
    role: 'STAFF'
}

export default function AdminStaff() {
    const [staff, setStaff] = useState([])
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const loadStaff = async () => {
        try {
            const res = await api.get('/api/users?role=STAFF')
            setStaff(res.data.data || [])
        } catch (err) {
            console.error('Failed to load staff', err)
            setStaff([])
        }
    }

    useEffect(() => {
        loadStaff()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await api.post('/api/auth/register', {
                email: form.email,
                password: form.password,
                full_name: form.full_name,
                phone: form.phone || undefined,
                role: form.role
            })
            setForm(initialForm)
            await loadStaff()
        } catch (err) {
            setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Unable to create staff member')
        }
        setLoading(false)
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Staff Management</h1>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Current Staff</h2>
                    {staff.length === 0 ? (
                        <p className="text-gray-500">No staff members added yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {staff.map((member) => (
                                <div key={member.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="font-semibold">{member.full_name}</div>
                                    <div className="text-sm text-gray-600">{member.email}</div>
                                    <div className="text-sm text-gray-500">{member.phone || 'No phone'}</div>
                                    <div className="text-xs text-gray-400 mt-2">Added {new Date(member.created_at).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Add Staff Member</h2>
                    {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm">Email</label>
                            <input
                                type="email"
                                className="w-full p-2 border rounded text-sm"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Full name</label>
                            <input
                                className="w-full p-2 border rounded text-sm"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Phone</label>
                            <input
                                className="w-full p-2 border rounded text-sm"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded text-sm"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Role</label>
                            <select
                                className="w-full p-2 border rounded text-sm"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm">
                            {loading ? 'Saving...' : 'Add Staff Member'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
