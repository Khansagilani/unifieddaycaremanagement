let ws = null

export function connectSocket(token) {
    if (ws) return ws
    const url = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000') + '/ws?token=' + encodeURIComponent(token)
    ws = new WebSocket(url)
    ws.onopen = () => console.log('WS connected')
    ws.onclose = () => console.log('WS closed')
    ws.onerror = (e) => console.error('WS error', e)
    ws.onmessage = (evt) => {
        try {
            const payload = JSON.parse(evt.data)
            // dispatch or handle events globally (app will attach handlers)
            window.__NESTCARE_WS && window.__NESTCARE_WS(payload)
        } catch (e) {
            console.error('Invalid WS message', e)
        }
    }
    return ws
}

export function getSocket() {
    return ws
}

export function disconnectSocket() {
    if (ws) {
        ws.close()
        ws = null
    }
}
