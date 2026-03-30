import express from 'express'
import { getCurrentWeather, getForecast, getAdvisory } from '../controllers/weatherController.js'
import { optionalAuth, auth } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/current', optionalAuth, getCurrentWeather)
router.get('/forecast', optionalAuth, getForecast)

// Protected routes
router.get('/advisory', auth, getAdvisory)

export default router
