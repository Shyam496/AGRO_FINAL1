import api from './api'

// Mock mode - set to true for standalone demo (no backend needed)
const MOCK_MODE = false

// Mock user data
const MOCK_USER = {
    id: '1',
    email: 'farmer@agromind.com',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    phoneNumber: '+91 98765 43210',
    location: 'Punjab, India',
    role: 'farmer'
}

const MOCK_TOKEN = 'mock-jwt-token-12345'

/**
 * Register new user
 */
export const register = async (userData) => {
    if (MOCK_MODE) {
        // Mock registration
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
        const user = { ...MOCK_USER, ...userData }
        localStorage.setItem('token', MOCK_TOKEN)
        localStorage.setItem('user', JSON.stringify(user))
        return { user, token: MOCK_TOKEN, message: 'Registration successful (Mock Mode)' }
    }

    const response = await api.post('/auth/register', userData)
    if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
}

/**
 * Login user
 */
export const login = async (credentials) => {
    if (MOCK_MODE) {
        // Mock login - check credentials
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

        if (credentials.email === 'farmer@agromind.com' && credentials.password === 'password123') {
            localStorage.setItem('token', MOCK_TOKEN)
            localStorage.setItem('user', JSON.stringify(MOCK_USER))
            return { user: MOCK_USER, token: MOCK_TOKEN, message: 'Login successful (Mock Mode)' }
        } else {
            throw new Error('Invalid credentials. Use: farmer@agromind.com / password123')
        }
    }

    const response = await api.post('/auth/login', credentials)
    if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
}

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

/**
 * Get user profile
 */
export const getProfile = async () => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return { user: MOCK_USER }
    }

    const response = await api.get('/auth/profile')
    return response.data
}

/**
 * Update user profile
 */
export const updateProfile = async (userData) => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const updatedUser = { ...MOCK_USER, ...userData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        return { user: updatedUser, message: 'Profile updated (Mock Mode)' }
    }

    const response = await api.put('/auth/profile', userData)
    if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
}

/**
 * Change password
 */
export const changePassword = async (passwords) => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return { message: 'Password changed successfully (Mock Mode)' }
    }

    const response = await api.post('/auth/change-password', passwords)
    return response.data
}
