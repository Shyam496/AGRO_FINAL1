import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/common/Sidebar'
import { Droplet, Calculator, FileText, Loader, Clock, Sparkles, ShieldAlert, Upload, Pencil, History, ChevronDown } from 'lucide-react'

const ML_SERVICE_URL = 'http://localhost:5001'

export default function FertilizerPage() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [mainTab, setMainTab] = useState('new') // 'new' or 'history'
    const [inputMethod, setInputMethod] = useState('manual') // 'manual' or 'report'

    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    // Form data
    const [formData, setFormData] = useState({
        soil_type: 'Loamy', // Default
        crop_type: '',
        nitrogen: '',
        phosphorous: '',
        potassium: '',
        ph: '',
        land_size: '1',
        land_unit: 'acre'
    })

    // Report upload file
    const [reportFile, setReportFile] = useState(null)

    // Metadata from API
    const [crops, setCrops] = useState([])
    const [soilTypes, setSoilTypes] = useState([])

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
        }
        fetchMetadata()
    }, [isAuthenticated, navigate])

    const fetchMetadata = async () => {
        try {
            const response = await fetch(`${ML_SERVICE_URL}/fertilizer/info`)
            const data = await response.json()
            if (data.success) {
                setCrops(data.crops || [])
                setSoilTypes(data.soil_types || [])
            }
        } catch (err) {
            console.error('Error fetching metadata:', err)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setReportFile(file)
            setScanning(true)
            handleScanReport(file)
        }
    }

    const handleScanReport = async (file) => {
        const formDataObj = new FormData()
        formDataObj.append('report', file)

        try {
            const response = await fetch(`${ML_SERVICE_URL}/fertilizer/scan-report`, {
                method: 'POST',
                body: formDataObj,
            })
            const data = await response.json()
            if (data.success) {
                const extracted = data.data
                setFormData(prev => ({
                    ...prev,
                    nitrogen: extracted.nitrogen || prev.nitrogen,
                    phosphorous: extracted.phosphorous || prev.phosphorous,
                    potassium: extracted.potassium || prev.potassium,
                    ph: extracted.ph || prev.ph,
                    soil_type: extracted.soil_type || prev.soil_type
                }))
            } else {
                setError(data.error || 'Failed to scan report')
            }
        } catch (err) {
            setError('OCR service error. Please try again.')
        } finally {
            setScanning(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const endpoint = inputMethod === 'manual' ? 'predict-manual' : 'predict-report'
            let response;

            if (inputMethod === 'manual') {
                response = await fetch(`${ML_SERVICE_URL}/fertilizer/predict-manual`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                })
            } else {
                const formDataObj = new FormData()
                formDataObj.append('report', reportFile)
                formDataObj.append('crop_type', formData.crop_type)
                formDataObj.append('land_size', formData.land_size)
                formDataObj.append('land_unit', formData.land_unit)
                response = await fetch(`${ML_SERVICE_URL}/fertilizer/predict-report`, {
                    method: 'POST',
                    body: formDataObj,
                })
            }

            const data = await response.json()
            if (data.success) {
                setResult(data.data)
                // Scroll to result
                setTimeout(() => {
                    document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            } else {
                setError(data.error || 'Failed to get recommendation')
            }
        } catch (err) {
            setError('Service connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#FBFBFB]">
            <Sidebar activePage="fertilizer" />

            <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-auto">
                <div className="max-w-2xl mx-auto">
                    {/* Top Description */}
                    <p className="text-gray-500 text-sm mb-8 font-medium">
                        Get AI-powered fertilizer suggestions based on soil analysis
                    </p>

                    {/* Main Tabs */}
                    <div className="flex gap-2 mb-8 bg-gray-100/50 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setMainTab('new')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mainTab === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            New Recommendation
                        </button>
                        <button
                            onClick={() => setMainTab('history')}
                            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mainTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            History
                        </button>
                    </div>

                    {/* Input Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-12">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Soil Analysis Input</h2>
                        <p className="text-gray-400 text-xs mb-8">Choose your preferred method to provide soil data</p>

                        {/* Input Method Toggles */}
                        <div className="flex gap-4 mb-10">
                            <button
                                onClick={() => setInputMethod('manual')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${inputMethod === 'manual' ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            >
                                <Pencil className="w-4 h-4" />
                                Manual Entry
                            </button>
                            <button
                                onClick={() => setInputMethod('report')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${inputMethod === 'report' ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            >
                                <Upload className="w-4 h-4" />
                                Upload Report
                            </button>
                        </div>

                        {/* Analysis Form */}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {inputMethod === 'report' && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Upload Lab Report *</label>
                                    <div className="relative border-2 border-dashed border-gray-100 rounded-xl p-6 text-center hover:bg-gray-50/50 transition-all group min-h-[120px] flex flex-col items-center justify-center">
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept="image/*,.pdf" />
                                        {scanning ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader className="w-6 h-6 text-primary-500 animate-spin" />
                                                <span className="text-xs font-bold text-primary-600">Scanning Report...</span>
                                            </div>
                                        ) : reportFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-green-600" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{reportFile.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-gray-200 mb-2 group-hover:text-primary-300 transition-colors" />
                                                <span className="text-xs font-bold text-gray-400">PDF, JPG or PNG (Max 5MB)</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Select Crop Type *</label>
                                <div className="relative">
                                    <select
                                        name="crop_type"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm appearance-none outline-none focus:border-primary-400 transition-all font-medium text-gray-700"
                                        value={formData.crop_type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Choose your crop</option>
                                        {crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider text-primary-800">Nitrogen (N) kg/ha</label>
                                    <input
                                        type="number"
                                        name="nitrogen"
                                        placeholder="e.g., 180"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-primary-400 transition-all text-gray-700 font-medium"
                                        value={formData.nitrogen}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Phosphorus (P) kg/ha</label>
                                    <input
                                        type="number"
                                        name="phosphorous"
                                        placeholder="e.g., 25"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-primary-400 transition-all text-gray-700 font-medium"
                                        value={formData.phosphorous}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Potassium (K) kg/ha</label>
                                    <input
                                        type="number"
                                        name="potassium"
                                        placeholder="e.g., 150"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-primary-400 transition-all text-gray-700 font-medium"
                                        value={formData.potassium}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">pH Level (optional)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="ph"
                                        placeholder="e.g., 6.5"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-primary-400 transition-all text-gray-700 font-medium"
                                        value={formData.ph}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || scanning}
                                className="w-full bg-[#10B981]/60 hover:bg-[#10B981]/80 text-[#064e3b] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader className="animate-spin w-5 h-5" /> : <Droplet className="w-5 h-5" />}
                                Get Recommendation
                            </button>
                        </form>
                    </div>

                    {/* Footer/Result Advisory Area */}
                    <div id="result-section" className="bg-blue-50/30 rounded-3xl p-12 text-center border border-blue-50/50 min-h-[300px] flex flex-col items-center justify-center">
                        {result ? (
                            <div className="animate-fade-in w-full max-w-xl">
                                <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-8 inline-block">
                                    <Droplet className="w-10 h-10 text-primary-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{result.display_name}</h2>
                                <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                                    Based on your soil analysis, we recommend <span className="text-primary-600 font-bold">{result.quantity.total_kg} kg</span> of {result.fertilizer_name}.
                                    {result.application_timing} via {result.application_method}.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Cost</p>
                                        <p className="text-xl font-black text-gray-900">₹{result.cost.total}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Confidence</p>
                                        <p className="text-xl font-black text-green-600">{(result.confidence * 100).toFixed(0)}%</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-8 inline-block">
                                    <Droplet className="w-10 h-10 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Fertilizer Advisory</h3>
                                <p className="text-gray-400 font-medium max-w-sm leading-relaxed">
                                    Provide your soil nutrient data or upload a soil report, and our AI will recommend the optimal fertilizer for your crop with detailed application instructions.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
