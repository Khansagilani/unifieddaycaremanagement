import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, me as meApi } from '../api/auth'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const { setUser } = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const res = await login(email, password)
            const token = res.data.access_token
            localStorage.setItem('access_token', token)
            // load user
            const meRes = await meApi()
            if (meRes && meRes.data) {
                setUser(meRes.data)
            }
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Login failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96">
                <h2 className="text-2xl mb-4">Login</h2>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <label className="block mb-2">Email</label>
                <input className="w-full p-2 border mb-4" value={email} onChange={e => setEmail(e.target.value)} />
                <label className="block mb-2">Password</label>
                <input type="password" className="w-full p-2 border mb-4" value={password} onChange={e => setPassword(e.target.value)} />
                <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
            </form>
        </div>
    )
}
