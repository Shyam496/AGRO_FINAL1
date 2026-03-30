import api from './api'

const schemeService = {
    /**
     * Get all active schemes
     * @param {Object} params - Query params (authority, search)
     */
    listSchemes: async (params = {}) => {
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
