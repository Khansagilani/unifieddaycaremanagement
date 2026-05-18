import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

export default function ChildDetail() {
    const { id } = useParams()
    const [profile, setProfile] = useState(null)
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        api.get(`/api/children/${id}/profile`).then(r => setProfile(r.data.data)).catch(() => { })
    }, [id])

    async function handleUpload(e) {
        e.preventDefault()
        if (!file) return
        const fd = new FormData()
        fd.append('file', file)
        fd.append('filename', file.name)
        fd.append('child_id', id)
        setUploading(true)
        try {
            const res = await api.post('/api/media/upload-cloudinary', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            alert('Uploaded')
            // refresh profile
            const r = await api.get(`/api/children/${id}/profile`)
            setProfile(r.data.data)
        } catch (err) {
            alert('Upload failed')
        }
        setUploading(false)
    }

    if (!profile) return <div className="p-6">Loading...</div>

    return (
        <div className="p-6">
            <h1 className="text-2xl">{profile.first_name} {profile.last_name}</h1>
            <div className="mt-4">
                <h2 className="font-semibold">Authorized Pickups</h2>
                <ul>{profile.authorized_pickups.map(p => <li key={p.id}>{p.name} - {p.relationship}</li>)}</ul>
            </div>
            <div className="mt-4">
                <h2 className="font-semibold">Media</h2>
                <div className="grid grid-cols-3 gap-2">
                    {profile.authorized_pickups && profile.authorized_pickups.length === 0 && <div className="text-sm text-gray-500">No media</div>}
                </div>
            </div>

            <form onSubmit={handleUpload} className="mt-6">
                <label className="block mb-2">Upload photo / video</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} />
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
            </form>
        </div>
    )
}
