import { useEffect, useRef, useState } from 'react'

export default function useWebSocket(url) {
    const [data, setData] = useState(null)
    const [status, setStatus] = useState('connecting')
    const [error, setError] = useState(null)
    const ws = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (!token || !url) return

        try {
            const wsUrl = `${url}?token=${token}`
            ws.current = new WebSocket(wsUrl)

            ws.current.onopen = () => {
                setStatus('connected')
                setError(null)
            }

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    setData(message)
                } catch (e) {
                    console.error('WebSocket message parse error:', e)
                }
            }

            ws.current.onerror = (err) => {
                setStatus('error')
                setError(err.message || 'WebSocket error')
                console.error('WebSocket error:', err)
            }

            ws.current.onclose = () => {
                setStatus('disconnected')
            }

            return () => {
                if (ws.current) {
                    ws.current.close()
                }
            }
        } catch (err) {
            setError(err.message)
            setStatus('error')
        }
    }, [url])

    const send = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message))
        }
    }

    return { data, status, error, send }
}
