import express from 'express'
import { getCrops, addCrop, getCropTasks, addTask, updateTask, deleteTask } from '../controllers/cropController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.get('/', auth, getCrops)
router.post('/', auth, addCrop)
router.get('/:id/tasks', auth, getCropTasks)
router.post('/:id/tasks', auth, addTask)
router.put('/tasks/:id', auth, updateTask)
router.delete('/tasks/:id', auth, deleteTask)

export default router
