import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import useWebSocket from '../hooks/useWebSocket'

export default function Attendance() {
    const [children, setChildren] = useState([])
    const [loading, setLoading] = useState(false)

    // WebSocket for real-time attendance updates
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8001'}/api/ws/attendance`
    const { data: wsData, status: wsStatus } = useWebSocket(wsUrl)

    useEffect(() => {
        // Handle incoming WebSocket attendance update
        if (wsData && wsData.type === 'attendance_update') {
            fetchChildren()
        }
    }, [wsData])

    useEffect(() => {
        fetchChildren()
    }, [])

    const fetchChildren = async () => {
        try {
            const res = await api.get('/api/children')
            setChildren(res.data.data || [])
        } catch (err) {
            console.error('Error fetching children:', err)
        }
    }

    const handleCheckIn = async (childId) => {
        setLoading(true)
        try {
            await api.post('/api/health/attendance/check-in', {
                child_id: childId,
                check_in_time: new Date().toISOString()
            })
            fetchChildren()
        } catch (err) {
            alert('Error checking in: ' + err.message)
        }
        setLoading(false)
    }

    const handleCheckOut = async (childId) => {
        setLoading(true)
        try {
            await api.post('/api/health/attendance/check-out', {
                child_id: childId,
                check_out_time: new Date().toISOString()
            })
            fetchChildren()
        } catch (err) {
            alert('Error checking out: ' + err.message)
        }
        setLoading(false)
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Attendance Check-In/Out</h1>
                <div className="text-sm">
                    {wsStatus === 'connected' ? (
                        <span className="text-green-600">● Live</span>
                    ) : (
                        <span className="text-gray-500">○ {wsStatus}</span>
                    )}
                </div>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-gray-700">📱 QR Scanner Placeholder: In production, scan QR code on child badge to check in/out automatically.</p>
            </div>

            <div className="space-y-3">
                {children.map(child => {
                    const todayAttendance = child.attendance?.find(a =>
                        new Date(a.date).toDateString() === new Date().toDateString()
                    )
                    const checkedIn = todayAttendance?.checked_in_at
                    const checkedOut = todayAttendance?.checked_out_at

                    return (
                        <div key={child.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                            <div>
                                <div className="font-semibold">{child.first_name} {child.last_name}</div>
                                <div className="text-sm text-gray-600">{child.classroom}</div>
                                {checkedIn && (
                                    <div className="text-xs text-green-600">
                                        ✓ Checked in at {new Date(checkedIn).toLocaleTimeString()}
                                    </div>
                                )}
                                {checkedOut && (
                                    <div className="text-xs text-red-600">
                                        ✓ Checked out at {new Date(checkedOut).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {!checkedIn ? (
                                    <button
                                        onClick={() => handleCheckIn(child.id)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Check In
                                    </button>
                                ) : !checkedOut ? (
                                    <button
                                        onClick={() => handleCheckOut(child.id)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Check Out
                                    </button>
                                ) : (
                                    <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded cursor-default">Complete</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
