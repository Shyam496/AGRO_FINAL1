import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/common/Sidebar'
import { Droplet, Calculator, FileText, Loader, Clock, Sparkles, ShieldAlert, Upload, ClipboardCheck, ChevronDown, XCircle } from 'lucide-react'
import api from '../services/api'

const MOCK_MODE = false // Toggle for standalone demo

export default function FertilizerPage() {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState('manual') // 'manual' or 'report'
    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    // Form data
    const [formData, setFormData] = useState({
        soil_type: 'Loamy',
        crop_type: '',
        nitrogen: '',
        phosphorous: '',
        potassium: '',
        land_size: '1',
        land_unit: 'acre'
    })

    const [reportFile, setReportFile] = useState(null)

    // Metadata from API
    const [crops, setCrops] = useState([])
    const [soilTypes, setSoilTypes] = useState([])
    const [landUnits, setLandUnits] = useState(['acre', 'hectare']) // Initial defaults

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/login')
            } else {
                fetchMetadata()
            }
        }
    }, [isAuthenticated, authLoading, navigate])

    const fetchMetadata = async () => {
        if (MOCK_MODE) {
            setCrops(['Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate', 'Banana', 'Mango', 'Grapes', 'Watermelon', 'Muskmelon', 'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee'])
            setSoilTypes(['Loamy', 'Black', 'Red', 'Silty', 'Clayey'])
            setLandUnits(['acre', 'hectare', 'cent', 'ground'])
            return
        }
        try {
            const response = await api.get('/fertilizer/info')
            const data = response.data
            if (data.success) {
                setCrops(data.crops || [])
                setSoilTypes(data.soil_types || [])
                setLandUnits(data.land_units || ['acre', 'hectare', 'cent', 'ground'])
            }
        } catch (err) {
            console.error('Error fetching metadata:', err)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const newData = { ...prev, [name]: value }

            // Dynamic unit logic: "Smart Suggestion" based on land size
            if (name === 'land_size') {
                const size = parseFloat(value)
                if (size > 500 && prev.land_unit === 'acre') {
                    newData.land_unit = 'sq_m'
                } else if (size > 100 && prev.land_unit === 'acre') {
                    newData.land_unit = 'cent'
                } else if (size < 0.1 && prev.land_unit === 'sq_m') {
                    newData.land_unit = 'acre'
                }
            }

            return newData
        })
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setReportFile(file)
            handleScanReport(file)
        }
    }

    const handleScanReport = async (file) => {
        setScanning(true)
        setError(null)
        const formDataObj = new FormData()
        formDataObj.append('report', file)

        try {
            const response = await api.post('/fertilizer/scan-report', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const data = response.data
            if (data.success) {
                const extracted = data.data
                setFormData(prev => ({
                    ...prev,
                    nitrogen: extracted.nitrogen || prev.nitrogen,
                    phosphorous: extracted.phosphorous || prev.phosphorous,
                    potassium: extracted.potassium || prev.potassium,
                    soil_type: extracted.soil_type || prev.soil_type
                }))
            } else {
                setError(data.error || 'Failed to scan report')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'OCR service error. Please try again.')
        } finally {
            setScanning(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (activeTab === 'report' && !reportFile) {
            setError('Please upload a soil report file (PDF or Image) to proceed.')
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)

        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 1500))
            const mockResult = {
                display_name: 'Urea (46-0-0)',
                fertilizerName: 'Urea (46-0-0)',
                quantity: { total_kg: 150 },
                confidence: 0.92,
                composition: { N: 46, P: 0, K: 0 },
                application_timing: 'Morning or Evening',
                application_method: 'Broadcasting',
                precautions: ['Use gloves during application', 'Avoid applying in heavy wind', 'Keep away from water bodies'],
                expected_benefit: ['Increased leaf growth', 'Enhanced protein content'],
                cost: { total: 1200 }
            }
            setResult(mockResult)
            setLoading(false)
            return
        }

        try {
            const response = await api.post('/fertilizer/recommend', {
                ...formData,
                cropName: formData.crop_type, // Backend expects cropName
                farmArea: parseFloat(formData.land_size),
                phosphorus: formData.phosphorous, // Backend expects phosphorus typo fix
                pH: 6.5 // Default pH since it's not in the form but required by backend controller
            })
            const data = response.data
            if (data.recommendation) {
                // Handle both ML service response (nested in .data) and mock fallback
                const rec = data.recommendation
                const mlData = rec.data || rec // ML service wraps inside .data

                setResult({
                    display_name: mlData.display_name || mlData.fertilizerName || rec.fertilizerName || 'Recommended Fertilizer',
                    quantity: {
                        total_kg: mlData.quantity?.total_kg || mlData.quantity || rec.quantity || 0
                    },
                    confidence: mlData.confidence || rec.confidence || 0,
                    composition: mlData.composition || rec.composition || { N: 0, P: 0, K: 0 },
                    application_timing: mlData.application_timing || rec.timing || '',
                    application_method: mlData.application_method || rec.method || '',
                    secondary_nutrients: mlData.secondary_nutrients || rec.secondary_nutrients || '',
                    precautions: mlData.precautions || rec.precautions || [],
                    expected_benefit: mlData.expected_benefit || mlData.application_instructions || rec.expected_benefit || [],
                    cost: mlData.cost || rec.cost || null
                })
            } else {
                setError(data.error || 'Failed to get recommendation')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Service connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar activePage="fertilizer" />

            <div className="flex-1 overflow-auto bg-[#F9FAFB]">
                <div className="max-w-[1400px] mx-auto p-4 md:p-10">
                    {/* Header Region */}
                    <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
                        <div className="mt-1">
                            <Sparkles className="w-10 h-10 text-[#38761d]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#38761d] leading-tight tracking-tight">AgroMind – Fertilizer Recommendation</h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Navigation Tabs */}
                            <div className="flex border-b border-gray-200 mb-6 px-2">
                                <button
                                    onClick={() => setActiveTab('manual')}
                                    className={`flex items-center gap-2 py-3 px-1 text-sm font-bold transition-all border-b-2 mr-8 ${activeTab === 'manual' ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    <Calculator className="w-4 h-4" />
                                    Manual Calculator
                                </button>
                                <button
                                    onClick={() => setActiveTab('report')}
                                    className={`flex items-center gap-2 py-3 px-1 text-sm font-bold transition-all border-b-2 ${activeTab === 'report' ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Soil Report Scanner
                                </button>
                            </div>

                            <div className="card">
                                {activeTab === 'report' && (
                                    <div className="mb-10 animate-fade-in">
                                        <h3 className="text-lg font-bold text-gray-800 mb-6">Upload Soil Report</h3>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-600">Soil Report (PDF or Image) - Optional</label>
                                            <div className="flex items-center gap-3 w-full border border-gray-200 rounded-lg p-2.5 bg-white group hover:border-primary-300 transition-colors">
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    accept="image/*,.pdf"
                                                    className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer w-full"
                                                />
                                            </div>
                                            <p className="text-[11px] text-gray-500">
                                                {reportFile ? <span className="text-primary-600 font-bold">Selected: {reportFile.name}</span> : <span>Note: Full OCR support enabled. Fields will auto-fill after upload.</span>}
                                            </p>
                                            {scanning && (
                                                <div className="flex items-center gap-2 mt-2 text-primary-600 font-bold text-xs animate-pulse">
                                                    <Loader className="w-4 h-4 animate-spin" /> Analyzing Document...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-8">
                                    <h3 className="text-lg font-bold text-gray-800">Soil Parameters (Required)</h3>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* 3 Column Grid for NPK */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="label">Nitrogen (N) - kg/ha</label>
                                                <input type="number" name="nitrogen" placeholder="e.g., 150" className={`input-field ${activeTab === 'report' ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={formData.nitrogen} onChange={handleInputChange} required disabled={activeTab === 'report'} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="label">Phosphorous (P) - kg/ha</label>
                                                <input type="number" name="phosphorous" placeholder="e.g., 25" className={`input-field ${activeTab === 'report' ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={formData.phosphorous} onChange={handleInputChange} required disabled={activeTab === 'report'} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="label">Potassium (K) - kg/ha</label>
                                                <input type="number" name="potassium" placeholder="e.g., 80" className={`input-field ${activeTab === 'report' ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={formData.potassium} onChange={handleInputChange} required disabled={activeTab === 'report'} />
                                            </div>
                                        </div>

                                        {/* Soil & Crop Selectors */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="label">Soil Type</label>
                                                <div className="relative">
                                                    <select name="soil_type" className={`input-field appearance-none font-medium ${activeTab === 'report' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} value={formData.soil_type} onChange={handleInputChange} required disabled={activeTab === 'report'} >
                                                        {soilTypes.map(soil => <option key={soil} value={soil}>{soil}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="label">Crop Type</label>
                                                <div className="relative">
                                                    <select name="crop_type" className="input-field appearance-none bg-white font-medium" value={formData.crop_type} onChange={handleInputChange} required>
                                                        <option value="">Select Target Crop</option>
                                                        {crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Land Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                                            <div className="space-y-1">
                                                <label className="label">Enter Land Size</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="land_size"
                                                    placeholder="e.g., 1.5"
                                                    className="input-field"
                                                    value={formData.land_size}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="label">Select Land Unit</label>
                                                <div className="relative">
                                                    <select
                                                        name="land_unit"
                                                        className="input-field appearance-none bg-white capitalize font-medium"
                                                        value={formData.land_unit}
                                                        onChange={handleInputChange}
                                                    >
                                                        {landUnits.map(unit => (
                                                            <option key={unit} value={unit}>{unit.replace('_', ' ')}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || scanning}
                                            className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#10B981]/20 group"
                                        >
                                            {loading ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <ClipboardCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    Get Recommendation
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Results */}
                        <div className="lg:col-span-7 sticky top-8">
                            <div id="advisory-box" className="glass-card bg-white/50 backdrop-blur-xl border border-white/40 rounded-none p-10 min-h-[650px] animate-fade-in relative overflow-hidden group shadow-xl">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#38761d]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#38761d]/20 transition-colors duration-1000"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/10 rounded-full blur-3xl -ml-10 -mb-10 transition-colors duration-1000"></div>

                                {result ? (
                                    <div className="relative z-10 w-full text-left">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-14 h-14 bg-[#38761d] rounded-2xl shadow-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                                <Sparkles className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-[#38761d] tracking-tight">AI Analysis</h2>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">AgroMind Expert Recommendation</p>
                                            </div>
                                        </div>

                                        {/* Premium Metric Cards */}
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-white/90 backdrop-blur shadow-sm p-4 rounded-3xl border border-[#38761d]/10 px-5 transition-all hover:shadow-md hover:-translate-y-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 bg-[#38761d]/5 rounded-lg">
                                                        <Droplet className="w-4 h-4 text-[#38761d]" />
                                                    </div>
                                                    <p className="text-sm font-black text-black uppercase tracking-widest leading-none">Total Quantity</p>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 leading-none">{result.quantity.total_kg} <span className="text-xs font-bold text-gray-400">KG</span></p>
                                            </div>
                                            <div className="bg-white/90 backdrop-blur shadow-sm p-4 rounded-3xl border border-green-50 px-5 transition-all hover:shadow-md hover:-translate-y-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 bg-green-50 rounded-lg">
                                                        <ShieldAlert className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <p className="text-sm font-black text-black uppercase tracking-widest leading-none">Confidence</p>
                                                </div>
                                                <p className="text-2xl font-black text-green-600 leading-none">{(result.confidence * 100).toFixed(0)}<span className="text-xs font-bold">%</span></p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-[#38761d]/5 p-5 rounded-2xl border border-[#38761d]/10">
                                                <p className="text-sm font-bold text-[#38761d] mb-1 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> Recommended Fertilizer:
                                                </p>
                                                <h3 className="text-xl font-black text-[#1d3d0f]">{result.display_name}</h3>
                                            </div>

                                            <ul className="space-y-4 text-gray-700">

                                                <li className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/60 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-1">
                                                        <Clock className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-black uppercase tracking-widest mb-1">Timing & Method</p>
                                                        <p className="text-sm font-bold leading-relaxed">{result.application_timing} via {result.application_method}</p>
                                                    </div>
                                                </li>

                                                <li className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/60 transition-colors">
                                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-1">
                                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-black uppercase tracking-widest mb-1">Nutrient Breakdown</p>
                                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                                <div className="text-center bg-white/70 p-2 rounded-xl border border-amber-50">
                                                                    <p className="text-[10px] text-black font-bold mb-1">N</p>
                                                                    <p className="font-black text-[#38761d]">{result.composition.N}%</p>
                                                                </div>
                                                                <div className="text-center bg-white/70 p-2 rounded-xl border border-amber-50">
                                                                    <p className="text-[10px] text-black font-bold mb-1">P</p>
                                                                    <p className="font-black text-[#38761d]">{result.composition.P}%</p>
                                                                </div>
                                                                <div className="text-center bg-white/70 p-2 rounded-xl border border-amber-50">
                                                                    <p className="text-[10px] text-black font-bold mb-1">K</p>
                                                                    <p className="font-black text-[#38761d]">{result.composition.K}%</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/60 transition-colors">
                                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 mt-1">
                                                            <Droplet className="w-4 h-4 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-black uppercase tracking-widest mb-1">Secondary Nutrients</p>
                                                            <p className="text-base font-bold leading-relaxed">{result.secondary_nutrients || "No specific secondary nutrients required."}</p>
                                                        </div>
                                                    </div>
                                                </li>

                                                <li className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/60 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-1">
                                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-black uppercase tracking-widest mb-1">Expected Benefit</p>
                                                        <ul className="space-y-1 mt-1">
                                                            {Array.isArray(result.expected_benefit) ? (
                                                                result.expected_benefit.map((benefit, idx) => (
                                                                    <li key={idx} className="text-sm font-medium leading-relaxed flex items-start gap-2 text-gray-700">
                                                                        <span className="text-[#38761d] font-black text-xs mt-1">•</span> {benefit}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="text-sm font-medium leading-relaxed flex items-start gap-2 text-gray-700">
                                                                    <span className="text-[#38761d] font-black text-xs mt-1">•</span> {result.expected_benefit}
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </li>

                                                <li className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/60 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-1">
                                                        <ShieldAlert className="w-4 h-4 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-black uppercase tracking-widest mb-1">Precautions</p>
                                                        <ul className="space-y-1 mt-1">
                                                            {result.precautions.map((point, idx) => (
                                                                <li key={idx} className="text-sm font-medium leading-relaxed flex items-start gap-2 text-gray-700">
                                                                    <span className="text-red-600 font-black text-xs mt-1">•</span> {point}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </li>
                                            </ul>

                                            {result.cost && (
                                                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-black text-black uppercase tracking-widest">Estimated Cost</p>
                                                        <p className="text-2xl font-black text-[#38761d]">₹{result.cost.total}</p>
                                                    </div>
                                                    <div
                                                        onClick={() => window.open(`https://www.google.com/search?q=buy ${result.display_name} fertilizer online`, '_blank')}
                                                        className="bg-[#38761d] text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-[#38761d]/20 tracking-tighter cursor-pointer hover:scale-105 transition-transform active:scale-95"
                                                    >
                                                        BUY NOW
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center animate-pulse">
                                        <div className="w-24 h-24 bg-white/80 rounded-none shadow-sm flex items-center justify-center mb-8 border border-primary-50">
                                            <Droplet className="w-10 h-10 text-primary-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">Expert Analysis Ready</h3>
                                        <p className="text-gray-400 font-medium leading-relaxed text-sm max-w-[240px]">
                                            Analysis will begin as soon as you provide soil data.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="fixed bottom-10 right-10 bg-red-50 border border-red-100 p-5 rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-300 max-w-sm flex gap-4 items-center z-50">
                    <ShieldAlert className="text-red-500 w-8 h-8 shrink-0" />
                    <p className="text-red-700 text-sm font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
