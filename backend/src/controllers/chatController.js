import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler.js'
import { generateAgriculturalResponse } from '../services/aiService.js'

const prisma = new PrismaClient()

/**
 * @route   POST /api/chat/message
 * @desc    Send message to AI assistant
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { message, sessionId } = req.body

    if (!message) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide a message'
        })
    }

    // Get or create chat session
    let session = null
    try {
        if (sessionId) {
            session = await prisma.chatSession.findUnique({
                where: { id: sessionId }
            })
        }

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    userId: req.user.id,
                    messages: JSON.stringify([])
                }
            })
        }
    } catch (dbError) {
        console.warn('⚠️ Database not available, using temporary session.')
        session = { id: sessionId || 'temp-session-' + Date.now(), messages: JSON.stringify([]) }
    }

    // Get real AI response from Gemini with Context
    const userContext = await fetchUserContext(req.user.id)
    const history = typeof session.messages === 'string' ? JSON.parse(session.messages) : (session.messages || [])
    const aiResponse = await generateAgriculturalResponse(message, history, userContext)

    // Update session with new messages
    const updatedMessages = [...history,
    {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    },
    {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
    }
    ]

    try {
        if (session.id && !session.id.startsWith('temp-')) {
            await prisma.chatSession.update({
                where: { id: session.id },
                data: {
                    messages: JSON.stringify(updatedMessages),
                    updatedAt: new Date()
                }
            })
        }
    } catch (dbError) {
        console.warn('⚠️ Could not save chat history to database.')
    }

    res.json({
        message: 'Message sent successfully',
        response: aiResponse,
        sessionId: session.id
    })
})

/**
 * Fetch comprehensive user context for the AI
 */
async function fetchUserContext(userId) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                farms: {
                    include: {
                        crops: true,
                        soilTests: {
                            orderBy: { testDate: 'desc' },
                            take: 1
                        }
                    }
                },
                tasks: {
                    where: { status: 'pending' },
                    orderBy: { dueDate: 'asc' },
                    take: 3
                }
            }
        })

        if (!user) return {}

        const primaryFarm = user.farms[0]
        const crops = primaryFarm?.crops.map(c => c.cropName) || []
        const tasks = user.tasks.map(t => `${t.title} (due ${t.dueDate.toLocaleDateString()})`)
        const soil = primaryFarm?.soilTests[0]
        const soilType = primaryFarm?.soilType || "Standard"

        // Fetch most recent weather for this location
        const weather = await prisma.weather.findFirst({
            where: { location: user.location || primaryFarm?.location },
            orderBy: { date: 'desc' }
        })

        return {
            location: user.location || primaryFarm?.location,
            soilType,
            crops,
            tasks,
            weather: weather ? `${weather.condition}, ${weather.temperature}°C, Rain: ${weather.rainfall}mm` : "Unknown",
            soilInfo: soil ? `pH: ${soil.pH}, N: ${soil.nitrogen}, P: ${soil.phosphorus}, K: ${soil.potassium}` : "No recent tests"
        }
    } catch (error) {
        console.error("Error fetching context:", error);
        return {}
    }
}

/**
 * @route   GET /api/chat/history
 * @desc    Get chat history
 * @access  Private
 */
export const getHistory = asyncHandler(async (req, res) => {
    const { sessionId } = req.query

    if (sessionId) {
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId }
        })

        if (!session || session.userId !== req.user.id) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Chat session not found'
            })
        }

        return res.json({ session })
    }

    // Get all user sessions
    const sessions = await prisma.chatSession.findMany({
        where: { userId: req.user.id },
        orderBy: { updatedAt: 'desc' }
    })

    res.json({ sessions })
})

/**
 * @route   DELETE /api/chat/session/:id
 * @desc    Delete chat session
 * @access  Private
 */
export const deleteSession = asyncHandler(async (req, res) => {
    const session = await prisma.chatSession.findUnique({
        where: { id: req.params.id }
    })

    if (!session || session.userId !== req.user.id) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Chat session not found'
        })
    }

    await prisma.chatSession.delete({
        where: { id: req.params.id }
    })

    res.json({ message: 'Chat session deleted successfully' })
})
