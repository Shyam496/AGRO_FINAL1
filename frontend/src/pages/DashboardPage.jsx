import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/common/Sidebar'
import { TrendingUp, Leaf, CheckCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react'
import { getDashboardOverview } from '../services/dashboardService'


export default function DashboardPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [overview, setOverview] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/login')
                return
            }
            fetchDashboard()
        }
    }, [isAuthenticated, authLoading, navigate])

    const fetchDashboard = async () => {
        try {
            const data = await getDashboardOverview()
            setOverview(data.overview)
        } catch (error) {
            console.error('Error fetching dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || (loading && !overview)) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    const stats = [
        {
            icon: Leaf,
            label: 'Total Crops',
            value: overview?.totalCrops || 0,
            color: 'bg-green-100 text-green-600'
        },
        {
            icon: CheckCircle,
            label: 'Healthy Crops',
            value: overview?.cropHealth?.healthy || 0,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: AlertTriangle,
            label: 'Pending Tasks',
            value: overview?.pendingTasks || 0,
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            icon: DollarSign,
            label: 'Total Expenses',
            value: `₹${overview?.totalExpenses || 0}`,
            color: 'bg-purple-100 text-purple-600'
        }
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {user?.firstName}! 👋
                        </h1>
                        <p className="text-gray-600">
                            Here's what's happening with your farm today
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <QuickActionCard
                            icon={Leaf}
                            title="Disease Detection"
                            description="Scan your crops for diseases"
                            link="/disease"
                            color="bg-green-500"
                        />
                        <QuickActionCard
                            icon={TrendingUp}
                            title="Fertilizer Recommendation"
                            description="Get soil-based fertilizer advice"
                            link="/fertilizer"
                            color="bg-blue-500"
                        />
                        <QuickActionCard
                            icon={Calendar}
                            title="Crop Calendar"
                            description="Manage your farming tasks"
                            link="/calendar"
                            color="bg-purple-500"
                        />
                    </div>

                    {/* Crop Health Overview */}
                    {overview?.cropHealth && (
                        <div className="card mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Crop Health Overview</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-600">Healthy</span>
                                        <span className="text-sm font-medium text-green-600">
                                            {overview.cropHealth.healthy} crops
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                                width: `${(overview.cropHealth.healthy / overview.cropHealth.total) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                {overview.cropHealth.diseased > 0 && (
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Diseased</span>
                                            <span className="text-sm font-medium text-red-600">
                                                {overview.cropHealth.diseased} crops
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{
                                                    width: `${(overview.cropHealth.diseased / overview.cropHealth.total) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Getting Started */}
                    {overview?.totalCrops === 0 && (
                        <div className="card bg-primary-50 border-primary-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">🌱 Getting Started</h2>
                            <p className="text-gray-700 mb-4">
                                Welcome to AgroMind! Start by exploring our features:
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Upload crop images for disease detection</li>
                                <li>• Get fertilizer recommendations based on soil tests</li>
                                <li>• Check weather forecasts and farming advisories</li>
                                <li>• Discover government schemes you're eligible for</li>
                                <li>• Chat with our AI assistant for farming advice</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function QuickActionCard({ icon: Icon, title, description, link, color }) {
    const navigate = useNavigate()

    return (
        <div
            onClick={() => navigate(link)}
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
        >
            <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    )
}
