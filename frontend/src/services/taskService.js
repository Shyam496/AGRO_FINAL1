import api from './api'

const MOCK_MODE = false // Keep in sync with authService

const getMockTasks = () => {
    const stored = localStorage.getItem('mock_tasks')
    if (stored) return JSON.parse(stored)

    const initialTasks = []
    localStorage.setItem('mock_tasks', JSON.stringify(initialTasks))
    return initialTasks
}

const saveMockTasks = (tasks) => {
    localStorage.setItem('mock_tasks', JSON.stringify(tasks))
}

const taskService = {
    /**
     * Get all tasks/reminders
     */
    getTasks: async () => {
        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500))
            return { tasks: getMockTasks() }
        }
        const response = await api.get('/tasks')
        return response.data
    },

    /**
     * Create a new task/reminder
     * @param {Object} taskData - { title, description, taskType, dueDate, priority }
     */
    createTask: async (taskData) => {
        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300))
            const tasks = getMockTasks()
            const newTask = { id: Date.now(), ...taskData, status: 'pending' }
            tasks.push(newTask)
            saveMockTasks(tasks)
            return { success: true, task: newTask }
        }
        const response = await api.post('/tasks', taskData)
        return response.data
    },

    /**
     * Update task status (e.g., mark as completed)
     */
    updateTaskStatus: async (taskId, status) => {
        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 200))
            const tasks = getMockTasks()
            const index = tasks.findIndex(t => t.id === taskId)
            if (index !== -1) {
                tasks[index].status = status
                saveMockTasks(tasks)
            }
            return { success: true }
        }
        const response = await api.patch(`/tasks/${taskId}`, { status })
        return response.data
    },

    /**
     * Delete a task
     */
    deleteTask: async (taskId) => {
        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 200))
            const tasks = getMockTasks()
            const filteredTasks = tasks.filter(t => t.id !== taskId)
            saveMockTasks(filteredTasks)
            return { success: true }
        }
        const response = await api.delete(`/tasks/${taskId}`)
        return response.data
    },

    /**
     * Get weather-aware suitability for calendar
     */
    getCalendarSuitability: async (lat, lon) => {
        if (MOCK_MODE) {
            // Return dummy structural data for calendar grid with varied weather
            const today = new Date()
            const calendar = []
            const weatherConditions = [
                { icon: 'sun', rainfall: 0, description: 'Clear skies', temp: 32 },
                { icon: 'cloud', rainfall: 0, description: 'Partly cloudy', temp: 28 },
                { icon: 'cloud-rain', rainfall: 15, description: 'Light rain', temp: 25 },
                { icon: 'cloud-rain', rainfall: 60, description: 'Heavy rain', temp: 23 },
                { icon: 'cloud-rain', rainfall: 8, description: 'Drizzle', temp: 26 },
                { icon: 'cloud', rainfall: 0, description: 'Fog', temp: 24 },
                { icon: 'sun', rainfall: 0, description: 'Sunny', temp: 30 }
            ]

            for (let i = 0; i < 7; i++) {
                const date = new Date(today)
                date.setDate(today.getDate() + i)
                const condition = weatherConditions[i]
                calendar.push({
                    date: date.toISOString().split('T')[0],
                    day_name: date.toLocaleDateString('en-US', { weekday: 'long' }),
                    temperature: condition.temp,
                    rainfall: condition.rainfall,
                    description: condition.description,
                    weather_icon: condition.icon,
                    suitability: {
                        spraying: condition.rainfall > 10 ? 'avoid' : 'optimal',
                        harvesting: condition.rainfall > 20 ? 'avoid' : 'caution',
                        sowing: condition.rainfall < 5 ? 'optimal' : 'caution'
                    }
                })
            }
            return { success: true, calendar }
        }

        // Use backend API proxy (avoids CORS and handles authentication)
        const response = await api.post('/tasks/suitability', { lat, lon })
        return response.data
    }
}

export default taskService
