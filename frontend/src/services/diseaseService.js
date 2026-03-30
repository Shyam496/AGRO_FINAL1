import api from './api'

// Mock mode - set to false to use real ML service
const MOCK_MODE = false

// Mock disease database
const MOCK_DISEASES = [
    {
        id: '1',
        name: 'Tomato Late Blight',
        cropType: 'Tomato',
        severity: 'High',
        confidence: 0.92,
        symptoms: [
            'Dark brown spots on leaves',
            'White fuzzy growth on leaf undersides',
            'Rapid leaf death',
            'Fruit rot'
        ],
        causes: [
            'Fungal infection (Phytophthora infestans)',
            'High humidity',
            'Cool temperatures',
            'Poor air circulation'
        ],
        treatment: [
            'Remove and destroy infected plants',
            'Apply copper-based fungicides',
            'Improve air circulation',
            'Avoid overhead watering',
            'Use resistant varieties'
        ],
        prevention: [
            'Plant resistant varieties',
            'Ensure proper spacing',
            'Water at soil level',
            'Apply preventive fungicides',
            'Rotate crops annually'
        ],
        imageUrl: '/disease-images/tomato-blight.jpg'
    },
    {
        id: '2',
        name: 'Wheat Rust',
        cropType: 'Wheat',
        severity: 'Medium',
        confidence: 0.87,
        symptoms: [
            'Orange-red pustules on leaves',
            'Yellow spots on upper leaf surface',
            'Premature leaf drying',
            'Reduced grain quality'
        ],
        causes: [
            'Fungal infection',
            'Humid weather',
            'Dense planting',
            'Susceptible varieties'
        ],
        treatment: [
            'Apply fungicides (Propiconazole)',
            'Remove infected plant debris',
            'Improve field drainage',
            'Use resistant varieties'
        ],
        prevention: [
            'Plant resistant varieties',
            'Proper crop rotation',
            'Timely sowing',
            'Balanced fertilization',
            'Monitor regularly'
        ],
        imageUrl: '/disease-images/wheat-rust.jpg'
    },
    {
        id: '3',
        name: 'Rice Blast',
        cropType: 'Rice',
        severity: 'High',
        confidence: 0.89,
        symptoms: [
            'Diamond-shaped lesions on leaves',
            'White to gray centers with brown margins',
            'Neck rot in severe cases',
            'Reduced grain filling'
        ],
        causes: [
            'Fungal infection (Magnaporthe oryzae)',
            'High nitrogen levels',
            'Prolonged leaf wetness',
            'Dense planting'
        ],
        treatment: [
            'Apply Tricyclazole fungicide',
            'Reduce nitrogen fertilizer',
            'Drain fields temporarily',
            'Remove infected plants'
        ],
        prevention: [
            'Use resistant varieties',
            'Balanced fertilization',
            'Proper water management',
            'Seed treatment',
            'Crop rotation'
        ],
        imageUrl: '/disease-images/rice-blast.jpg'
    },
    {
        id: '4',
        name: 'Potato Early Blight',
        cropType: 'Potato',
        severity: 'Medium',
        confidence: 0.85,
        symptoms: [
            'Dark brown spots with concentric rings',
            'Lower leaves affected first',
            'Yellowing around spots',
            'Premature defoliation'
        ],
        causes: [
            'Fungal infection (Alternaria solani)',
            'Warm, humid conditions',
            'Plant stress',
            'Poor nutrition'
        ],
        treatment: [
            'Apply Mancozeb fungicide',
            'Remove infected leaves',
            'Improve plant nutrition',
            'Ensure proper irrigation'
        ],
        prevention: [
            'Crop rotation (3-4 years)',
            'Use certified seed',
            'Proper spacing',
            'Balanced fertilization',
            'Mulching'
        ],
        imageUrl: '/disease-images/potato-blight.jpg'
    },
    {
        id: '5',
        name: 'Healthy Crop',
        cropType: 'General',
        severity: 'None',
        confidence: 0.95,
        symptoms: [
            'Vibrant green leaves',
            'No spots or discoloration',
            'Healthy growth',
            'No visible damage'
        ],
        causes: [],
        treatment: ['No treatment needed - Continue regular care'],
        prevention: [
            'Maintain current practices',
            'Regular monitoring',
            'Proper nutrition',
            'Adequate watering'
        ],
        imageUrl: '/disease-images/healthy.jpg'
    }
]

/**
 * Predict disease from uploaded image
 */
