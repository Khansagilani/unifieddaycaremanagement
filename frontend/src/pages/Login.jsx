import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import useAuth from '../hooks/useAuth'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const res = await login(email, password)

            // ✅ res.data.data — your API wraps response in { success, data }
            const token = res.data.data.access_token
            const user = res.data.data.user

            if (!token || !user) {
                setError('Invalid response from server')
                return
            }

            useAuth.getState().loginLocal(token, user)

            if (user.role === 'ADMIN') navigate('/admin')
            else if (user.role === 'STAFF') navigate('/staff')
            else if (user.role === 'PARENT') navigate('/parent')
            else navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed')
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">NestCare Login</h2>
                {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}
                <label className="block mb-1 text-sm font-medium">Email</label>
                <input className="w-full p-2 border rounded mb-4" value={email} onChange={e => setEmail(e.target.value)} />
                <label className="block mb-1 text-sm font-medium">Password</label>
                <input type="password" className="w-full p-2 border rounded mb-6" value={password} onChange={e => setPassword(e.target.value)} />
                <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Sign In</button>
            </form>
        </div>
    )
}