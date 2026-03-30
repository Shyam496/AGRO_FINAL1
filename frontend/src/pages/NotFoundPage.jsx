import { Link } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <AlertTriangle className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="btn-primary inline-flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
