import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function StaffDashboard() {
    const [children, setChildren] = useState([])
    const [logs, setLogs] = useState([])
    const [stats, setStats] = useState({ checkedIn: 0, checkedOut: 0, logs: 0 })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const childRes = await api.get('/api/children')
                const childList = childRes.data.data || []
                setChildren(childList)

                const logsRes = await api.get('/api/health-daily/daily-logs')
                const logList = (logsRes.data.data || []).slice(0, 5)
                setLogs(logList)

                const checked = childList.filter(c => c.attendance?.some(a => a.checked_in_at && !a.checked_out_at)).length
                setStats({
                    checkedIn: checked,
                    checkedOut: childList.length - checked,
                    logs: logList.length
                })
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <div className="text-sm font-gray-600">Checked In Today</div>
                    <div className="text-3xl font-bold">{stats.checkedIn}</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Checked Out</div>
                    <div className="text-3xl font-bold">{stats.checkedOut}</div>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Today's Logs</div>
                    <div className="text-3xl font-bold">{stats.logs}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Children Present</h2>
                    <ul className="space-y-2">
                        {children.slice(0, 5).map(child => (
                            <li key={child.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>{child.first_name} {child.last_name}</span>
                                <span className="text-xs bg-blue-200 px-2 py-1 rounded">{child.classroom}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Recent Daily Logs</h2>
                    <ul className="space-y-2">
                        {logs.map(log => (
                            <li key={log.id} className="text-sm p-2 bg-gray-50 rounded border-l-2 border-blue-400">
                                <div className="font-semibold">{log.date}</div>
                                <div className="text-gray-600 text-xs">{log.notes?.substring(0, 50) || 'No notes'}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="flex gap-2">
                    <a href="/staff/attendance" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Check In/Out
                    </a>
                    <a href="/staff/daily-log" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Add Daily Log
                    </a>
                    <a href="/staff/messages" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                        Messages
                    </a>
                </div>
            </div>
        </div>
    )
}
