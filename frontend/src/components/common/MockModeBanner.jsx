import { Info, X } from 'lucide-react'
import { useState } from 'react'

export default function MockModeBanner() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="bg-blue-500 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Info className="w-5 h-5" />
                <p className="text-sm font-medium">
                    🎯 <strong>DEMO MODE:</strong> You're using mock data. Backend not required!
                    <span className="ml-2 opacity-90">Login: farmer@agromind.com / password123</span>
                </p>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="hover:bg-blue-600 p-1 rounded"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
