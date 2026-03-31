import api from './api'

const MOCK_MODE = false // Toggle this for standalone demo

const chatService = {
    /**
     * Send message to AI assistant
     * @param {string} message - User message
     * @param {string} [sessionId] - Existing session ID
     */
    sendMessage: async (message, sessionId, context) => {
        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 800))
            return {
                reply: "This is a simulated AI response. In the full version, I provide real-time agricultural advice based on your crops and location.",
                sessionId: sessionId || 'mock-session-123'
            }
        }
        const response = await api.post('/chat/message', { message, sessionId, context })
        return response.data
    },

    /**
     * Get chat history
     * @param {string} [sessionId] - Specific session ID
     */
    getHistory: async (sessionId) => {
        const response = await api.get('/chat/history', { params: { sessionId } })
        return response.data
    },

    /**
     * Delete chat session
     * @param {string} id - Session ID
     */
    deleteSession: async (id) => {
        const response = await api.delete(`/chat/session/${id}`)
        return response.data
    }
}

export default chatService
