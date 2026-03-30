import express from 'express'
import { 
    getRecommendation, 
    listFertilizers, 
    calculateNPK,
    getFertilizerInfo,
    scanReport
} from '../controllers/fertilizerController.js'
import { auth, optionalAuth } from '../middleware/auth.js'
import { uploadSingle } from '../middleware/upload.js'

const router = express.Router()

// Public routes
router.get('/list', optionalAuth, listFertilizers)
router.get('/info', optionalAuth, getFertilizerInfo)

// Protected routes
router.post('/recommend', auth, getRecommendation)
router.post('/calculate-npk', auth, calculateNPK)
router.post('/scan-report', auth, uploadSingle('report'), scanReport)

export default router
