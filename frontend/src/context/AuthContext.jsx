import { createContext, useState, useContext, useEffect } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('token')

        if (storedUser && token) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (credentials) => {
        const data = await authService.login(credentials)
        setUser(data.user)
        return data
    }

    const register = async (userData) => {
        const data = await authService.register(userData)
        setUser(data.user)
        return data
    }

    const logout = () => {
        authService.logout()
        setUser(null)
    }

    const updateUser = (userData) => {
        setUser(userData)
    }

    const value = {
        user,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        loading
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
