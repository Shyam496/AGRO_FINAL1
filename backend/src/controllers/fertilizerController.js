import { asyncHandler } from '../middleware/errorHandler.js'
import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import { mockFertilizerRecommend, mockFertilizers } from '../utils/mockData.js'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

/**
 * @route   POST /api/fertilizer/recommend
 * @desc    Get fertilizer recommendation based on soil test
 * @access  Private
 */
export const getRecommendation = asyncHandler(async (req, res) => {
    const { nitrogen, phosphorus, potassium, pH, cropName, growthStage, farmArea } = req.body

    if (!nitrogen || !phosphorus || !potassium || !pH || !cropName) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide all soil test values and crop information'
        })
    }

    const soilData = { nitrogen, phosphorus, potassium, pH }

    let recommendation
    try {
        // Map to ML service format
        // ML service expects: temperature, humidity, moisture, soil_type, crop_type, nitrogen, phosphorous, potassium, land_size, land_unit
        const mlPayload = {
            temperature: 25.0, // Default or fetch from weather if possible
            humidity: 65.0,
            moisture: 50.0,
            soil_type: "Loamy", // Should be passed from frontend
            crop_type: cropName,
            nitrogen: parseFloat(nitrogen),
            phosphorous: parseFloat(phosphorus),
            potassium: parseFloat(potassium),
            land_size: parseFloat(farmArea || 1.0),
            land_unit: "acre"
        }

        console.log(`Calling ML Fertilizer Predict: ${ML_SERVICE_URL}/fertilizer/predict-manual`)
        const response = await axios.post(`${ML_SERVICE_URL}/fertilizer/predict-manual`, mlPayload)

        if (response.data && response.data.success) {
            recommendation = response.data
        } else {
            throw new Error(response.data.error || 'ML Service failed')
        }
    } catch (error) {
        console.error('ML Service Error (Fertilizer):', error.message)
        // Fallback to mock
        recommendation = mockFertilizerRecommend(soilData, cropName, growthStage)

        // Adjust quantities based on farm area if provided (for mock only)
        if (farmArea) {
            recommendation.recommendations = recommendation.recommendations.map(r => ({
                ...r,
                quantity: Math.round(r.quantity * farmArea)
            }))
            recommendation.estimatedCost = Math.round(recommendation.estimatedCost * farmArea)
        }
        recommendation.isMock = true
    }

    res.json({
        message: recommendation.isMock ? 'Fertilizer recommendation (Mock Fallback)' : 'Fertilizer recommendation generated',
        soilAnalysis: {
            nitrogen: { value: nitrogen, status: nitrogen < 200 ? 'Low' : nitrogen < 400 ? 'Medium' : 'High' },
            phosphorus: { value: phosphorus, status: phosphorus < 20 ? 'Low' : phosphorus < 40 ? 'Medium' : 'High' },
            potassium: { value: potassium, status: potassium < 150 ? 'Low' : potassium < 300 ? 'Medium' : 'High' },
            pH: { value: pH, status: pH < 6 ? 'Acidic' : pH < 7.5 ? 'Neutral' : 'Alkaline' }
        },
        recommendation
    })
})

/**
 * @route   GET /api/fertilizer/list
 * @desc    Get list of available fertilizers
 * @access  Public
 */
export const listFertilizers = asyncHandler(async (req, res) => {
    const { type } = req.query

    let fertilizers = mockFertilizers

    if (type) {
        fertilizers = fertilizers.filter(f => f.type === type)
    }

    res.json({ fertilizers })
})

/**
 * @route   POST /api/fertilizer/calculate-npk
 * @desc    Calculate NPK requirements
 * @access  Private
 */
export const calculateNPK = asyncHandler(async (req, res) => {
    const { cropName, targetYield, farmArea } = req.body

    // Mock NPK calculation based on crop type
    const npkRequirements = {
        'Wheat': { n: 120, p: 60, k: 40 },
        'Rice': { n: 100, p: 50, k: 50 },
        'Tomato': { n: 150, p: 80, k: 100 },
        'Potato': { n: 180, p: 90, k: 120 },
        'Cotton': { n: 120, p: 60, k: 60 },
        'default': { n: 100, p: 50, k: 50 }
    }

    const baseNPK = npkRequirements[cropName] || npkRequirements['default']
    const totalNPK = {
        nitrogen: Math.round(baseNPK.n * (farmArea || 1)),
        phosphorus: Math.round(baseNPK.p * (farmArea || 1)),
        potassium: Math.round(baseNPK.k * (farmArea || 1))
    }

    res.json({
        message: 'NPK calculation completed',
        cropName,
        farmArea: farmArea || 1,
        npkPerAcre: baseNPK,
        totalNPK
    })
})

/**
 * @route   GET /api/fertilizer/info
 * @desc    Get metadata for fertilizer (crops, soil types, etc.)
 * @access  Public
 */
export const getFertilizerInfo = asyncHandler(async (req, res) => {
    try {
        console.log(`Calling ML Fertilizer Info: ${ML_SERVICE_URL}/fertilizer/info`)
        const response = await axios.get(`${ML_SERVICE_URL}/fertilizer/info`, { timeout: 5000 })
        res.json(response.data)
    } catch (error) {
        console.error('ML Service Error (Info):', error.message)
        // Fallback info
        res.json({
            success: true,
            crops: ["Rice", "Maize", "Chickpea", "Kidneybeans", "Pigeonpeas", "Mothbeans", "Mungbean", "Blackgram", "Lentil", "Pomegranate", "Banana", "Mango", "Grapes", "Watermelon", "Muskmelon", "Apple", "Orange", "Papaya", "Coconut", "Cotton", "Jute", "Coffee"],
            soil_types: ["Sandy", "Loamy", "Black", "Red", "Clayey"],
            land_units: ["acre", "hectare", "sq_m", "cent"]
        })
    }
})

/**
 * @route   POST /api/fertilizer/scan-report
 * @desc    Scan soil report (OCR)
 * @access  Private
 */
export const scanReport = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please upload a soil report'
        })
    }

    try {
        const formData = new FormData()
        formData.append('report', fs.createReadStream(req.file.path))

        console.log(`Calling ML Fertilizer Scan: ${ML_SERVICE_URL}/fertilizer/scan-report`)
        const response = await axios.post(`${ML_SERVICE_URL}/fertilizer/scan-report`, formData, {
            headers: { ...formData.getHeaders() },
            timeout: 30000
        })

        res.json(response.data)
    } catch (error) {
        console.error('ML Service Error (Scan):', error.message)
        res.status(500).json({
            success: false,
            error: 'Failed to scan report. Service might be down.',
            message: error.message
        })
    }
})