export const predictFromImage = async (imageFile, cropId = null) => {
    if (MOCK_MODE) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Random disease prediction (weighted towards healthy)
        const random = Math.random()
        let disease

        if (random > 0.7) {
            // 30% chance of disease
            disease = MOCK_DISEASES[Math.floor(Math.random() * (MOCK_DISEASES.length - 1))]
        } else {
            // 70% chance of healthy
            disease = MOCK_DISEASES[4] // Healthy crop
        }

        return {
            prediction: {
                diseaseId: disease.id,
                diseaseName: disease.name,
                confidence: disease.confidence,
                severity: disease.severity,
                cropType: disease.cropType,
                symptoms: disease.symptoms,
                causes: disease.causes,
                treatment: disease.treatment,
                prevention: disease.prevention
            },
            imageUrl: URL.createObjectURL(imageFile),
            message: 'Disease analysis completed (Mock Mode)'
        }
    }

    // Use backend API proxy (avoids CORS and handles authentication)
    const formData = new FormData()
    formData.append('image', imageFile)
    if (cropId) formData.append('cropId', cropId)

    try {
        console.log('Sending image to backend for analysis...')
        const response = await api.post('/disease/predict-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        const data = response.data
        const mlResult = data.prediction // This is the payload from ML service wrapped by backend

        // Check for ML service errors returned via backend
        if (mlResult.error) {
            throw new Error(mlResult.error)
        }

        // The ML service structure nested inside backend response
        const prediction = mlResult.prediction || mlResult

        return {
            prediction: {
                diseaseId: prediction.diseaseId,
                diseaseName: prediction.diseaseName,
                confidence: prediction.confidence,
                severity: prediction.severity,
                cropType: prediction.cropType,
                symptoms: prediction.symptoms || [],
                causes: prediction.causes || [],
                treatment: prediction.treatment || [],
                prevention: prediction.prevention || prediction.preventionTips || []
            },
            validation: mlResult.validation || null,
            imageUrl: data.imageUrl || URL.createObjectURL(imageFile),
            message: data.message || 'Disease analysis completed (Real AI)'
        }
    } catch (error) {
        console.error('Disease analysis error:', error)

        // Handle error responses from backend
        const errorMessage = error.response?.data?.message || error.message || ''
        const lowerMessage = errorMessage.toLowerCase()

        if (lowerMessage.includes('not a plant') ||
            lowerMessage.includes('invalid image') ||
            lowerMessage.includes('not appear to be')) {
            throw new Error(errorMessage)
        }

        throw new Error('Failed to analyze image. Please ensure ML service is running.')
    }
}

/**
 * Predict disease from symptoms
 */
export const predictFromSymptoms = async (cropType, symptoms) => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Filter diseases by crop type
        const matchingDiseases = MOCK_DISEASES
            .filter(d => d.cropType.toLowerCase() === cropType.toLowerCase() || d.cropType === 'General')
            .map(disease => ({
                diseaseId: disease.id,
                diseaseName: disease.name,
                confidence: Math.random() * 0.3 + 0.6, // 0.6 to 0.9
                severity: disease.severity,
                symptoms: disease.symptoms,
                treatment: disease.treatment,
                prevention: disease.prevention
            }))
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3)

        return {
            matches: matchingDiseases,
            message: 'Symptom analysis completed (Mock Mode)'
        }
    }

    const response = await api.post('/disease/predict-symptoms', { cropType, symptoms })
    return response.data
}

/**
 * Get disease details
 */
export const getDiseaseDetails = async (diseaseId) => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const disease = MOCK_DISEASES.find(d => d.id === diseaseId)
        return { disease }
    }

    const response = await api.get(`/disease/${diseaseId}`)
    return response.data
}

/**
 * Get detection history
 */
export const getDetectionHistory = async () => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
            detections: [
                {
                    id: '1',
                    cropName: 'Tomato',
                    farmName: 'Main Farm',
                    disease: MOCK_DISEASES[0],
                    confidence: 0.92,
                    detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'detected'
                },
                {
                    id: '2',
                    cropName: 'Wheat',
                    farmName: 'North Farm',
                    disease: MOCK_DISEASES[4],
                    confidence: 0.95,
                    detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'healthy'
                }
            ]
        }
    }

    const response = await api.get('/disease/history')
    return response.data
}

/**
 * Get list of diseases
 */
export const listDiseases = async (cropType = null) => {
    if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        let diseases = MOCK_DISEASES

        if (cropType) {
            diseases = diseases.filter(d =>
                d.cropType.toLowerCase() === cropType.toLowerCase() || d.cropType === 'General'
            )
        }

        return { diseases }
    }

    const params = cropType ? `?cropType=${cropType}` : ''
    const response = await api.get(`/disease/list${params}`)
    return response.data
}
