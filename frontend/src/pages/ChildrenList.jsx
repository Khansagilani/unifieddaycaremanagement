import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export default function ChildrenList() {
  const [children, setChildren] = useState([])

  useEffect(() => {
    api.get('/api/children').then(r => setChildren(r.data.data)).catch(() => {})
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Children</h1>
      <div className="grid grid-cols-3 gap-4">
        {children.map(c => (
          <Link to={`/children/${c.id}`} key={c.id} className="p-4 bg-white rounded shadow">
            <div className="font-semibold">{c.first_name} {c.last_name}</div>
            <div className="text-sm text-gray-500">Room: {c.room_id}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
