import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function AdminDashboard() {
    const [stats, setStats] = useState({ children: 0, invoices: 0, feePlans: 0 })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [childrenRes, invoicesRes, feePlansRes] = await Promise.all([
                    api.get('/api/children'),
                    api.get('/api/billing/invoices'),
                    api.get('/api/billing/fee-plans')
                ])

                setStats({
                    children: childrenRes.data.data.length,
                    invoices: invoicesRes.data.data.length,
                    feePlans: feePlansRes.data.data.length
                })
            } catch (err) {
                console.error('Unable to load admin dashboard stats', err)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-100 p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Active Children</div>
                    <div className="text-4xl font-bold">{stats.children}</div>
                </div>
                <div className="bg-green-100 p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Outstanding Invoices</div>
                    <div className="text-4xl font-bold">{stats.invoices}</div>
                </div>
                <div className="bg-purple-100 p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Fee Plans</div>
                    <div className="text-4xl font-bold">{stats.feePlans}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/admin/children" className="block p-6 rounded-lg shadow bg-white hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">Child Management</h2>
                    <p className="text-gray-600">Create new children, review existing profiles, and manage enrollment details.</p>
                </Link>

                <Link to="/admin/fee-plans" className="block p-6 rounded-lg shadow bg-white hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">Billing & Fee Plans</h2>
                    <p className="text-gray-600">Create fee schedules, issue invoices, and keep billing aligned with center policies.</p>
                </Link>

                <Link to="/admin/staff" className="block p-6 rounded-lg shadow bg-white hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">Staff Management</h2>
                    <p className="text-gray-600">Add and manage staff members, set roles, and track center personnel.</p>
                </Link>

                <Link to="/admin/reports" className="block p-6 rounded-lg shadow bg-white hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">Reports & Analytics</h2>
                    <p className="text-gray-600">View enrollment statistics, revenue tracking, and center performance metrics.</p>
                </Link>

                <Link to="/invoices" className="block p-6 rounded-lg shadow bg-white hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">Invoices</h2>
                    <p className="text-gray-600">Review all invoices and follow payment status for families.</p>
                </Link>

                <Link to="/children" className="block p-6 rounded-lg shadow bg-white hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">Children Directory</h2>
                    <p className="text-gray-600">Browse the full roster and drill into individual child records.</p>
                </Link>
            </div>
        </div>
    )
}
