// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// App Name
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'AgroMind'

// Colors
export const COLORS = {
    primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
    },
    secondary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3B82F6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    }
}

// Crop Types
export const CROP_TYPES = [
    'Wheat',
    'Rice',
    'Tomato',
    'Potato',
    'Cotton',
    'Maize',
    'Sugarcane',
    'Soybean',
    'Onion',
    'Chili'
]

// Task Types
export const TASK_TYPES = [
    'Sowing',
    'Irrigation',
    'Fertilizer',
    'Pesticide',
    'Weeding',
    'Harvesting',
    'Other'
]

// Task Priorities
export const TASK_PRIORITIES = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' }
]

// Expense Categories
export const EXPENSE_CATEGORIES = [
    'Seeds',
    'Fertilizer',
    'Pesticide',
    'Labor',
    'Equipment',
    'Irrigation',
    'Transportation',
    'Other'
]

// Growth Stages
export const GROWTH_STAGES = [
    'Sowing',
    'Germination',
    'Vegetative',
    'Flowering',
    'Fruiting',
    'Maturity'
]

// Soil Types
export const SOIL_TYPES = [
    'Alluvial',
    'Black',
    'Red',
    'Laterite',
    'Desert',
    'Mountain'
]

// Date Format
export const DATE_FORMAT = 'yyyy-MM-dd'
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'
