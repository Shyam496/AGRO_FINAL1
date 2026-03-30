import express from 'express'
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.js'
import { auth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Public routes
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)

// Protected routes
router.get('/profile', auth, getProfile)
router.put('/profile', auth, updateProfile)
router.post('/change-password', auth, changePassword)

export default router
