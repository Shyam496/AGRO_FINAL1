import axios from 'axios'
import { asyncHandler } from '../middleware/errorHandler.js'
import { mockWeather } from '../utils/mockData.js'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

/**
 * @route   GET /api/weather/current
 * @desc    Get current weather
 * @access  Public
 */
export const getCurrentWeather = asyncHandler(async (req, res) => {
    const { location, lat, lon } = req.query

    if (!location && (!lat || !lon)) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide location or coordinates (lat, lon)'
        })
    }

    try {
        let weatherData

        if (lat && lon) {
            // Get weather by coordinates
            const response = await axios.post(`${ML_SERVICE_URL}/api/ml/weather/current`, {
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            }, { timeout: 10000 })

            weatherData = response.data.weather
        } else {
            // Get weather by city name
            const response = await axios.post(`${ML_SERVICE_URL}/api/ml/weather/city`, {
                city: location
            }, { timeout: 10000 })

            weatherData = response.data.weather
        }

        res.json({
            success: true,
            weather: weatherData
        })

    } catch (error) {
        console.error('Error fetching weather from ML service:', error.message)

        // Fallback to mock data
        const weather = {
            ...mockWeather.current,
            location: location || `${lat}, ${lon}`,
            timestamp: new Date().toISOString()
        }

        res.json({
            success: true,
            weather,
            fallback: true,
            message: 'Using mock data - ML service unavailable'
        })
    }
})

/**
 * @route   GET /api/weather/forecast
 * @desc    Get 7-day weather forecast
 * @access  Public
 */
export const getForecast = asyncHandler(async (req, res) => {
    const { location, lat, lon, days = 7 } = req.query

    if (!location && (!lat || !lon)) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide location or coordinates (lat, lon)'
        })
    }

    try {
        let forecastData

        if (lat && lon) {
            // Get forecast by coordinates
            const response = await axios.post(`${ML_SERVICE_URL}/api/ml/weather/forecast`, {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                days: parseInt(days)
            }, { timeout: 10000 })

            forecastData = response.data.forecast
        } else {
            // Get forecast by city name
            const response = await axios.post(`${ML_SERVICE_URL}/api/ml/weather/city`, {
                city: location
            }, { timeout: 10000 })

            forecastData = response.data.forecast
        }

        res.json({
            success: true,
            forecast: forecastData,
            location: location || `${lat}, ${lon}`
        })

    } catch (error) {
        console.error('Error fetching forecast from ML service:', error.message)

        // Fallback to mock data
        res.json({
            success: true,
            forecast: mockWeather.forecast,
            location: location || `${lat}, ${lon}`,
            fallback: true,
            message: 'Using mock data - ML service unavailable'
        })
    }
})

/**
 * @route   GET /api/weather/advisory
 * @desc    Get farming advisory based on weather
 * @access  Public
 */
export const getAdvisory = asyncHandler(async (req, res) => {
    const { location, lat, lon, cropName } = req.query

    if (!location && (!lat || !lon)) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide location or coordinates (lat, lon)'
        })
    }

    try {
        let advisoryData

        if (lat && lon) {
            // Get advisory by coordinates
            const response = await axios.post(`${ML_SERVICE_URL}/api/ml/weather/advisory`, {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                crop_type: cropName
            }, { timeout: 10000 })

            advisoryData = response.data.advisory
        } else {
            // For city name, first get coordinates then advisory
            const cityResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/weather/city`, {
                city: location
            }, { timeout: 10000 })

            const { lat: cityLat, lon: cityLon } = cityResponse.data.location

            const response = await axios.post(`${ML_SERVICE_URL}/api/ml/weather/advisory`, {
                lat: cityLat,
                lon: cityLon,
                crop_type: cropName
            }, { timeout: 10000 })

            advisoryData = response.data.advisory
        }

        res.json({
            success: true,
            advisory: advisoryData
        })

    } catch (error) {
        console.error('Error fetching advisory from ML service:', error.message)

        // Fallback to mock data
        const advisory = {
            ...mockWeather.advisory,
            cropSpecific: cropName ? `For ${cropName}: Monitor for pest activity during humid conditions` : null,
            alerts: [
                {
                    type: 'info',
                    message: 'Weather data temporarily unavailable',
                    severity: 'low'
                }
            ]
        }

        res.json({
            success: true,
            advisory,
            fallback: true,
            message: 'Using mock data - ML service unavailable'
        })
    }
})
