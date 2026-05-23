import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
    timeout: 10000,
    withCredentials: true,
})

// Request interceptor (attach access token if present)
api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
        }
    } catch (e) { }
    return config
})

// Response interceptor — handles 401 by attempting token refresh once, then forces re-login
api.interceptors.response.use(
    (r) => r,
    async (error) => {
        const status = error.response?.status
        const isRefreshCall = error.config?.url?.includes('/api/auth/refresh')

        if (status === 401 && !isRefreshCall && !error.config?._retry) {
            error.config._retry = true
            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
                try {
                    const refreshRes = await api.post('/api/auth/refresh', { refresh_token: refreshToken })
                    const refreshData = refreshRes?.data?.data
                    if (refreshData?.access_token) {
                        localStorage.setItem('access_token', refreshData.access_token)
                        if (refreshData.refresh_token) {
                            localStorage.setItem('refresh_token', refreshData.refresh_token)
                        }
                        error.config.headers = error.config.headers || {}
                        error.config.headers.Authorization = `Bearer ${refreshData.access_token}`
                        return api.request(error.config)
                    }
                } catch {
                    // Refresh failed — fall through to force logout
                }
            }
            // No valid refresh token — clear auth state and redirect to login
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default api
