import express from 'express'
import { getOverview, getCropHealth, getExpenses } from '../controllers/dashboardController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// All dashboard routes require authentication
router.get('/overview', auth, getOverview)
router.get('/crop-health', auth, getCropHealth)
router.get('/expenses', auth, getExpenses)

export default router
