import express from 'express'
import {
    predictFromImage,
    predictFromSymptoms,
    getDiseaseDetails,
    getDetectionHistory,
    listDiseases
} from '../controllers/diseaseController.js'
import { auth, optionalAuth } from '../middleware/auth.js'
import { uploadSingle } from '../middleware/upload.js'
import { uploadLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Protected routes
router.post('/predict-image', auth, uploadLimiter, uploadSingle('image'), predictFromImage)
router.post('/predict-symptoms', auth, predictFromSymptoms)
router.get('/history', auth, getDetectionHistory)

// Public routes
router.get('/list', optionalAuth, listDiseases)
router.get('/:id', getDiseaseDetails)

export default router
