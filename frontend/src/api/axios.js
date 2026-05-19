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

// Response interceptor to handle 401 and try refresh
api.interceptors.response.use(
    (r) => r,
    async (error) => {
        try {
            const status = error.response ? error.response.status : null
            if (status === 401) {
                // attempt refresh
                const refreshRes = await api.post('/api/auth/refresh')
                if (refreshRes && refreshRes.data && refreshRes.data.access_token) {
                    localStorage.setItem('access_token', refreshRes.data.access_token)
                    error.config.headers.Authorization = `Bearer ${refreshRes.data.access_token}`
                    return api.request(error.config)
                }
            }
        } catch (e) { }
        return Promise.reject(error)
    }
)

export default api
