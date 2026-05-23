import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

const initialForm = {
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'MALE',
    room_name: '',
    enrollment_date: '',
    registration_number: '',
    photo_url: ''
}

export default function AdminChildren() {
    const [children, setChildren] = useState([])
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [photoUploading, setPhotoUploading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const fileRef = useRef()

    const loadChildren = async () => {
        try {
            const res = await api.get('/api/children')
            setChildren(res.data.data || [])
        } catch (err) {
            console.error('Failed to load children', err)
        }
    }

    useEffect(() => { loadChildren() }, [])

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPhotoUploading(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            fd.append('filename', `child-${Date.now()}`)
            const res = await api.post('/api/media/upload-cloudinary', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const url = res.data?.data?.url || res.data?.data?.file_url
            if (url) {
                setForm(f => ({ ...f, photo_url: url }))
            } else {
                setError('Photo uploaded but URL not returned. Try again.')
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Photo upload failed. Check Cloudinary config.')
        }
        setPhotoUploading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            await api.post('/api/children', {
                first_name: form.first_name,
                last_name: form.last_name,
                date_of_birth: form.date_of_birth,
                gender: form.gender,
                room_name: form.room_name || undefined,
                enrollment_date: form.enrollment_date || undefined,
                registration_number: form.registration_number || undefined,
                photo_url: form.photo_url || undefined
            })
            setSuccess(`${form.first_name} ${form.last_name} added successfully.`)
            setForm(initialForm)
            await loadChildren()
        } catch (err) {
            setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Unable to create child')
        }
        setLoading(false)
    }

    const inp = 'w-full p-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white'
    const lbl = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1'

    return (
        <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <div className="flex items-center gap-3 mb-6">
                <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-800">← Admin</Link>
                <span className="text-gray-300">|</span>
                <h1 className="text-2xl font-bold text-gray-900">Child Management</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                {/* Roster */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">Enrolled Children ({children.length})</h2>
                    </div>
                    {children.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No children enrolled yet.</p>
                    ) : (
                        <div>
                            {children.map((child, i) => (
                                <div key={child.id} className="flex items-center justify-between px-6 py-4" style={{ borderBottom: i < children.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                    <div className="flex items-center gap-3">
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: child.photo_url ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                                            {child.photo_url
                                                ? <img src={child.photo_url} alt={child.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : (child.first_name?.[0] || '?')}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{child.first_name} {child.last_name}</div>
                                            <div className="text-xs text-gray-400">{child.room_name || 'No room'} · {child.gender}</div>
                                            {child.registration_number && (
                                                <div className="text-xs text-gray-300">Reg# {child.registration_number}</div>
                                            )}
                                        </div>
                                    </div>
                                    <Link to={`/children/${child.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                        View →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Child Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-5">Add New Child</h2>

                    {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">❌ {error}</div>}
                    {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">✅ {success}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Photo Upload */}
                        <div>
                            <label className={lbl}>Child Photo</label>
                            <div className="flex items-center gap-3">
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: form.photo_url ? 'transparent' : '#f3f4f6', border: '2px dashed #d1d5db', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {form.photo_url
                                        ? <img src={form.photo_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <span style={{ fontSize: 22 }}>👶</span>}
                                </div>
                                <div className="flex-1">
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={photoUploading}
                                        className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                                        {photoUploading ? 'Uploading...' : form.photo_url ? 'Change Photo' : 'Upload Photo'}
                                    </button>
                                    {form.photo_url && <div className="text-xs text-green-600 mt-1">✓ Photo uploaded</div>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={lbl}>First Name *</label>
                                <input className={inp} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required placeholder="Sarah" />
                            </div>
                            <div>
                                <label className={lbl}>Last Name *</label>
                                <input className={inp} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required placeholder="Khan" />
                            </div>
                        </div>

                        <div>
                            <label className={lbl}>Date of Birth *</label>
                            <input type="date" className={inp} value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} required />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={lbl}>Gender *</label>
                                <select className={inp} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={lbl}>Room</label>
                                <input className={inp} placeholder="Toddler Room" value={form.room_name} onChange={e => setForm({ ...form, room_name: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className={lbl}>Registration Number</label>
                            <input className={inp} placeholder="e.g. NC-2024-001" value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value.toUpperCase() })} style={{ textTransform: 'uppercase', letterSpacing: 1 }} />
                        </div>

                        <div>
                            <label className={lbl}>Enrollment Date</label>
                            <input type="date" className={inp} value={form.enrollment_date} onChange={e => setForm({ ...form, enrollment_date: e.target.value })} />
                        </div>

                        <button type="submit" disabled={loading || photoUploading}
                            className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                            style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #6366f1)', cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Creating...' : 'Create Child'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
