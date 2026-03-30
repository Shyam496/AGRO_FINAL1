import { Link } from 'react-router-dom'
import { Sprout, Leaf, Cloud, TrendingUp, MessageCircle, Calendar, Award, ArrowRight } from 'lucide-react'

export default function HomePage() {
    const features = [
        {
            icon: Leaf,
            title: 'Disease Detection',
            description: 'AI-powered crop disease identification with treatment recommendations'
        },
        {
            icon: TrendingUp,
            title: 'Fertilizer Optimization',
            description: 'Get personalized fertilizer recommendations based on soil analysis'
        },
        {
            icon: Cloud,
            title: 'Weather Analytics',
            description: '7-day weather forecast with farming advisories'
        },
        {
            icon: Award,
            title: 'Government Schemes',
            description: 'Discover and apply for agricultural subsidies and schemes'
        },
        {
            icon: MessageCircle,
            title: 'AI Assistant',
            description: '24/7 chat support for all your farming queries'
        },
        {
            icon: Calendar,
            title: 'Crop Calendar',
            description: 'Smart task scheduling and reminders for farming activities'
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <Sprout className="w-20 h-20" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Welcome to AgroMind
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-primary-100">
                            Your AI-Powered Agricultural Management Platform
                        </p>
                        <p className="text-lg mb-10 text-primary-50">
                            Empowering farmers with smart technology for disease prediction, fertilizer optimization, weather insights, and more.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/login" className="border-2 border-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-lg transition-colors duration-200">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need for Smart Farming
                    </h2>
                    <p className="text-xl text-gray-600">
                        Comprehensive tools to manage your farm efficiently
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="card hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-primary-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                <feature.icon className="w-7 h-7 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-50 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Ready to Transform Your Farming?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of farmers who are already using AgroMind to increase productivity and reduce costs.
                    </p>
                    <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg">
                        Start Your Free Trial
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center mb-4">
                        <Sprout className="w-10 h-10" />
                    </div>
                    <p className="text-gray-400 mb-4">
                        © 2026 AgroMind. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Empowering farmers with AI-powered agricultural solutions
                    </p>
                </div>
            </footer>
        </div>
    )
}
