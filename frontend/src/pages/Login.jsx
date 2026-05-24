import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import useAuth from '../hooks/useAuth'
import { Logo } from '../components/SiteHeader'

const roleThemes = {
    parent: {
        label: 'Parent',
        eyebrow: 'Family portal',
        title: 'Welcome back to your child\'s day.',
        text: 'See daily updates, messages, invoices, and care notes in one calm place.',
        accent: 'from-emerald-500 to-sky-500',
        soft: 'bg-emerald-50',
        ring: 'ring-emerald-100',
        home: '/',
        highlights: ['Daily moments', 'Care team messages', 'Invoices'],
    },
    staff: {
        label: 'Staff',
        eyebrow: 'Classroom tools',
        title: 'Care starts with a smooth sign in.',
        text: 'Check attendance, update daily logs, and message families from your staff workspace.',
        accent: 'from-cyan-500 to-amber-400',
        soft: 'bg-amber-50',
        ring: 'ring-amber-100',
        home: '/staff',
        highlights: ['Attendance', 'Daily logs', 'Messages'],
    },
}

export default function Login() {
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(() => {
        const role = new URLSearchParams(location.search).get('role')?.toLowerCase()
        return roleThemes[role] ? role : 'parent'
    })
    const navigate = useNavigate()
    const theme = useMemo(() => roleThemes[selectedRole] || roleThemes.parent, [selectedRole])

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await login(email, password)
            const token = res.data.data.access_token
            const refreshToken = res.data.data.refresh_token
            const user = res.data.data.user

            if (!token || !user) {
                setError('Invalid response from server')
                setLoading(false)
                return
            }

            if (user.role === 'ADMIN') {
                setError('Admin accounts must use the admin portal to sign in.')
                setLoading(false)
                return
            }

            if (user.role !== selectedRole.toUpperCase()) {
                setError(`This is a ${user.role.toLowerCase()} account. Please choose the ${user.role.toLowerCase()} portal to sign in.`)
                setLoading(false)
                return
            }

            localStorage.setItem('refresh_token', refreshToken)
            useAuth.getState().loginLocal(token, user)

            if (user.role === 'STAFF') navigate('/staff')
            else if (user.role === 'PARENT') navigate('/parent')
            else navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#f7faf8] text-slate-950">
            <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
                <Logo size={40} />
                <Link to="/" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    ← Back to website
                </Link>
            </header>

            <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl items-center gap-10 px-5 pb-12 sm:px-8 lg:grid-cols-[1fr_430px]">
                <section>
                    <p className={`inline-flex rounded-full ${theme.soft} px-4 py-2 text-sm font-bold ring-1 ${theme.ring}`}>
                        {theme.eyebrow}
                    </p>
                    <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.04] tracking-normal sm:text-6xl">
                        {theme.title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                        {theme.text}
                    </p>
                    <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                        {theme.highlights.map((item) => (
                            <div key={item} className="rounded-3xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100">
                                <div className={`mb-4 h-10 w-10 rounded-2xl bg-gradient-to-br ${theme.accent}`} />
                                {item}
                            </div>
                        ))}
                    </div>
                    <p className="mt-8 text-sm text-slate-400">
                        New parent?{' '}
                        <Link to="/register" className="font-bold text-emerald-600 hover:underline">
                            Register your account here
                        </Link>
                    </p>
                </section>

                <section className="rounded-[2rem] bg-white p-5 shadow-2xl shadow-slate-200/80 ring-1 ring-black/5 sm:p-7">
                    <div className="mb-6">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Sign in</p>
                        <h2 className="mt-2 text-3xl font-black">NestCare {theme.label}</h2>
                    </div>

                    {/* Role selector — Parent and Staff only */}
                    <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                        {Object.entries(roleThemes).map(([key, role]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSelectedRole(key)}
                                className={`rounded-xl px-3 py-2 text-sm font-black transition ${selectedRole === key ? `bg-gradient-to-r ${role.accent} text-white shadow-sm` : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                                {error}
                            </div>
                        )}

                        <label className="mb-2 block text-sm font-black text-slate-700">Email address</label>
                        <input
                            className="mb-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                            type="email"
                            autoComplete="email"
                            placeholder={`${theme.label.toLowerCase()}@nestcare.com`}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />

                        <label className="mb-2 block text-sm font-black text-slate-700">Password</label>
                        <input
                            type="password"
                            className="mb-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        <button
                            disabled={loading}
                            className={`w-full rounded-2xl bg-gradient-to-r ${theme.accent} px-5 py-3 font-black text-white shadow-xl shadow-slate-200 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                        >
                            {loading ? 'Signing in...' : `Sign in as ${theme.label}`}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    )
}
