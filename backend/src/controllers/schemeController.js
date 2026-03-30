import { asyncHandler } from '../middleware/errorHandler.js'
import axios from 'axios'
import { mockSchemes } from '../utils/mockData.js'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

/**
 * @route   GET /api/schemes
 */
export const listSchemes = asyncHandler(async (req, res) => {
    const { search, category } = req.query
    try {
        let results = []
        if (search) {
            const response = await axios.post(`${ML_SERVICE_URL}/api/ml/schemes/search`, { query: search })
            results = response.data.results
        } else {
            results = mockSchemes
        }

        // Apply strict category filtering
        if (category && category !== 'All') {
            results = results.filter(s => s.category.toLowerCase() === category.toLowerCase())
        }

        res.json({ schemes: results, count: results.length, source: search ? 'ml-service' : 'mock-data' })
    } catch (error) {
        let results = mockSchemes
        if (category && category !== 'All') {
            results = results.filter(s => s.category.toLowerCase() === category.toLowerCase())
        }
        res.json({ schemes: results, count: results.length, error: 'ML Service fallback' })
    }
})

/**
 * @route   GET /api/schemes/:id
 */
export const getSchemeDetails = asyncHandler(async (req, res) => {
    const scheme = mockSchemes.find(s => s.id === req.params.id)
    if (!scheme) return res.status(404).json({ error: 'Not found' })
    res.json({ scheme })
})

/**
 * @route   POST /api/schemes/check-eligibility
 */
export const checkEligibility = asyncHandler(async (req, res) => {
    const { category } = req.body
    try {
        const userProfile = {
            land_size: 1, crop: 'All', income: 50000,
            category: category || 'General'
        }
        const response = await axios.post(`${ML_SERVICE_URL}/api/ml/schemes/recommend`, userProfile)
        res.json({
            message: 'Eligibility check completed',
            eligibleSchemes: response.data.recommendations,
            count: response.data.recommendations.length
        })
    } catch (error) {
        console.error('ML Eligibility Error:', error.message)
        // Corrected fallback logic using new IDs
        const eligibleSchemes = mockSchemes.filter(s => {
            if (category && category !== 'All types') {
                return s.category.toLowerCase() === category.toLowerCase()
            }
            return true
        }).map(s => ({ ...s, compatibility_score: 95 }))
        res.json({
            message: 'Eligibility check fallback',
            eligibleSchemes,
            count: eligibleSchemes.length
        })
    }
})

/**
 * @route   GET /api/schemes/categories
 */
export const getCategories = asyncHandler(async (req, res) => {
    const categories = [
        { id: 'subsidy', name: 'Subsidy', count: 10 },
        { id: 'loan', name: 'Loan', count: 10 },
        { id: 'insurance', name: 'Insurance', count: 10 },
        { id: 'training', name: 'Training', count: 10 },
        { id: 'equipment', name: 'Equipment', count: 10 },
        { id: 'marketing', name: 'Marketing', count: 10 }
    ]
    res.json({ categories })
})
