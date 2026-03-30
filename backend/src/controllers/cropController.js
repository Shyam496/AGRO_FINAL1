import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

/**
 * @route   GET /api/crops
 * @desc    Get user's crops
 * @access  Private
 */
export const getCrops = asyncHandler(async (req, res) => {
    const farms = await prisma.farm.findMany({
        where: { userId: req.user.id },
        include: {
            crops: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    const crops = farms.flatMap(farm =>
        farm.crops.map(crop => ({
            ...crop,
            farmName: farm.name
        }))
    )

    res.json({ crops, count: crops.length })
})

/**
 * @route   POST /api/crops
 * @desc    Add new crop
 * @access  Private
 */
export const addCrop = asyncHandler(async (req, res) => {
    const { farmId, cropName, variety, sowingDate, expectedHarvest, area } = req.body

    if (!farmId || !cropName || !sowingDate || !area) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide all required fields'
        })
    }

    // Verify farm belongs to user
    const farm = await prisma.farm.findUnique({
        where: { id: farmId }
    })

    if (!farm || farm.userId !== req.user.id) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have access to this farm'
        })
    }

    const crop = await prisma.crop.create({
        data: {
            farmId,
            cropName,
            variety,
            sowingDate: new Date(sowingDate),
            expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : null,
            area: parseFloat(area)
        }
    })

    res.status(201).json({
        message: 'Crop added successfully',
        crop
    })
})

/**
 * @route   GET /api/crops/:id/tasks
 * @desc    Get tasks for a crop
 * @access  Private
 */
export const getCropTasks = asyncHandler(async (req, res) => {
    const tasks = await prisma.task.findMany({
        where: {
            userId: req.user.id,
            description: { contains: req.params.id } // Simple association
        },
        orderBy: { dueDate: 'asc' }
    })

    res.json({ tasks })
})

/**
 * @route   POST /api/crops/:id/tasks
 * @desc    Add task for a crop
 * @access  Private
 */
export const addTask = asyncHandler(async (req, res) => {
    const { title, description, taskType, dueDate, priority } = req.body

    if (!title || !dueDate) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide title and due date'
        })
    }

    const task = await prisma.task.create({
        data: {
            userId: req.user.id,
            title,
            description: description || `Crop ID: ${req.params.id}`,
            taskType: taskType || 'general',
            dueDate: new Date(dueDate),
            priority: priority || 'medium'
        }
    })

    res.status(201).json({
        message: 'Task added successfully',
        task
    })
})

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
export const updateTask = asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: req.params.id }
    })

    if (!task || task.userId !== req.user.id) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Task not found'
        })
    }

    const updatedTask = await prisma.task.update({
        where: { id: req.params.id },
        data: req.body
    })

    res.json({
        message: 'Task updated successfully',
        task: updatedTask
    })
})

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: req.params.id }
    })

    if (!task || task.userId !== req.user.id) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Task not found'
        })
    }

    await prisma.task.delete({
        where: { id: req.params.id }
    })

    res.json({ message: 'Task deleted successfully' })
})
