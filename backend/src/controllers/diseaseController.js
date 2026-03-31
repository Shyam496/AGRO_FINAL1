import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import { asyncHandler } from '../middleware/errorHandler.js'
import { mockDiseasePredict, mockDiseases } from '../utils/mockData.js'

const prisma = new PrismaClient()
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

/**
 * @route   POST /api/disease/predict-image
 * @desc    Predict disease from uploaded image
 * @access  Private
 */
export const predictFromImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please upload an image'
        })
    }

    const imageUrl = `/uploads/${req.file.filename}`

    let prediction
    try {
        // Prepare form data for ML service
        const formData = new FormData()
        formData.append('image', fs.createReadStream(req.file.path))

        // Call ML service
        console.log(`Sending image to ML service: ${ML_SERVICE_URL}/predict`)
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 30000 // ML prediction might take time
        })

        prediction = response.data
        console.log('ML Service response:', prediction)
    } catch (error) {
        console.error('ML Service Error (Disease):', error.message)
        
        // Extract detailed error from ML service if available
        const mlError = error.response?.data?.error || error.response?.data?.message || error.message
        const mlData = error.response?.data || {}

        // Fallback to mock for demo stability if ML service is down
        prediction = mockDiseasePredict(imageUrl)
        prediction.isMock = true
        prediction.error = mlError
        
        // Preserve validation flags if it was a rejection (status 400)
        if (error.response?.status === 400) {
            prediction.isInvalidImage = mlData.isInvalidImage || false
            prediction.validation = mlData.validation || null
            prediction.suggestions = mlData.suggestions || []
        }
    }

    // Save detection to database (if crop ID provided)
    if (req.body.cropId) {
        try {
            await prisma.diseaseDetection.create({
                data: {
                    cropId: req.body.cropId,
                    diseaseId: prediction.diseaseId || prediction.class,
                    imageUrl,
                    confidence: prediction.confidence || 0,
                    symptoms: prediction.symptoms ? JSON.stringify(prediction.symptoms) : null,
                    status: 'detected'
                }
            })
        } catch (dbError) {
            console.warn('⚠️ Database not available, skipping detection log save.')
        }
    }

    res.json({
        message: prediction.isMock ? 'Disease prediction (Mock Fallback)' : 'Disease prediction completed',
        prediction,
        imageUrl
    })
})

/**
 * @route   POST /api/disease/predict-symptoms
 * @desc    Predict disease from symptoms
 * @access  Private
 */
export const predictFromSymptoms = asyncHandler(async (req, res) => {
    const { cropType, symptoms } = req.body

    if (!cropType || !symptoms || symptoms.length === 0) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide crop type and symptoms'
        })
    }

    // Mock symptom-based prediction
    const matchingDiseases = mockDiseases
        .filter(d => d.cropType.toLowerCase() === cropType.toLowerCase())
        .map(disease => {
            const matchCount = symptoms.filter(s =>
                disease.symptoms.some(ds => ds.toLowerCase().includes(s.toLowerCase()))
            ).length
            const confidence = (matchCount / symptoms.length) * 0.9

            return {
                diseaseId: disease.id,
                diseaseName: disease.name,
                confidence: parseFloat(confidence.toFixed(2)),
                severity: disease.severity,
                symptoms: disease.symptoms,
                treatment: disease.treatment,
                prevention: disease.prevention
            }
        })
        .filter(d => d.confidence > 0.3)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)

    res.json({
        message: 'Symptom analysis completed',
        matches: matchingDiseases
    })
})

/**
 * @route   GET /api/disease/:id
 * @desc    Get disease details
 * @access  Public
 */
export const getDiseaseDetails = asyncHandler(async (req, res) => {
    const disease = mockDiseases.find(d => d.id === req.params.id)

    if (!disease) {
        return res.status(404).json({
            error: 'Not found',
            message: 'Disease not found'
        })
    }

    res.json({ disease })
})

/**
 * @route   GET /api/disease/history
 * @desc    Get user's disease detection history
 * @access  Private
 */
export const getDetectionHistory = asyncHandler(async (req, res) => {
    // Get user's crops
    const userFarms = await prisma.farm.findMany({
        where: { userId: req.user.id },
        include: {
            crops: {
                include: {
                    diseases: {
                        include: {
                            disease: true
                        },
                        orderBy: {
                            detectedAt: 'desc'
                        }
                    }
                }
            }
        }
    })

    const detections = userFarms.flatMap(farm =>
        farm.crops.flatMap(crop =>
            crop.diseases.map(detection => ({
                ...detection,
                cropName: crop.cropName,
                farmName: farm.name
            }))
        )
    )

    res.json({ detections })
})

/**
 * @route   GET /api/disease/list
 * @desc    Get list of all diseases
 * @access  Public
 */
export const listDiseases = asyncHandler(async (req, res) => {
    const { cropType } = req.query

    let diseases = mockDiseases

    if (cropType) {
        diseases = diseases.filter(d =>
            d.cropType.toLowerCase() === cropType.toLowerCase()
        )
    }

    res.json({ diseases })
})
