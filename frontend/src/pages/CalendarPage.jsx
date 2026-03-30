import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/common/Sidebar'
import taskService from '../services/taskService'
import {
    Calendar as CalendarIcon, Plus, CheckCircle, Clock,
    Sun, Cloud, CloudRain, AlertTriangle, Info, MapPin,
    ChevronLeft, ChevronRight, Droplet, Wind, Wheat, X,
    CloudFog, CloudDrizzle, CloudSnow, Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CalendarPage() {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [suitability, setSuitability] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Location state
    const [location, setLocation] = useState('Chennai, India')
    const [locationCoords, setLocationCoords] = useState({ lat: 13.0827, lon: 80.2707 })
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [tempLocation, setTempLocation] = useState('')

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newTask, setNewTask] = useState({
        title: '',
        taskType: 'Other',
        priority: 'Medium',
        dueDate: new Date().toISOString().split('T')[0],
        cropName: '',
        description: '',
        weatherDependent: false
    })

    // Clear old cached tasks on mount (one-time cleanup)
    useEffect(() => {
        const hasCleared = sessionStorage.getItem('tasks_cleared')
        if (!hasCleared) {
            localStorage.removeItem('mock_tasks')
            sessionStorage.setItem('tasks_cleared', 'true')
        }
    }, [])

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/login')
            } else {
                fetchData()
            }
        }
    }, [isAuthenticated, authLoading, navigate])

    const fetchData = async (lat = locationCoords.lat, lon = locationCoords.lon) => {
        setLoading(true)
        try {
            const [taskData, suitabilityData] = await Promise.all([
                taskService.getTasks(),
                taskService.getCalendarSuitability(lat, lon)
            ])

            setTasks(taskData.tasks || [])
            setSuitability(suitabilityData.calendar || [])
        } catch (error) {
            console.error('Fetch error:', error)
            toast.error('Failed to load calendar data')
        } finally {
            setLoading(false)
        }
    }

    const handleMarkComplete = async (taskId) => {
        try {
            await taskService.deleteTask(taskId)
            toast.success('Task deleted successfully!')
            fetchData()
        } catch (error) {
            toast.error('Failed to delete task')
        }
    }

    const handleAddTask = async (e) => {
        e.preventDefault()

        // Prevent adding tasks in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(newTask.dueDate);

        if (taskDate < today) {
            toast.error('Cannot schedule tasks for past dates');
            return;
        }

        try {
            await taskService.createTask(newTask)
            toast.success('Task scheduled successfully!')
            setIsModalOpen(false)
            setNewTask({
                title: '',
                taskType: 'Other',
                priority: 'Medium',
                dueDate: selectedDate.toISOString().split('T')[0],
                cropName: '',
                description: '',
                weatherDependent: false
            })
            fetchData()
        } catch (error) {
            toast.error('Failed to schedule task')
        }
    }

    const handleDateClick = (date) => {
        setSelectedDate(date)
        setNewTask(prev => ({ ...prev, dueDate: date.toISOString().split('T')[0] }))
    }

    const handleLocationChange = async () => {
        if (tempLocation.trim()) {
            try {
                setIsLocationModalOpen(false)
                toast.loading('Fetching weather data...')

                // Try to geocode the location using a simple geocoding service
                // For now, we'll use OpenStreetMap's Nominatim API (free, no API key needed)
                const geocodeResponse = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tempLocation)}&format=json&limit=1`,
                    { headers: { 'User-Agent': 'AgroMind-App' } }
                )

                if (geocodeResponse.ok) {
                    const geocodeData = await geocodeResponse.json()
                    if (geocodeData && geocodeData.length > 0) {
                        const { lat, lon } = geocodeData[0]
                        setLocationCoords({ lat: parseFloat(lat), lon: parseFloat(lon) })
                        setLocation(tempLocation)

                        // Fetch weather data for new location
                        await fetchData(parseFloat(lat), parseFloat(lon))
                        toast.dismiss()
                        toast.success(`Weather updated for ${tempLocation}`)
                    } else {
                        toast.dismiss()
                        toast.error('Location not found. Please try a different name.')
                    }
                } else {
                    toast.dismiss()
                    toast.error('Failed to geocode location')
                }
            } catch (error) {
                console.error('Location change error:', error)
                toast.dismiss()
                toast.error('Failed to update location')
            }
        }
    }

    // Helper function to render weather icons based on conditions
    const getWeatherIcon = (weatherIcon, rainfall, description) => {
        const iconClass = "w-6 h-6"

        // Heavy rain
        if (rainfall > 50 || description?.includes('heavy rain')) {
            return <CloudRain className={`${iconClass} text-blue-700`} />
        }
        // Thunderstorm
        if (description?.includes('thunder') || description?.includes('storm')) {
            return <Zap className={`${iconClass} text-yellow-500`} />
        }
        // Fog
        if (description?.includes('fog') || description?.includes('mist')) {
            return <CloudFog className={`${iconClass} text-gray-500`} />
        }
        // Drizzle or light rain
        if (rainfall > 0 && rainfall <= 10 || description?.includes('drizzle')) {
            return <CloudDrizzle className={`${iconClass} text-blue-400`} />
        }
        // Moderate rain
        if (rainfall > 10 || weatherIcon === 'cloud-rain') {
            return <CloudRain className={`${iconClass} text-blue-500`} />
        }
        // Snow
        if (description?.includes('snow')) {
            return <CloudSnow className={`${iconClass} text-blue-200`} />
        }
        // Cloudy
        if (weatherIcon === 'cloud') {
            return <Cloud className={`${iconClass} text-gray-400`} />
        }
        // Default sunny
        return <Sun className={`${iconClass} text-amber-500`} />
    }

    // Calendar logic helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

    const renderHeader = () => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        return (
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h1>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors border-l border-gray-200"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
        )
    }

    const renderSuitabilityPill = (suit) => {
        if (!suit) return null

        const counts = { optimal: 0, caution: 0, avoid: 0 }
        Object.values(suit).forEach(v => {
            if (v === 'optimal') counts.optimal++
            else if (v === 'caution') counts.caution++
            else if (v === 'avoid') counts.avoid++
        })

        if (counts.avoid > 0) return <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm" title="Hazardous Conditions" />
        if (counts.caution > 0) return <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" title="Cautionary Window" />
        return <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" title="Optimal Day" />
    }

    const renderGrid = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month)
        const days = []

        // Weekday headers
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        // Fill blanks
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`blank-${i}`} className="h-20 bg-gray-50/30" />)
        }

        // Fill days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const dateStr = date.toISOString().split('T')[0]
            const isSelected = selectedDate.toDateString() === date.toDateString()
            const isToday = new Date().toDateString() === date.toDateString()

            const dayTasks = tasks.filter(t => t.dueDate.startsWith(dateStr))

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(date)}
                    className={`h-20 p-3 transition-all cursor-pointer flex flex-col items-start justify-start relative
                        ${isSelected
                            ? 'bg-teal-100 border-2 border-teal-400 rounded-2xl'
                            : isToday
                                ? 'bg-gray-100 rounded-2xl'
                                : 'hover:bg-gray-50'
                        }`}
                >
                    <span className={`text-sm font-medium ${isSelected || isToday ? 'text-gray-900' : 'text-gray-600'}`}>
                        {day}
                    </span>
                </div>
            )
        }

        return (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {weekDays.map(d => (
                        <div key={d} className="py-3 text-center text-xs font-medium text-gray-500">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2 p-4">
                    {days}
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {renderHeader()}

                    <div className="space-y-8">
                        {/* Row 1: Calendar Grid & Selected Day Tasks */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                            <div className="lg:col-span-2">
                                {loading ? (
                                    <div className="p-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col justify-center">
                                        <div className="inline-block animate-spin h-12 w-12 border-[4px] border-primary-500 border-t-transparent rounded-full mb-6 mx-auto"></div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Syncing with AI Engines</h3>
                                        <p className="text-gray-500">Analyzing weather patterns and crop schedules...</p>
                                    </div>
                                ) : (
                                    renderGrid()
                                )}
                            </div>

                            <div className="lg:col-span-1">
                                {!loading && (
                                    <div className="card bg-white border border-gray-200 rounded-2xl p-6 h-full flex flex-col">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                            <CalendarIcon className="w-6 h-6 text-teal-500" />
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </h2>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            {tasks.filter(t => t.dueDate.startsWith(selectedDate.toISOString().split('T')[0])).length > 0 ? (
                                                <div className="space-y-4">
                                                    {tasks.filter(t => t.dueDate.startsWith(selectedDate.toISOString().split('T')[0])).map(task => (
                                                        <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2 rounded-lg ${task.status === 'completed' ? 'bg-green-100' : 'bg-primary-100'}`}>
                                                                    {task.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-primary-600" />}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-900">{task.title}</h3>
                                                                    <p className="text-sm text-gray-500">{task.cropName} • {task.priority} Priority</p>
                                                                </div>
                                                            </div>
                                                            {task.status !== 'completed' && (
                                                                <button
                                                                    onClick={() => handleMarkComplete(task.id)}
                                                                    className="text-primary-600 font-bold text-sm hover:underline"
                                                                >
                                                                    Mark Done
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setIsModalOpen(true)}
                                                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-primary-300 hover:text-primary-600 transition-all"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                        Add Another Task
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col h-full justify-between py-4">
                                                    <div className="text-center py-12">
                                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                            <CalendarIcon className="w-10 h-10 text-gray-300" />
                                                        </div>
                                                        <p className="text-gray-500 font-semibold text-lg">No tasks for this day</p>
                                                    </div>

                                                    <button
                                                        onClick={() => setIsModalOpen(true)}
                                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                        Add Task
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Weather, Upcoming Tasks & AI Insights */}
                        {!loading && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* 7-Day Weather Forecast */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <Sun className="w-5 h-5 text-amber-500" />
                                                7-Day Weather Forecast
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setTempLocation(location)
                                                    setIsLocationModalOpen(true)
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm font-medium">{location}</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-2">
                                            {suitability.slice(0, 7).map((day, idx) => (
                                                <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">
                                                        {day.day_name?.substring(0, 3) || 'N/A'}
                                                    </p>
                                                    <div className="flex justify-center mb-2">
                                                        {getWeatherIcon(day.weather_icon, day.rainfall, day.description)}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">{day.temperature}°C</p>
                                                    {day.rainfall > 0 && (
                                                        <p className="text-xs text-blue-600 mt-1">{day.rainfall}mm</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Upcoming Tasks Timeline */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-primary-600" />
                                            Upcoming Tasks
                                        </h3>
                                        {tasks.length > 0 ? (
                                            <div className="space-y-3">
                                                {tasks.slice(0, 5).map(task => {
                                                    const taskDate = new Date(task.dueDate)
                                                    const weatherForTask = suitability.find(s => s.date.startsWith(task.dueDate.split('T')[0]))
                                                    return (
                                                        <div key={task.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center border border-gray-200">
                                                                    <span className="text-xs font-medium text-gray-500">
                                                                        {taskDate.toLocaleDateString('en-US', { month: 'short' })}
                                                                    </span>
                                                                    <span className="text-lg font-bold text-gray-900">
                                                                        {taskDate.getDate()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-gray-900 truncate">{task.title}</h4>
                                                                <p className="text-sm text-gray-500">{task.cropName} • {task.priority} Priority</p>
                                                            </div>
                                                            {weatherForTask && (
                                                                <div className="flex-shrink-0">
                                                                    {getWeatherIcon(weatherForTask.weather_icon, weatherForTask.rainfall, weatherForTask.description)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-8">No upcoming tasks scheduled</p>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-1">
                                    {/* AI Insights Card - Full Height to span Weather + Upcoming */}
                                    {suitability.length > 0 && (() => {
                                        // Analyze 7-day forecast
                                        const forecast = suitability.slice(0, 7)
                                        const next3Days = forecast.slice(0, 3)

                                        // 7-Day "Best Day" Analysis Logic
                                        const findBestDay = (category) => {
                                            if (category === 'spraying') {
                                                // Best spraying: 0 rainfall and clear/sunny
                                                return forecast.reduce((best, current) => {
                                                    const currentRain = current.rainfall || 0
                                                    const bestRain = best.rainfall || 0
                                                    return (currentRain < bestRain) ? current : best
                                                }, forecast[0])
                                            }
                                            if (category === 'irrigation') {
                                                // Best irrigation: Dry day, highest temp (highest evaporative demand)
                                                const dryDays = forecast.filter(d => (d.rainfall || 0) === 0)
                                                if (dryDays.length === 0) return forecast[0]
                                                return dryDays.reduce((best, current) => (current.temperature > best.temperature ? current : best), dryDays[0])
                                            }
                                            if (category === 'harvesting') {
                                                // Best harvesting: Lowest rainfall and clear weather
                                                return forecast.reduce((best, current) => {
                                                    const currentRain = current.rainfall || 0
                                                    const bestRain = best.rainfall || 0
                                                    if (currentRain < bestRain) return current
                                                    if (currentRain === bestRain && !current.description?.toLowerCase().includes('rain')) return current
                                                    return best
                                                }, forecast[0])
                                            }
                                            return forecast[0]
                                        }

                                        const bestSprayDay = findBestDay('spraying')
                                        const bestIrrigationDay = findBestDay('irrigation')
                                        const bestHarvestDay = findBestDay('harvesting')

                                        // Analysis
                                        const totalRainfall = forecast.reduce((sum, s) => sum + (s.rainfall || 0), 0)
                                        const rainyDays = forecast.filter(s => s.rainfall > 10).length
                                        const heavyRainDays = forecast.filter(s => s.rainfall > 30).length
                                        const rainToday = next3Days[0].rainfall || 0
                                        const tempToday = Math.round(next3Days[0].temperature || 0)
                                        const currentCity = location.split(',')[0] || 'your area'

                                        // Advice Randomizer Helper
                                        const getRandomMessage = (category, status, context) => {
                                            const messages = {
                                                spraying: {
                                                    safe: [
                                                        `Perfect day in ${currentCity} for spraying. Calm winds and ${tempToday}°C are ideal.`,
                                                        `Great conditions for pesticide application today. Stick to the morning window.`,
                                                        `Clear skies ahead. High of ${tempToday}°C makes today the best spraying window.`
                                                    ],
                                                    caution: [
                                                        `Caution in ${currentCity}. Light rain possible soon. Best wait for ${context.bestDay}.`,
                                                        `Conditions are sub-optimal. Next best window is ${context.bestDay} when it's drier.`,
                                                        `Slight risk of wash-off today. Plan for ${context.bestDay} for better efficacy.`
                                                    ],
                                                    danger: [
                                                        `Avoid spraying! Rain in ${currentCity} will wash away pesticides. Wait for ${context.bestDay}.`,
                                                        `Alert: High rain risk today. Postpone all spraying until ${context.bestDay}.`,
                                                        `Not safe to spray. Wet conditions detected. Next clear day: ${context.bestDay}.`
                                                    ]
                                                },
                                                irrigation: {
                                                    safe: [
                                                        `Safe to irrigate today. ${tempToday}°C in ${currentCity} keeps soil demand steady.`,
                                                        `Optimal moisture levels. A standard cycle is recommended for ${currentCity}.`,
                                                        `Morning irrigation is ideal today. Soil will absorb well at ${tempToday}°C.`
                                                    ],
                                                    caution: [
                                                        `Reduce irrigation. Moderate rain in ${currentCity} is already hydrating crops.`,
                                                        `Soil is moisture-rich from recent showers. Best day to resume: ${context.bestDay}.`,
                                                        `Caution: Dry spell at ${tempToday}°C in ${currentCity}. Plan for extra water on ${context.bestDay}.`
                                                    ],
                                                    danger: [
                                                        `Skip irrigation. Heavy rain in ${currentCity} will saturate the soil.`,
                                                        `Stop cycle today. Natural rainfall is sufficient. Best timing: ${context.bestDay}.`,
                                                        `Saturated soil alert! No watering needed today. Plan for ${context.bestDay} instead.`
                                                    ]
                                                },
                                                harvesting: {
                                                    safe: [
                                                        `Perfect for harvest! Dry conditions and ${tempToday}°C are great for ${currentCity}.`,
                                                        `Ideal harvesting window open. Minimal moisture risk today.`,
                                                        `Great timing for harvest in ${currentCity}. Best dry window ends on ${context.bestDay}.`
                                                    ],
                                                    caution: [
                                                        `Monitor moisture. Light rain in ${currentCity} might delay drying. Best: ${context.bestDay}.`,
                                                        `Caution: Humidity is high at ${tempToday}°C. Target ${context.bestDay} for peak dryness.`,
                                                        `Window closing soon. If possible, wait for the clearer skies on ${context.bestDay}.`
                                                    ],
                                                    danger: [
                                                        `Delay harvest! Rain in ${currentCity} will damage crop quality. Wait for ${context.bestDay}.`,
                                                        `High moisture risk. Postpone harvest until ${context.bestDay} for better storage.`,
                                                        `Alert: Wet soil in ${currentCity} will make harvest difficult. Stay on standby until ${context.bestDay}.`
                                                    ]
                                                }
                                            }

                                            const variations = messages[category][status]
                                            // Use a stable random based on the date to avoid jumps on every minor re-render, 
                                            // but allow variety day-to-day.
                                            const seed = new Date().getDate() + category.length + status.length
                                            return variations[seed % variations.length]
                                        }

                                        // 1. Pesticide Spraying Advice
                                        let sprayTitle = 'Pesticide Spraying'
                                        let sprayStatus = 'safe'
                                        if (rainToday > 0 || next3Days[0].description?.includes('rain')) {
                                            sprayStatus = 'danger'
                                        } else if (next3Days.some(d => d.rainfall > 5)) {
                                            sprayStatus = 'caution'
                                        }
                                        let sprayAdvice = getRandomMessage('spraying', sprayStatus, { bestDay: bestSprayDay.day_name })

                                        // 2. Irrigation Advice
                                        let irrigationTitle = 'Irrigation Advice'
                                        let irrigationStatus = 'safe'
                                        if (rainToday > 10 || heavyRainDays > 0) {
                                            irrigationStatus = 'danger'
                                        } else if (rainyDays >= 3 || totalRainfall > 30 || totalRainfall === 0) {
                                            irrigationStatus = 'caution'
                                        }
                                        let irrigationAdviceLabel = getRandomMessage('irrigation', irrigationStatus, { bestDay: bestIrrigationDay.day_name })

                                        // 3. Harvesting Advisory
                                        let harvestTitle = 'Harvesting Advisory'
                                        let harvestStatus = 'safe'
                                        const dryDays = forecast.filter(s => s.rainfall === 0).length
                                        if (heavyRainDays > 0 || rainToday > 5) {
                                            harvestStatus = 'danger'
                                        } else if (rainyDays > 0 || dryDays < 3) {
                                            harvestStatus = 'caution'
                                        }
                                        let harvestAdviceLabel = getRandomMessage('harvesting', harvestStatus, { bestDay: bestHarvestDay.day_name })

                                        return (
                                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm h-full flex flex-col">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Info className="w-5 h-5 text-teal-600" />
                                                    <h3 className="text-base font-bold text-gray-900">AI Insights</h3>
                                                </div>
                                                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                                                    {/* Pesticide Spraying */}
                                                    <div className={`p-3 rounded-2xl border ${sprayStatus === 'danger' ? 'bg-red-200 border-red-300' :
                                                            sprayStatus === 'caution' ? 'bg-amber-200 border-amber-300' :
                                                                'bg-green-200 border-green-300'
                                                        }`}>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-900">{sprayTitle}</p>
                                                        <p className="font-bold text-base text-gray-900 leading-snug">
                                                            {sprayAdvice}
                                                        </p>
                                                    </div>

                                                    {/* Irrigation Advice */}
                                                    <div className={`p-3 rounded-2xl border ${irrigationStatus === 'danger' ? 'bg-red-200 border-red-300' :
                                                            irrigationStatus === 'caution' ? 'bg-amber-200 border-amber-300' :
                                                                'bg-green-200 border-green-300'
                                                        }`}>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-900">{irrigationTitle}</p>
                                                        <p className="font-bold text-base text-gray-900 leading-snug">
                                                            {irrigationAdviceLabel}
                                                        </p>
                                                    </div>

                                                    {/* Harvesting Advisory */}
                                                    <div className={`p-3 rounded-2xl border ${harvestStatus === 'danger' ? 'bg-red-200 border-red-300' :
                                                            harvestStatus === 'caution' ? 'bg-amber-200 border-amber-300' :
                                                                'bg-green-200 border-green-300'
                                                        }`}>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-900">{harvestTitle}</p>
                                                        <p className="font-bold text-base text-gray-900 leading-snug">
                                                            {harvestAdviceLabel}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal - Matching Image 1 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-100 relative bg-gray-50/50">
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">Add New Task</h2>
                                <p className="text-sm font-medium text-gray-500 mt-1">Schedule a farming activity for your crops</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-1/2 -translate-y-1/2 right-6 p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddTask} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g., Apply fertilizer to wheat field"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Task Type</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        value={newTask.taskType}
                                        onChange={e => setNewTask({ ...newTask, taskType: e.target.value })}
                                    >
                                        <option>Irrigation</option>
                                        <option>Fertilization</option>
                                        <option>Pest Control</option>
                                        <option>Harvesting</option>
                                        <option>Sowing</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Scheduled Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        value={newTask.dueDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Crop Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="e.g., Wheat"
                                        value={newTask.cropName}
                                        onChange={e => setNewTask({ ...newTask, cropName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24 placeholder:text-gray-300"
                                    placeholder="Additional notes..."
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={newTask.weatherDependent}
                                        onChange={e => setNewTask({ ...newTask, weatherDependent: e.target.checked })}
                                    />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-primary-500 peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-700">Weather dependent task</span>
                            </label>

                            <div className="space-y-3 pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-[#67B99A] text-white rounded-xl text-lg font-bold shadow-lg shadow-green-100 hover:bg-[#58a085] active:scale-[0.98] transition-all"
                                >
                                    Add Task
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }

            {/* Location Modal */}
            {
                isLocationModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                            <div className="p-8 border-b border-gray-100 relative bg-gray-50/50">
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Change Location</h2>
                                    <p className="text-sm font-medium text-gray-500 mt-1">Enter your location for weather forecast</p>
                                </div>
                                <button
                                    onClick={() => setIsLocationModalOpen(false)}
                                    className="absolute top-1/2 -translate-y-1/2 right-6 p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-gray-300"
                                            placeholder="e.g., Chennai, India"
                                            value={tempLocation}
                                            onChange={e => setTempLocation(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && handleLocationChange()}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Enter city name or coordinates</p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleLocationChange}
                                        className="w-full py-4 bg-teal-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-[0.98] transition-all"
                                    >
                                        Update Location
                                    </button>
                                    <button
                                        onClick={() => setIsLocationModalOpen(false)}
                                        className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
