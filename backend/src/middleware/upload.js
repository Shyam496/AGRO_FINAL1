import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads directory exists
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production'
const uploadsDir = isVercel ? '/tmp/uploads' : path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true })
    } catch (e) {
        console.warn("Could not create uploads directory:", e.message)
    }
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'))
    }
}

// Configure multer
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: fileFilter
})

// Single file upload middleware
export const uploadSingle = (fieldName) => upload.single(fieldName)

// Multiple files upload middleware
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount)
