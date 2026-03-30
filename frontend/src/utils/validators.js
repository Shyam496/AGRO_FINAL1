/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{4,10}$/
    return phoneRegex.test(phone)
}

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
    // At least 8 characters, 1 letter, 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
    return passwordRegex.test(password)
}

/**
 * Validate required field
 */
export const isRequired = (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== ''
}

/**
 * Validate number range
 */
export const isInRange = (value, min, max) => {
    const num = parseFloat(value)
    return !isNaN(num) && num >= min && num <= max
}

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
    const maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes
    return file.size <= maxSize
}

/**
 * Validate image file type
 */
export const isValidImageType = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    return validTypes.includes(file.type)
}
