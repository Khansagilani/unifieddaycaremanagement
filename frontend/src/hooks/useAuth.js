import { create } from 'zustand'

export const useAuth = create((set) => ({
    user: null,
    setUser: (u) => set({ user: u }),
    logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        set({ user: null })
    },
    loginLocal: (token, user, refreshToken) => {
        localStorage.setItem('access_token', token)
        localStorage.setItem('user', JSON.stringify(user))
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
        set({ user })
    }
}))

// Initialize from localStorage on app load
const savedUser = localStorage.getItem('user')
if (savedUser) {
    try {
        useAuth.getState().setUser(JSON.parse(savedUser))
    } catch (e) {}
}

export default useAuth