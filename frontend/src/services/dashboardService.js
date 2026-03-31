import api from './api'

// Mock mode - set to true for standalone demo
const MOCK_MODE = false

// Mock dashboard data
const MOCK_DASHBOARD = {
    overview: {
        totalFarms: 2,
        totalCrops: 5,
        cropHealth: {
            healthy: 4,
            diseased: 1,
            total: 5
        },
        pendingTasks: 3,
        totalExpenses: 45000
    },
    recentTasks: [
        { id: '1', title: 'Irrigation', dueDate: '2026-01-21', status: 'pending', priority: 'high' },
        { id: '2', title: 'Apply Fertilizer', dueDate: '2026-01-23', status: 'pending', priority: 'medium' },
        { id: '3', title: 'Pest Inspection', dueDate: '2026-01-25', status: 'pending', priority: 'low' }
    ],
    recentExpenses: [
        { id: '1', category: 'Seeds', amount: 5000, date: '2026-01-15' },
        { id: '2', category: 'Fertilizer', amount: 8000, date: '2026-01-18' },
        { id: '3', category: 'Labor', amount: 12000, date: '2026-01-19' }
    ]
}

/**
 * Get dashboard overview
 */
export const getDashboardOverview = async () => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return MOCK_DASHBOARD
    }

    const response = await api.get('/dashboard/overview')
    return response.data
}

/**
 * Get crop health data
 */
export const getCropHealth = async () => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return {
            cropHealth: [
                { id: '1', name: 'Tomato', farm: 'Main Farm', status: 'growing', diseaseCount: 0, health: 'healthy' },
                { id: '2', name: 'Wheat', farm: 'Main Farm', status: 'growing', diseaseCount: 0, health: 'healthy' },
                { id: '3', name: 'Rice', farm: 'North Farm', status: 'growing', diseaseCount: 1, health: 'warning' },
                { id: '4', name: 'Potato', farm: 'Main Farm', status: 'growing', diseaseCount: 0, health: 'healthy' },
                { id: '5', name: 'Cotton', farm: 'North Farm', status: 'growing', diseaseCount: 0, health: 'healthy' }
            ]
        }
    }

    const response = await api.get('/dashboard/crop-health')
    return response.data
}

/**
 * Get expenses
 */
export const getExpenses = async (startDate, endDate) => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return {
            expenses: MOCK_DASHBOARD.recentExpenses,
            byCategory: {
                'Seeds': 5000,
                'Fertilizer': 8000,
                'Labor': 12000,
                'Pesticide': 6000,
                'Equipment': 14000
            },
            total: 45000,
            count: 15
        }
    }

    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/dashboard/expenses?${params}`)
    return response.data
}
