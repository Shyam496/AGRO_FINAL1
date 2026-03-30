import api from './api'

const chatService = {
    /**
     * Send message to AI assistant
     * @param {string} message - User message
     * @param {string} [sessionId] - Existing session ID
     */
    sendMessage: async (message, sessionId, context) => {
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
