/**
 * Generate unique ID
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Delay/sleep function
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key]
        if (!result[group]) {
            result[group] = []
        }
        result[group].push(item)
        return result
    }, {})
}

/**
 * Remove duplicates from array
 */
export const unique = (array, key = null) => {
    if (!key) {
        return [...new Set(array)]
    }
    return array.filter((item, index, self) =>
        index === self.findIndex((t) => t[key] === item[key])
    )
}

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1
        }
        return a[key] < b[key] ? 1 : -1
    })
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0
}

/**
 * Get initials from name
 */
export const getInitials = (name) => {
    if (!name) return ''
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

/**
 * Download file
 */
export const downloadFile = (data, filename, type = 'text/plain') => {
    const blob = new Blob([data], { type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (err) {
        console.error('Failed to copy:', err)
        return false
    }
}
