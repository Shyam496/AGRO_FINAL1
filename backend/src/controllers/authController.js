import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phoneNumber, location } = req.body

    // Validate input
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide all required fields'
        })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        return res.status(400).json({
            error: 'User exists',
            message: 'A user with this email already exists'
        })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            location,
            role: 'farmer'
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            location: true,
            role: true,
            createdAt: true
        }
    })

    // Generate token
    const token = generateToken(user.id)

    res.status(201).json({
        message: 'User registered successfully',
        user,
        token
    })
})

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide email and password'
        })
    }

    // Find user
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return res.status(401).json({
            error: 'Invalid credentials',
            message: 'Invalid email or password'
        })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(401).json({
            error: 'Invalid credentials',
            message: 'Invalid email or password'
        })
    }

    // Generate token
    const token = generateToken(user.id)

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
    })
})

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            location: true,
            role: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true
        }
    })

    res.json({ user })
})

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, phoneNumber, location } = req.body

    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phoneNumber && { phoneNumber }),
            ...(location && { location })
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            location: true,
            role: true,
            updatedAt: true
        }
    })

    res.json({
        message: 'Profile updated successfully',
        user: updatedUser
    })
})

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Please provide current and new password'
        })
    }

    // Get user with password
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    })

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
        return res.status(401).json({
            error: 'Invalid password',
            message: 'Current password is incorrect'
        })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
    })

    res.json({ message: 'Password changed successfully' })
})
