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
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Get user from database
        const user = await prisma.user.findUnique({
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

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found'
            })
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

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
