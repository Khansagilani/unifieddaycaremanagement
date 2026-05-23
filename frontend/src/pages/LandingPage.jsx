import React from 'react'
import { Link } from 'react-router-dom'

const roleContent = {
    parent: {
        badge: 'For families',
        title: 'NestCare',
        subtitle: 'A warmer window into every child\'s day.',
        description:
            'Parents can follow attendance, daily moments, invoices, and messages from one calm, trusted place built for childcare connection.',
        primary: 'Parent sign in',
        primaryTo: '/login?role=parent',
        secondary: 'Explore admin',
        secondaryTo: '/admin',
        accent: 'from-emerald-500 to-sky-500',
        bg: 'bg-[#f5fbf7]',
        ink: 'text-emerald-950',
        soft: 'bg-emerald-50',
        ring: 'ring-emerald-100',
        metrics: [
            ['Live updates', 'Daily logs, meals, naps, notes'],
            ['Simple billing', 'Invoices and payment status'],
            ['Secure messages', 'Family and center conversations'],
        ],
        features: ['Today feed', 'Child profiles', 'Invoice payments', 'Care team chat'],
    },
    admin: {
        badge: 'For center leaders',
        title: 'NestCare Admin',
        subtitle: 'A beautiful command center for childcare operations.',
        description:
            'Manage children, staff, attendance, reports, billing, and parent communication before the day gets noisy.',
        primary: 'Admin sign in',
        primaryTo: '/login?role=admin',
        secondary: 'Parent website',
        secondaryTo: '/',
        accent: 'from-teal-500 to-indigo-500',
        bg: 'bg-[#f6f8ff]',
        ink: 'text-slate-950',
        soft: 'bg-indigo-50',
        ring: 'ring-indigo-100',
        metrics: [
            ['Center overview', 'Attendance, revenue, and tasks'],
            ['Staff tools', 'Team access and classroom flow'],
            ['Reports ready', 'Compliance and operational clarity'],
        ],
        features: ['Children', 'Staff', 'Fee plans', 'Reports', 'Invoices'],
    },
    staff: {
        badge: 'For caregivers',
        title: 'NestCare Staff',
        subtitle: 'Fast classroom tools for the people doing the care.',
        description:
            'Staff can check children in, record daily logs, and message families from a focused workspace that stays out of the way.',
        primary: 'Staff sign in',
        primaryTo: '/login?role=staff',
        secondary: 'Parent website',
        secondaryTo: '/',
        accent: 'from-cyan-500 to-amber-400',
        bg: 'bg-[#fbfaf4]',
        ink: 'text-stone-950',
        soft: 'bg-amber-50',
        ring: 'ring-amber-100',
        metrics: [
            ['Quick check-in', 'Attendance without friction'],
            ['Daily logs', 'Meals, naps, mood, and notes'],
            ['Family updates', 'Messages from one place'],
        ],
        features: ['Attendance', 'Daily log', 'Messages', 'Child list'],
    },
}

function PortalPreview({ content, role }) {
    const childNames = role === 'admin' ? ['Rooms full', 'Invoices sent', 'Staff active'] : ['Maya', 'Noah', 'Ayaan']

    return (
        <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-200/80 ring-1 ring-black/5">
            <div className={`absolute inset-x-0 top-0 h-36 bg-gradient-to-r ${content.accent}`} />
            <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between text-white">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">Today</p>
                        <p className="mt-1 text-2xl font-bold">Care overview</p>
                    </div>
                    <div className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
                        8:45 AM
                    </div>
                </div>

                <div className="mt-8 grid gap-4 rounded-3xl bg-white p-4 shadow-xl shadow-slate-900/10">
                    {content.metrics.map(([label, value], index) => (
                        <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                            <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${content.accent}`} />
                            <div>
                                <p className="text-sm font-bold text-slate-950">{label}</p>
                                <p className="text-xs text-slate-500">{value}</p>
                            </div>
                            <div className="ml-auto text-lg font-black text-slate-200">0{index + 1}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                    {childNames.map((name, index) => (
                        <div key={name} className="rounded-3xl bg-white p-4 shadow-lg shadow-slate-200/70 ring-1 ring-slate-100">
                            <div className={`mb-4 h-12 w-12 rounded-full bg-gradient-to-br ${content.accent}`} />
                            <p className="text-sm font-bold text-slate-950">{name}</p>
                            <p className="mt-1 text-xs text-slate-500">{index === 0 ? 'Checked in' : index === 1 ? 'New note' : 'All set'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function LandingPage({ role = 'parent' }) {
    const content = roleContent[role] || roleContent.parent

    return (
        <main className={`min-h-screen ${content.bg} ${content.ink}`}>
            <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
                <Link to="/" className="flex items-center gap-3">
                    <span className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${content.accent} shadow-lg shadow-slate-300`} />
                    <span className="text-lg font-black tracking-tight">NestCare</span>
                </Link>
                <nav className="flex items-center gap-2 text-sm font-semibold">
                    <Link className="rounded-full px-3 py-2 text-slate-600 hover:bg-white hover:text-slate-950" to="/">
                        Parents
                    </Link>
                    <Link className="rounded-full px-3 py-2 text-slate-600 hover:bg-white hover:text-slate-950" to="/admin">
                        Admin
                    </Link>
                    <Link className="rounded-full px-3 py-2 text-slate-600 hover:bg-white hover:text-slate-950" to="/staff">
                        Staff
                    </Link>
                </nav>
            </header>

            <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:pb-20 lg:pt-10">
                <div>
                    <p className={`inline-flex rounded-full ${content.soft} px-4 py-2 text-sm font-bold ring-1 ${content.ring}`}>
                        {content.badge}
                    </p>
                    <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
                        {content.title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-2xl font-bold leading-tight text-slate-700 sm:text-3xl">
                        {content.subtitle}
                    </p>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                        {content.description}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            to={content.primaryTo}
                            className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r ${content.accent} px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5`}
                        >
                            {content.primary}
                        </Link>

                        {/* ADD THIS */}
                        {role === 'parent' && (
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
                            >
                                Parent Registration
                            </Link>
                        )}

                        <Link
                            to={content.secondaryTo}
                            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
                        >
                            {content.secondary}
                        </Link>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-2">
                        {content.features.map((feature) => (
                            <span key={feature} className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                <PortalPreview content={content} role={role} />
            </section>

            <section className="bg-white/70 px-5 py-10 sm:px-8">
                <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
                    {content.metrics.map(([label, value]) => (
                        <div key={label} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <p className="text-lg font-black text-slate-950">{label}</p>
                            <p className="mt-2 leading-7 text-slate-600">{value}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}
