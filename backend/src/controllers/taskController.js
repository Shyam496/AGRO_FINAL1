import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { asyncHandler } from '../middleware/errorHandler.js'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

const prisma = new PrismaClient()

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
export const getTasks = asyncHandler(async (req, res) => {
    const tasks = await prisma.task.findMany({
        where: { userId: req.user.id },
        orderBy: { dueDate: 'asc' }
    })

    res.json({ tasks })
})

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
export const createTask = asyncHandler(async (req, res) => {
    const { title, description, taskType, dueDate, priority } = req.body

    if (!title || !taskType || !dueDate) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide title, task type, and due date'
        })
    }

    const task = await prisma.task.create({
        data: {
            userId: req.user.id,
            title,
            description,
            taskType,
            dueDate: new Date(dueDate),
            priority: priority || 'medium',
            status: 'pending'
        }
    })

    res.status(201).json({
        message: 'Task created successfully',
        task
    })
})

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update task status
 * @access  Private
 */
export const updateTaskStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const { id } = req.params

    const task = await prisma.task.update({
        where: {
            id,
            userId: req.user.id // Ensure user owns the task
        },
        data: { status }
    })

    res.json({
        message: 'Task updated successfully',
        task
    })
})

/**
 * @route   POST /api/tasks/suitability
 * @desc    Get weather-aware suitability for farming tasks
 * @access  Private
 */
export const getSuitability = asyncHandler(async (req, res) => {
    const { lat, lon } = req.body

    if (!lat || !lon) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide coordinates (lat, lon)'
        })
    }

    try {
        console.log(`Calling ML Suitability: ${ML_SERVICE_URL}/api/ml/calendar/suitability`)
        const response = await axios.post(`${ML_SERVICE_URL}/api/ml/calendar/suitability`, { lat, lon }, { timeout: 10000 })
        res.json(response.data)
    } catch (error) {
        console.error('ML Service Error (Suitability):', error.message)
        
        // Fallback to dummy data for calendar if ML service is down
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

        res.json({ success: true, calendar, fallback: true })
    }
})
