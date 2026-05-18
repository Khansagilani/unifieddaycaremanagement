import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function ParentDashboard() {
    const [children, setChildren] = useState([])
    const [recentLogs, setRecentLogs] = useState([])
    const [stats, setStats] = useState({ children: 0, logs: 0, messages: 0 })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const childRes = await api.get('/api/children')
                const childList = childRes.data.data || []
                setChildren(childList)

                const logsRes = await api.get('/api/health-daily/daily-logs')
                const logList = (logsRes.data.data || []).slice(0, 5)
                setRecentLogs(logList)

                const convRes = await api.get('/api/media/conversations')
                const convs = convRes.data.data || []

                setStats({
                    children: childList.length,
                    logs: logList.length,
                    messages: convs.length
                })
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Welcome Back!</h1>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">My Children</div>
                    <div className="text-3xl font-bold">{stats.children}</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Activity Updates</div>
                    <div className="text-3xl font-bold">{stats.logs}</div>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Conversations</div>
                    <div className="text-3xl font-bold">{stats.messages}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <h2 className="font-bold mb-3">Quick Access</h2>
                <div className="flex gap-3 flex-wrap">
                    <Link to="/children" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        View Children
                    </Link>
                    <Link to="/parent/feed" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Activity Feed
                    </Link>
                    <Link to="/parent/messages" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                        Messages
                    </Link>
                    <Link to="/invoices" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                        Invoices
                    </Link>
                </div>
            </div>

            {/* Children Overview */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">My Children</h2>
                {children.length === 0 ? (
                    <p className="text-gray-500">No children added yet</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {children.map(child => (
                            <div key={child.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                                <div className="font-semibold">{child.first_name} {child.last_name}</div>
                                <div className="text-sm text-gray-600">DOB: {child.date_of_birth}</div>
                                <div className="text-sm text-gray-600 mb-2">Classroom: {child.classroom}</div>
                                <a href={`/children/${child.id}`} className="text-blue-600 hover:underline text-sm">
                                    View Profile →
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                {recentLogs.length === 0 ? (
                    <p className="text-gray-500">No activity yet</p>
                ) : (
                    <div className="space-y-3">
                        {recentLogs.map(log => (
                            <div key={log.id} className="p-4 border-l-4 border-blue-400 bg-gray-50 rounded">
                                <div className="font-semibold text-sm mb-1">{log.date}</div>
                                <div className="text-sm text-gray-700">{log.notes?.substring(0, 100) || 'Activity logged'}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
