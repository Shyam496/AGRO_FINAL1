import express from 'express'
import { sendMessage, getHistory, deleteSession } from '../controllers/chatController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// All chat routes require authentication
router.post('/message', auth, sendMessage)
router.get('/history', auth, getHistory)
router.delete('/session/:id', auth, deleteSession)

export default router
