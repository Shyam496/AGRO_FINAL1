import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

// Import routes
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import diseaseRoutes from './routes/diseaseRoutes.js'
import fertilizerRoutes from './routes/fertilizerRoutes.js'
import weatherRoutes from './routes/weatherRoutes.js'
import schemeRoutes from './routes/schemeRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import cropRoutes from './routes/cropRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimiter.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rate limiting
app.use('/api/', rateLimiter)

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/disease', diseaseRoutes)
app.use('/api/fertilizer', fertilizerRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/schemes', schemeRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/crops', cropRoutes)
app.use('/api/tasks', taskRoutes)

// ML Service Proxy
app.use('/api/ml', async (req, res) => {
    try {
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001'
        const mlUrl = `${mlServiceUrl}/api/ml${req.path}`
        const response = await axios({
            method: req.method,
            url: mlUrl,
            data: req.body,
            headers: { 'Content-Type': 'application/json' }
        })
        res.json(response.data)
    } catch (error) {
        console.error('ML Proxy Error:', error.message)
        res.status(error.response?.status || 500).json({
            error: 'ML Service unreachable via proxy',
            details: error.message
        })
    }
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

// Error handling middleware (must be last)
app.use(errorHandler)

export default app
