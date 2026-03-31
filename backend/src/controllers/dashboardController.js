import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview data
 * @access  Private
 */
export const getOverview = asyncHandler(async (req, res) => {
    let farms = []
    let tasks = []
    let expenses = []

    try {
        // Get user's farms and crops
        farms = await prisma.farm.findMany({
            where: { userId: req.user.id },
            include: {
                crops: {
                    include: {
                        diseases: {
                            where: { status: 'detected' }
                        }
                    }
                }
            }
        })

        // Get tasks
        tasks = await prisma.task.findMany({
            where: { userId: req.user.id },
            orderBy: { dueDate: 'asc' },
            take: 10
        })

        // Get expenses
        expenses = await prisma.expense.findMany({
            where: { userId: req.user.id },
            orderBy: { date: 'desc' },
            take: 10
        })
    } catch (dbError) {
        console.warn('⚠️ Database not available, providing demo dashboard data.')
        // Fallback data for demo
        return res.json({
            overview: {
                totalFarms: 1,
                totalCrops: 3,
                cropHealth: { healthy: 2, diseased: 1, total: 3 },
                pendingTasks: 4,
                totalExpenses: 12500
            },
            recentTasks: [
                { id: '1', title: 'Irrigation', dueDate: new Date().toISOString(), status: 'pending', priority: 'High' },
                { id: '2', title: 'Fertilization', dueDate: new Date().toISOString(), status: 'pending', priority: 'Medium' }
            ],
            recentExpenses: [],
            isDemoData: true
        })
    }

    // Calculate statistics
    const totalCrops = farms.reduce((sum, farm) => sum + farm.crops.length, 0)
    const activeDiseases = farms.reduce((sum, farm) =>
        sum + farm.crops.reduce((s, crop) => s + crop.diseases.length, 0), 0
    )
    const pendingTasks = tasks.filter(t => t.status === 'pending').length
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Crop health summary
    const cropHealth = {
        healthy: totalCrops - activeDiseases,
        diseased: activeDiseases,
        total: totalCrops
    }

    res.json({
        overview: {
            totalFarms: farms.length,
            totalCrops,
            cropHealth,
            pendingTasks,
            totalExpenses
        },
        recentTasks: tasks.slice(0, 5),
        recentExpenses: expenses.slice(0, 5)
    })
})

/**
 * @route   GET /api/dashboard/crop-health
 * @desc    Get crop health statistics
 * @access  Private
 */
export const getCropHealth = asyncHandler(async (req, res) => {
    const farms = await prisma.farm.findMany({
        where: { userId: req.user.id },
        include: {
            crops: {
                include: {
                    diseases: true
                }
            }
        }
    })

    const cropHealthData = farms.flatMap(farm =>
        farm.crops.map(crop => ({
            id: crop.id,
            name: crop.cropName,
            farm: farm.name,
            status: crop.status,
            diseaseCount: crop.diseases.length,
            health: crop.diseases.length === 0 ? 'healthy' : crop.diseases.length < 3 ? 'warning' : 'critical'
        }))
    )

    res.json({ cropHealth: cropHealthData })
})

/**
 * @route   GET /api/dashboard/expenses
 * @desc    Get expense breakdown
 * @access  Private
 */
export const getExpenses = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query

    const where = { userId: req.user.id }

    if (startDate && endDate) {
        where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        }
    }

    const expenses = await prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' }
    })

    // Group by category
    const byCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
    }, {})

    const total = expenses.reduce((sum, e) => sum + e.amount, 0)

    res.json({
        expenses,
        byCategory,
        total,
        count: expenses.length
    })
})
