import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/common/Sidebar'
import { Cloud, Droplets, Wind, Eye, MapPin, Search, Loader, CloudRain, CloudSnow, Sun, Leaf, AlertTriangle, AlertCircle, CheckCircle, Droplet } from 'lucide-react'
import api from '../services/api'

const MOCK_MODE = false // Toggle for standalone demo

export default function WeatherPage() {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [city, setCity] = useState('')
    const [searchCity, setSearchCity] = useState('')
    const [currentWeather, setCurrentWeather] = useState(null)
    const [forecast, setForecast] = useState([])
    const [advisory, setAdvisory] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])


    const fetchWeatherByCity = async (cityName) => {
        setLoading(true)
        setError(null)

        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 800))
            const mockWeather = {
                temperature: 28,
                description: 'Partly Cloudy',
                humidity: 65,
                wind_speed: 12,
                visibility: 10,
                location: cityName
            }
            setCurrentWeather(mockWeather)
            setCity(cityName)
            setForecast([
                { day: 'Mon', temp_max: 30, temp_min: 22, condition: 'Sunny', rainfall: 0 },
                { day: 'Tue', temp_max: 29, temp_min: 21, condition: 'Partly Cloudy', rainfall: 0 },
                { day: 'Wed', temp_max: 27, temp_min: 23, condition: 'Cloudy', rainfall: 2 },
                { day: 'Thu', temp_max: 26, temp_min: 22, condition: 'Rain', rainfall: 15 },
                { day: 'Fri', temp_max: 28, temp_min: 21, condition: 'Partly Cloudy', rainfall: 0 },
                { day: 'Sat', temp_max: 31, temp_min: 23, condition: 'Sunny', rainfall: 0 },
                { day: 'Sun', temp_max: 32, temp_min: 24, condition: 'Sunny', rainfall: 0 }
            ])
            setAdvisory({
                irrigation: { title: 'Irrigation', status: 'Optimal', status_type: 'success', message: 'Ideal conditions for irrigation today.' },
                harvesting: { title: 'Harvesting', status: 'Caution', status_type: 'warning', message: 'Rain expected on Thursday, plan accordingly.' },
                spraying: { title: 'Spraying', status: 'Optimal', status_type: 'success', message: 'Low wind speeds make this a good time to spray.' },
                activities: ['Apply top-dressing fertilizer', 'Check for early signs of pests', 'Clean irrigation channels'],
                alerts: []
            })
            setLoading(false)
            return
        }

        try {
            // Get current weather via backend proxy
            const weatherRes = await api.get(`/weather/current?location=${encodeURIComponent(cityName)}`)
            const weatherData = weatherRes.data

            if (weatherData.success) {
                setCurrentWeather(weatherData.weather)
                setCity(weatherData.weather.location || cityName)

                // Get forecast via backend proxy
                const forecastRes = await api.get(`/weather/forecast?location=${encodeURIComponent(cityName)}`)
                setForecast(forecastRes.data.forecast || [])

                // Fetch farming advisory via backend proxy
                fetchAdvisory(null, null, cityName)
            } else {
                throw new Error(weatherData.error || 'Failed to fetch weather')
            }
        } catch (err) {
            console.error('Weather fetch error:', err)
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchAdvisory = async (lat, lon, cityName) => {
        try {
            let url = '/weather/advisory'
            if (cityName) url += `?location=${encodeURIComponent(cityName)}`
            else if (lat && lon) url += `?lat=${lat}&lon=${lon}`

            const response = await api.get(url)
            const data = response.data
            if (data.success) {
                setAdvisory(data.advisory)
            }
        } catch (err) {
            console.error('Advisory fetch error:', err)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchCity.trim()) {
            fetchWeatherByCity(searchCity.trim())
            setSearchCity('')
        }
    }

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const response = await api.get(`/weather/current?lat=${latitude}&lon=${longitude}`)
                    const data = response.data
                    if (data.success) {
                        setCurrentWeather(data.weather)
                        setCity(data.weather.location || 'Your Location')

                        const forecastRes = await api.get(`/weather/forecast?lat=${latitude}&lon=${longitude}`)
                        setForecast(forecastRes.data.forecast || [])

                        fetchAdvisory(latitude, longitude)
                    } else {
                        throw new Error(data.error)
                    }
                } catch (err) {
                    setError(err.response?.data?.message || err.message)
                } finally {
                    setLoading(false)
                }
            },
            (err) => {
                setLoading(false)
                setError('Location access denied. Please enter a city manually.')
            }
        )
    }

    const getWeatherIcon = (condition) => {
        const cond = condition?.toLowerCase() || ''
        if (cond.includes('rain')) return <CloudRain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        if (cond.includes('cloud')) return <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        if (cond.includes('snow')) return <CloudSnow className="w-8 h-8 text-blue-300 mx-auto mb-2" />
        return <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            <Cloud className="inline w-8 h-8 mr-2 text-primary-500" />
                            Weather Analytics
                        </h1>
                        <p className="text-gray-600">
                            7-day forecast powered by NASA weather model
                        </p>
                    </div>

                    {/* Location Search */}
                    <div className="card mb-6">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="flex-1 relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchCity}
                                    onChange={(e) => setSearchCity(e.target.value)}
                                    onFocus={() => {
                                        setError(null)
                                        setCurrentWeather(null)
                                        setForecast([])
                                        setAdvisory(null)
                                    }}
                                    placeholder="Enter city name (e.g., Chennai, Mumbai, Delhi)"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:outline-none focus:ring-0 focus:border-[#10B981] transition-all bg-white text-gray-800 placeholder-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleUseMyLocation}
                                    title="Use my current location"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-primary-600 hover:bg-primary-50 rounded-md transition"
                                >
                                    <MapPin className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary px-6 py-3 flex items-center gap-2"
                            >
                                {loading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                                Search
                            </button>
                        </form>
                        {city && (
                            <p className="text-sm text-gray-500 mt-2">
                                Current location: <span className="font-medium text-gray-700">{city}</span>
                            </p>
                        )}
                    </div>

                    {/* Empty State / Welcome Message */}
                    {!loading && !currentWeather && !error && (
                        <div className="card mb-6 text-center py-16 animate-fade-in border-dashed border-2 border-gray-200">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Ready to Forecast</h2>
                            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                                Enter the current location for <span className="font-bold text-blue-600">7 day weather forecast</span> and automatic location also available.
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className={`card mb-6 border-l-4 ${error.toLowerCase().includes('location') || error.toLowerCase().includes('identify')
                            ? 'bg-amber-50 border-amber-400 text-amber-800'
                            : 'bg-red-50 border-red-400 text-red-800'
                            }`}>
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5" />
                                <div>
                                    <p className="font-bold">{error}</p>
                                    {!error.toLowerCase().includes('location') && !error.toLowerCase().includes('identify') && (
                                        <p className="text-sm mt-1">Please ensure the ML service is running on port 5001.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="card mb-6 text-center py-12">
                            <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                            <p className="text-gray-600">Loading weather data...</p>
                        </div>
                    )}

                    {/* Current Weather */}
                    {!loading && currentWeather && (
                        <div className="card mb-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 mb-2">Current Weather</p>
                                    <p className="text-5xl font-bold mb-2">{currentWeather.temperature}°C</p>
                                    <p className="text-xl text-blue-100">{currentWeather.description}</p>
                                    <p className="text-sm text-blue-200 mt-1">{currentWeather.location}</p>
                                </div>
                                <Cloud className="w-24 h-24 text-blue-200" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-400">
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-5 h-5" />
                                    <div>
                                        <p className="text-xs text-blue-100">Humidity</p>
                                        <p className="font-bold">{currentWeather.humidity}%</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wind className="w-5 h-5" />
                                    <div>
                                        <p className="text-xs text-blue-100">Wind</p>
                                        <p className="font-bold">{currentWeather.wind_speed} km/h</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    <div>
                                        <p className="text-xs text-blue-100">Visibility</p>
                                        <p className="font-bold">{currentWeather.visibility} km</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 7-Day Forecast */}
                    {!loading && forecast.length > 0 && (
                        <div className="card mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                7-Day Forecast
                                <span className="text-sm font-normal text-gray-500 ml-2">(NASA Model Predictions)</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {forecast.map((day, index) => (
                                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <p className="font-medium text-gray-900 mb-2">{day.day}</p>
                                        {getWeatherIcon(day.condition)}
                                        <p className="text-2xl font-bold text-gray-900">{day.temp_max}°</p>
                                        <p className="text-sm text-gray-600">{day.temp_min}°</p>
                                        <p className="text-xs text-gray-600 mt-1">{day.condition}</p>
                                        {day.rainfall > 0 && (
                                            <p className="text-xs text-blue-600 mt-1">{day.rainfall}mm</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Farming Advisory Section */}
                    {!loading && advisory && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Leaf className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Farming Advisory</h2>
                            </div>

                            <div className="grid gap-4 mb-8">
                                {/* Irrigation Card */}
                                <div className={`rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 border ${advisory.irrigation.status_type === 'danger'
                                    ? 'bg-red-50/50 border-red-100'
                                    : advisory.irrigation.status_type === 'warning'
                                        ? 'bg-amber-50/50 border-amber-100'
                                        : 'bg-green-50/50 border-green-100'
                                    }`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${advisory.irrigation.status_type === 'danger'
                                                ? 'bg-red-100'
                                                : advisory.irrigation.status_type === 'warning'
                                                    ? 'bg-amber-100'
                                                    : 'bg-green-100'
                                                }`}>
                                                <Droplet className={`w-5 h-5 ${advisory.irrigation.status_type === 'danger'
                                                    ? 'text-red-600'
                                                    : advisory.irrigation.status_type === 'warning'
                                                        ? 'text-amber-600'
                                                        : 'text-green-600'
                                                    }`} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{advisory.irrigation.title}</h3>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-xl text-sm font-semibold ${advisory.irrigation.status_type === 'danger'
                                            ? 'bg-red-100 text-red-700'
                                            : advisory.irrigation.status_type === 'warning'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {advisory.irrigation.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-lg mb-2">
                                        {advisory.irrigation.message}
                                    </p>
                                    {advisory.irrigation.points && (
                                        <ul className="list-disc list-inside text-gray-500 text-sm space-y-1">
                                            {advisory.irrigation.points.map((p, i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    )}
                                </div>

                                {/* Harvesting Card */}
                                <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border ${advisory.harvesting.status_type === 'danger'
                                    ? 'bg-red-50/50 border-red-100'
                                    : advisory.harvesting.status_type === 'warning'
                                        ? 'bg-amber-50/50 border-amber-100'
                                        : 'bg-green-50/50 border-green-100'
                                    }`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${advisory.harvesting.status_type === 'danger'
                                                ? 'bg-red-100'
                                                : advisory.harvesting.status_type === 'warning'
                                                    ? 'bg-amber-100'
                                                    : 'bg-green-100'
                                                }`}>
                                                <AlertCircle className={`w-5 h-5 ${advisory.harvesting.status_type === 'danger'
                                                    ? 'text-red-600'
                                                    : advisory.harvesting.status_type === 'warning'
                                                        ? 'text-amber-600'
                                                        : 'text-green-600'
                                                    }`} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{advisory.harvesting.title}</h3>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-xl text-sm font-semibold ${advisory.harvesting.status_type === 'danger'
                                            ? 'bg-red-100 text-red-700'
                                            : advisory.harvesting.status_type === 'warning'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {advisory.harvesting.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-lg mb-2">
                                        {advisory.harvesting.message}
                                    </p>
                                    {advisory.harvesting.points && (
                                        <ul className="list-disc list-inside text-gray-500 text-sm space-y-1">
                                            {advisory.harvesting.points.map((p, i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    )}
                                </div>

                                {/* Pesticide Spraying Card */}
                                <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border ${advisory.spraying.status_type === 'danger'
                                    ? 'bg-red-50/50 border-red-100'
                                    : advisory.spraying.status_type === 'warning'
                                        ? 'bg-amber-50/50 border-amber-100'
                                        : 'bg-green-50/50 border-green-100'
                                    }`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${advisory.spraying.status_type === 'danger'
                                                ? 'bg-red-100'
                                                : advisory.spraying.status_type === 'warning'
                                                    ? 'bg-amber-100'
                                                    : 'bg-green-100'
                                                }`}>
                                                <AlertTriangle className={`w-5 h-5 ${advisory.spraying.status_type === 'danger'
                                                    ? 'text-red-600'
                                                    : advisory.spraying.status_type === 'warning'
                                                        ? 'text-amber-600'
                                                        : 'text-green-600'
                                                    }`} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{advisory.spraying.title}</h3>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-xl text-sm font-semibold ${advisory.spraying.status_type === 'danger'
                                            ? 'bg-red-100 text-red-700'
                                            : advisory.spraying.status_type === 'warning'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {advisory.spraying.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-lg mb-2">
                                        {advisory.spraying.message}
                                    </p>
                                    {advisory.spraying.points && (
                                        <ul className="list-disc list-inside text-gray-500 text-sm space-y-1">
                                            {advisory.spraying.points.map((p, i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Weather Alerts */}
                            {advisory.alerts && advisory.alerts.length > 0 && (
                                <div className="bg-white border-l-4 border-orange-500 rounded-xl p-6 mb-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                                        <h3 className="text-xl font-bold text-orange-900">Weather Alerts</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {advisory.alerts.map((alert, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                                                <p className="text-gray-700 text-lg">{alert.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommended Activities */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Recommended Activities</h3>
                                </div>
                                <div className="space-y-4">
                                    {advisory.activities.map((activity, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-green-50">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <p className="text-gray-700 text-lg leading-relaxed">{activity}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
