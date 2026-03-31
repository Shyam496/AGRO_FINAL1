import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Authentication middleware to verify JWT tokens
 */
export const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            })
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Verify token
        const JWT_SECRET_KEY = process.env.JWT_SECRET || 'agromind-demo-secret-key-12345'
        const decoded = jwt.verify(token, JWT_SECRET_KEY)

        // Get user from database
        let user
        try {
            user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    location: true
                }
            })
        } catch (dbError) {
            console.warn('⚠️ Database not available, using mock user for authentication.')
            // Fallback for demo mode
            user = {
                id: decoded.userId || 'demo-user-123',
                email: decoded.email || 'farmer@agromind.com',
                firstName: 'Demo',
                lastName: 'Farmer',
                role: 'farmer',
                location: 'Punjab, India'
            }
        }

        if (!user && !token.startsWith('mock-')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found'
            })
        }

        // Handle case where user is null but it's a mock token
        if (!user) {
            user = {
                id: 'demo-user-123',
                email: 'farmer@agromind.com',
                firstName: 'Demo',
                lastName: 'Farmer',
                role: 'farmer',
                location: 'Punjab, India'
            }
        }

        // Attach user to request object
        req.user = user
        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.error('JWT Error: Invalid token');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token'
            })
        }
        if (error.name === 'TokenExpiredError') {
            console.error('JWT Error: Token expired');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token expired'
            })
        }
        console.error('Authentication Error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: 'Error verifying authentication'
        })
    }
}

/**
 * Role-based access control middleware
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            })
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions'
            })
        }

        next()
    }
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const JWT_SECRET_KEY = process.env.JWT_SECRET || 'agromind-demo-secret-key-12345'
            const decoded = jwt.verify(token, JWT_SECRET_KEY)

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true
                }
            })

            if (user) {
                req.user = user
            }
        }
    } catch (error) {
        // Silently fail for optional auth
    }

    next()
}
