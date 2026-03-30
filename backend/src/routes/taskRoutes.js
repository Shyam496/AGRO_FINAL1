import express from 'express'
import { getTasks, createTask, updateTaskStatus, getSuitability } from '../controllers/taskController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// All task routes are protected
router.use(auth)

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id', updateTaskStatus)
router.post('/suitability', getSuitability)

export default router
