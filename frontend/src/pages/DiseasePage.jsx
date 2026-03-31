import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/common/Sidebar'
import { Leaf, Upload, AlertCircle, Camera, Loader, CheckCircle, XCircle, Info } from 'lucide-react'
import { predictFromImage, predictFromSymptoms } from '../services/diseaseService'
import toast from 'react-hot-toast'

export default function DiseasePage() {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    // Image upload state
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [imageAnalyzing, setImageAnalyzing] = useState(false)
    const [imageResult, setImageResult] = useState(null)

    // Non-plant error state
    const [isNotPlant, setIsNotPlant] = useState(false)
    const [analysisSuggestions, setAnalysisSuggestions] = useState([])

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    if (authLoading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </div>
        )
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }

            setSelectedImage(file)
            setImagePreview(URL.createObjectURL(file))
            setImageResult(null)
        }
    }

    const handleImageAnalysis = async () => {
        if (!selectedImage) {
            toast.error('Please select an image first')
            return
        }

        setImageAnalyzing(true)
        setIsNotPlant(false)
        setAnalysisSuggestions([])
        
        try {
            const result = await predictFromImage(selectedImage)
            setImageResult(result.prediction)
            toast.success('Analysis completed!')
        } catch (error) {
            console.error('Frontend Catch:', error)
            const errorMessage = error.message.toLowerCase()
            
            if (error.isInvalidImage || 
                errorMessage.includes('not a plant') || 
                errorMessage.includes('does not appear to be')) {
                setIsNotPlant(true)
                setAnalysisSuggestions(error.suggestions || [])
                setImageResult(null)
            } else {
                toast.error(error.message || 'Analysis failed')
            }
        } finally {
            setImageAnalyzing(false)
        }
    }


    const resetImageAnalysis = () => {
        setSelectedImage(null)
        setImagePreview(null)
        setImageResult(null)
        setIsNotPlant(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            <Leaf className="inline w-8 h-8 mr-2 text-primary-500" />
                            Disease Detection
                        </h1>
                        <p className="text-gray-600">
                            Upload crop images to identify diseases and get expert treatment advice
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-start">
                        {/* Image Upload Section */}
                        <div className="card h-full">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                                <Camera className="w-6 h-6 text-primary-500" />
                                Step 1: Upload Image
                            </h2>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />

                            {!imagePreview ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer bg-gray-50 group"
                                >
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-primary-500" />
                                    </div>
                                    <p className="text-gray-800 font-medium mb-1">Click to upload crop photo</p>
                                    <p className="text-xs text-gray-500">Supports JPG, PNG (Max 5MB)</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-80 object-cover rounded-2xl shadow-sm"
                                        />
                                        <button
                                            onClick={resetImageAnalysis}
                                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white shadow-md transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {!imageResult && !isNotPlant && (
                                        <button
                                            onClick={handleImageAnalysis}
                                            disabled={imageAnalyzing}
                                            className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold shadow-lg shadow-primary-200 transition-all hover:scale-[1.02]"
                                        >
                                            {imageAnalyzing ? (
                                                <>
                                                    <Loader className="w-6 h-6 animate-spin" />
                                                    Analyzing Crop...
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="w-6 h-6" />
                                                    Start Analysis
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {(imageResult || isNotPlant) && (
                                        <button
                                            onClick={resetImageAnalysis}
                                            className="btn-secondary w-full py-3 rounded-xl flex items-center justify-center gap-2 border-dashed"
                                        >
                                            <Upload className="w-5 h-5" />
                                            Analyze New Image
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Results Column */}
                        <div className="space-y-6">
                            <div className="card h-full min-h-[400px] flex flex-col">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                                    <Leaf className="w-6 h-6 text-primary-500" />
                                    Step 2: Detection Result
                                </h2>

                                {!imageResult && !imageAnalyzing && !isNotPlant && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                            <Info className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-gray-800 font-bold text-lg mb-2">No Analysis Yet</h3>
                                        <p className="text-gray-500 max-w-xs">
                                            Results and treatment advice will appear here once you upload and analyze an image.
                                        </p>
                                    </div>
                                )}

                                {imageAnalyzing && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                        <div className="relative mb-6">
                                            <div className="w-24 h-24 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
                                            <Leaf className="w-10 h-10 text-primary-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <h3 className="text-gray-800 font-bold text-xl mb-2">AI is Analyzing...</h3>
                                        <p className="text-gray-500">Checking for patterns of disease and identifying crop health factors.</p>
                                    </div>
                                )}

                                {isNotPlant && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
                                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border-2 border-red-100">
                                            <XCircle className="w-12 h-12 text-red-500" />
                                        </div>
                                        <h3 className="text-red-600 font-black text-2xl mb-2">Image Not Recognized</h3>
                                        <p className="text-gray-600 max-w-sm mb-6">
                                            The model could not identify a plant or crop in this image.
                                        </p>
                                        
                                        {analysisSuggestions.length > 0 && (
                                            <div className="text-left bg-gray-50 p-4 rounded-xl border border-gray-200 w-full max-w-sm">
                                                <h4 className="text-xs uppercase text-gray-400 font-bold mb-3 flex items-center gap-2">
                                                    <Info className="w-4 h-4" /> Suggestions to fix:
                                                </h4>
                                                <ul className="space-y-2">
                                                    {analysisSuggestions.map((suggestion, i) => (
                                                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                                                            <span className="text-primary-500 font-bold">•</span>
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {imageResult && (
                                    <div className="animate-in slide-in-from-right duration-500">
                                        <DiseaseResult result={imageResult} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="card bg-blue-50 border-blue-200">
                        <div className="flex gap-4">
                            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-blue-900 mb-2">Tips for Best Results</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Take clear, well-lit photos of affected plant parts</li>
                                    <li>• Include close-ups of symptoms like spots, discoloration, or damage</li>
                                    <li>• Provide detailed symptom descriptions for accurate diagnosis</li>
                                    <li>• Multiple images from different angles improve accuracy</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DiseaseResult({ result }) {
    const isHealthy = result.severity === 'None'

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-2xl border-2 ${isHealthy ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                    {isHealthy ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                        <h3 className={`text-2xl font-black ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>{result.diseaseName}</h3>
                        <p className="text-sm font-medium text-gray-500">
                            AI Confidence Score: {(result.confidence * 100).toFixed(0)}%
                        </p>
                    </div>
                </div>

                {!isHealthy && (
                    <>
                        <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Severity:</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.severity === 'High' ? 'bg-red-100 text-red-800' :
                                result.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {result.severity}
                            </span>
                        </div>

                        <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Symptoms:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {result.symptoms.map((symptom, i) => (
                                    <li key={i}>• {symptom}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Treatment:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {result.treatment.map((step, i) => (
                                    <li key={i}>• {step}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Prevention:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {result.prevention.map((step, i) => (
                                    <li key={i}>• {step}</li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {isHealthy && (
                    <p className="text-sm text-green-700">
                        Your crop appears healthy! Continue with regular care and monitoring.
                    </p>
                )}
            </div>
        </div>
    )
}
