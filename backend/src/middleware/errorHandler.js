/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err)

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(400).json({
            error: 'Duplicate entry',
            message: 'A record with this value already exists'
        })
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Not found',
            message: 'The requested resource was not found'
        })
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            message: err.message,
            details: err.errors
        })
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token',
            message: 'The provided token is invalid'
        })
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            message: 'Your session has expired, please login again'
        })
    }

    // Multer errors (file upload)
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'The uploaded file exceeds the maximum size limit'
            })
        }
        return res.status(400).json({
            error: 'Upload error',
            message: err.message
        })
    }

    // Default error
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        error: err.name || 'Internal server error',
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}
