import api from './api'

const MOCK_MODE = false // Toggle this for standalone demo

const schemeService = {
    /**
     * Get all active schemes
     * @param {Object} params - Query params (authority, search)
     */
    listSchemes: async (params = {}) => {
        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 400))
            return {
                schemes: [
                    { id: '1', name: 'PM Kisan Samman Nidhi', authority: 'central', benefits: '₹6000 per year in 3 installments', status: 'active', eligibility: 'Small and marginal farmers' },
                    { id: '2', name: 'Pradhan Mantri Fasal Bima Yojana', authority: 'central', benefits: 'Crop insurance against natural calamities', status: 'active', eligibility: 'All farmers including sharecroppers' },
                    { id: '3', name: 'Soil Health Card Scheme', authority: 'central', benefits: 'Free soil testing and customized recommendations', status: 'active', eligibility: 'All landholders' }
                ]
            }
        }
        const response = await api.get('/schemes', { params })
        return response.data
    },

    /**
     * Get scheme details by ID
     */
    getSchemeDetails: async (id) => {
        const response = await api.get(`/schemes/${id}`)
        return response.data
    },

    /**
     * Check user eligibility for schemes
     * @param {Object} profile - { landSize, cropType, income, category }
     */
    checkEligibility: async (profile) => {
        const response = await api.post('/schemes/check-eligibility', profile)
        return response.data
    }
}

export default schemeService
