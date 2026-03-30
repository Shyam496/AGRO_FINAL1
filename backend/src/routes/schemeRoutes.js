import express from 'express'
import { listSchemes, getSchemeDetails, checkEligibility, getCategories } from '../controllers/schemeController.js'
import { auth, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', optionalAuth, listSchemes)
router.get('/categories', getCategories)
router.get('/:id', getSchemeDetails)

// Protected routes
router.post('/check-eligibility', optionalAuth, checkEligibility)

export default router
