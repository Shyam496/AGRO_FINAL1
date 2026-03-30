import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard,
    Leaf,
    Droplet,
    Cloud,
    Award,
    MessageCircle,
    Calendar,
    LogOut,
    User,
    Menu,
    X,
    ChevronRight
} from 'lucide-react'
import { useState } from 'react'

export default function Sidebar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/disease', icon: Leaf, label: 'Disease Detection' },
        { path: '/fertilizer', icon: Droplet, label: 'Fertilizer Advisory' },
        { path: '/weather', icon: Cloud, label: 'Weather Insights' },
        { path: '/schemes', icon: Award, label: 'Govt. Schemes' },
        { path: '/chat', icon: MessageCircle, label: 'AI Assistant' },
        { path: '/calendar', icon: Calendar, label: 'Crop Calendar' },
        { path: '/profile', icon: User, label: 'Profile' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-emerald-600 text-white p-2 rounded-lg shadow-lg"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <div
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-8">
                        <Link to="/dashboard" className="flex items-center gap-3">
                            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-100 rotate-3">
                                <Leaf className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-extrabold text-gray-900 tracking-tight">AgroMind</span>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-1">
                            {menuItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200 ${active
                                                ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                <span className="font-semibold text-sm">{item.label}</span>
                                            </div>
                                            {active && <ChevronRight className="w-4 h-4 text-emerald-500 animate-in slide-in-from-left-2" />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Need Help Card & Logout */}
                    <div className="p-6 space-y-4">
                        {/* Need Help? Card from Reference */}
                        <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/30 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-600/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <h4 className="text-[12px] font-bold text-gray-900 mb-1">Need Help?</h4>
                            <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">Chat with our AI assistant for instant farming support.</p>
                            <Link
                                to="/chat"
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-sm shadow-emerald-100 transition-all active:scale-95"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Start Chat
                            </Link>
                        </div>

                        {/* Logout Link */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
