import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function ChildFeed() {
    const [children, setChildren] = useState([])
    const [selectedChild, setSelectedChild] = useState(null)
    const [feed, setFeed] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchChildren()
    }, [])

    const fetchChildren = async () => {
        try {
            const res = await api.get('/api/children')
            const childList = res.data.data || []
            setChildren(childList)
            if (childList.length) setSelectedChild(childList[0].id)
        } catch (err) {
            console.error('Error fetching children:', err)
        }
    }

    useEffect(() => {
        if (selectedChild) {
            fetchFeed()
        }
    }, [selectedChild])

    const fetchFeed = async () => {
        setLoading(true)
        try {
            const today = new Date()
            const endDate = today.toISOString().split('T')[0]
            const start = new Date()
            start.setDate(today.getDate() - 14)
            const startDate = start.toISOString().split('T')[0]

            const logsRes = await api.get(`/api/health/daily-logs/${selectedChild}`, {
                params: {
                    start_date: startDate,
                    end_date: endDate
                }
            })
            const logs = (logsRes.data.data || []).map(log => ({
                ...log,
                type: 'daily_log',
                timestamp: log.date
            }))

            // Fetch media for selected child (from child profile)
            const childRes = await api.get(`/api/children/${selectedChild}`)
            const child = childRes.data.data || {}
            const media = (child.media || []).map(m => ({
                ...m,
                type: 'media',
                timestamp: m.created_at
            }))

            // Combine and sort by timestamp
            const combined = [...logs, ...media].sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            )

            setFeed(combined)
        } catch (err) {
            console.error('Error fetching feed:', err)
        }
        setLoading(false)
    }

    const child = children.find(c => c.id === selectedChild)

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Activity Feed</h1>

            {/* Child Selector */}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Select Child</label>
                <select
                    value={selectedChild || ''}
                    onChange={(e) => setSelectedChild(parseInt(e.target.value))}
                    className="w-full border rounded p-2 mb-3"
                >
                    {children.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.first_name} {c.last_name}
                        </option>
                    ))}
                </select>

                {child && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                        <strong>{child.first_name} {child.last_name}</strong> ({child.classroom})
                        <div className="text-xs text-gray-600">DOB: {child.date_of_birth}</div>
                    </div>
                )}
            </div>

            {/* Feed */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading activity...</div>
                ) : feed.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No activity yet</div>
                ) : (
                    feed.map((item, idx) => (
                        <div key={`${item.type}-${item.id || idx}`} className="bg-white p-4 rounded-lg border shadow-sm">
                            {item.type === 'daily_log' && (
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="font-semibold text-blue-600">📋 Daily Log</div>
                                            <div className="text-xs text-gray-500">{item.date}</div>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                            Activity
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-2">
                                        {item.notes || 'Log updated'}
                                    </div>
                                    {item.notes && (
                                        <a
                                            href={`/children/${selectedChild}`}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            View Details →
                                        </a>
                                    )}
                                </div>
                            )}

                            {item.type === 'media' && (
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="font-semibold text-green-600">📸 Photo/Video</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                            Media
                                        </span>
                                    </div>
                                    {item.file_url && (
                                        <div className="mt-2">
                                            {item.file_type?.startsWith('image') ? (
                                                <img
                                                    src={item.file_url}
                                                    alt="Activity"
                                                    className="max-w-xs max-h-48 rounded"
                                                />
                                            ) : (
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View Media →
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {item.description && (
                                        <div className="text-sm text-gray-700 mt-2">
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
