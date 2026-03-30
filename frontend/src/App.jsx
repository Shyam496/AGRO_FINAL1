import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import MockModeBanner from './components/common/MockModeBanner'


// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DiseasePage from './pages/DiseasePage'
import FertilizerPage from './pages/FertilizerPage'
import WeatherPage from './pages/WeatherPage'
import SchemesPage from './pages/SchemesPage'
import CalendarPage from './pages/CalendarPage'
import ChatPage from './pages/ChatPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen">
                    <MockModeBanner />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/disease" element={<DiseasePage />} />
                        <Route path="/fertilizer" element={<FertilizerPage />} />
                        <Route path="/weather" element={<WeatherPage />} />
                        <Route path="/schemes" element={<SchemesPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/404" element={<NotFoundPage />} />
                        <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                    <Toaster position="top-right" />
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App
