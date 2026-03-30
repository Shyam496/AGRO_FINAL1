import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/common/Sidebar'
import schemeService from '../services/schemeService'
import taskService from '../services/taskService'
import {
    Award,
    Search,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    Info,
    ArrowRight,
    Filter,
    HelpCircle,
    Calendar,
    Shield,
    BookOpen,
    Settings,
    ShoppingBag
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SchemesPage() {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [schemes, setSchemes] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [selectedScheme, setSelectedScheme] = useState(null)
    const [showDetails, setShowDetails] = useState(false)
    const [viewType, setViewType] = useState('sampler') // 'sampler', 'category', 'search'
    const [unlockedSchemeIds, setUnlockedSchemeIds] = useState(new Set())
    const [activeCategory, setActiveCategory] = useState('') // '' for all, or 'Subsidy', 'Loan' etc.

    // Eligibility Wizard State
    const [showWizard, setShowWizard] = useState(false)
    const [profile, setProfile] = useState({
        category: 'All types'
    })
    const [isChecking, setIsChecking] = useState(false)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    const getRandomItemsByCategory = (schemes, countPerCategory = 2, preferredIds = new Set()) => {
        const categories = [...new Set(schemes.map(s => s.category))]
        let selected = []

        categories.forEach(cat => {
            const catSchemes = schemes.filter(s => s.category === cat)

            // Prioritize already unlocked items in this category
            const preferred = catSchemes.filter(s => preferredIds.has(s.id))
            const others = catSchemes.filter(s => !preferredIds.has(s.id))

            let catSelected = [...preferred]
            if (catSelected.length > countPerCategory) {
                // If more preferred than needed, shuffle and slice
                catSelected = catSelected.sort(() => 0.5 - Math.random()).slice(0, countPerCategory)
            } else if (catSelected.length < countPerCategory) {
                // If less, fill with random others
                const needed = countPerCategory - catSelected.length
                const extra = others.sort(() => 0.5 - Math.random()).slice(0, needed)
                catSelected = [...catSelected, ...extra]
            }

            selected = [...selected, ...catSelected]
        })

        // Final shuffle of the combined results
        return selected.sort(() => 0.5 - Math.random())
    }

    const fetchSchemes = async (query = '', category = '') => {
        setLoading(true)
        setHasSearched(true)
        try {
            const data = await schemeService.listSchemes({ search: query, category })
            // Always show full results for specific category searches or general searches
            setSchemes(data.schemes)
            setViewType(category ? 'category' : 'search')
        } catch (error) {
            toast.error('Failed to load schemes')
        } finally {
            setLoading(false)
            setIsSearching(false)
        }
    }

    const fetchRandomSchemes = async () => {
        setLoading(true)
        setHasSearched(true)
        setActiveCategory('')
        try {
            const data = await schemeService.listSchemes()
            // Pick 2 random schemes from each module, prioritizing already unlocked ones
            const randomized = getRandomItemsByCategory(data.schemes, 2, unlockedSchemeIds)
            setSchemes(randomized)
            setViewType('sampler')
        } catch (error) {
            toast.error('Failed to load schemes')
        } finally {
            setLoading(false)
            setIsSearching(false)
        }
    }

    const fetchByCategory = (category) => {
        setIsSearching(false)
        setSearchQuery('')
        setActiveCategory(category)
        fetchSchemes('', category)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) {
            toast.error('Please enter a search term')
            return
        }
        setIsSearching(true)
        fetchSchemes(searchQuery, activeCategory)
    }

    const handleCheckEligibility = async () => {
        setIsChecking(true)
        setHasSearched(true)
        try {
            if (profile.category === 'None') {
                setUnlockedSchemeIds(new Set())
                setSchemes(prev => prev.map(s => ({ ...s, is_eligible: false })))
                toast.success('All schemes have been locked.')
                setShowWizard(false)
                return
            }

            const data = await schemeService.checkEligibility(profile)

            // Store ALL eligible IDs to unlock them globally
            const eligibleIds = new Set(data.eligibleSchemes.map(s => s.id))
            setUnlockedSchemeIds(eligibleIds)

            // Directly show the eligible schemes
            setSchemes(data.eligibleSchemes)
            setViewType('category')
            toast.success(`Wizard complete! Found ${data.count || data.eligibleSchemes.length} matching ${profile.category === 'All types' ? 'schemes' : profile.category + 's'}.`)
            
            setTimeout(() => {
                setShowWizard(false)
            }, 500)
        } catch (error) {
            toast.error('Eligibility check failed')
        } finally {
            setIsChecking(false)
        }
    }

    const checkSingleSchemeEligibility = async (scheme) => {
        const toastId = toast.loading(`Verifying AI Eligibility for ${scheme.name}...`)
        try {
            const data = await schemeService.checkEligibility({
                ...profile,
                category: scheme.category || 'All types'
            })
            
            const isEligible = data.eligibleSchemes.some(s => s.id === scheme.id)
            
            if (isEligible) {
                const newUnlocked = new Set(unlockedSchemeIds)
                data.eligibleSchemes.forEach(s => newUnlocked.add(s.id))
                setUnlockedSchemeIds(newUnlocked)
                toast.success('Eligibility Verified! You can now apply.', { id: toastId })
            } else {
                toast.error('Profile does not meet criteria for this scheme.', { id: toastId })
            }
        } catch (error) {
            toast.error('Failed to verify eligibility', { id: toastId })
        }
    }

    const handleAddReminder = async (scheme) => {
        try {
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 14)

            await taskService.createTask({
                title: `Apply for ${scheme.name}`,
                description: `Reminder to apply for ${scheme.name} subsidy via ${scheme.link}`,
                taskType: 'scheme_application',
                dueDate: dueDate.toISOString(),
                priority: 'high'
            })
            toast.success('Added to your calendar!')
        } catch (error) {
            toast.error('Failed to add reminder to calendar')
        }
    }

    const handleOpenDetails = (scheme) => {
        setSelectedScheme(scheme)
        setShowDetails(true)
    }

    const getScoreColor = (score) => {
        if (score >= 90) return 'bg-green-500'
        if (score >= 75) return 'bg-blue-500'
        if (score >= 60) return 'bg-yellow-500'
        return 'bg-gray-400'
    }

    const getCategoryStyles = (category) => {
        const cat = category?.toLowerCase() || ''
        if (cat.includes('subsidy')) return 'bg-green-100 text-green-700 border-green-200'
        if (cat.includes('loan')) return 'bg-blue-100 text-blue-700 border-blue-200'
        if (cat.includes('insurance')) return 'bg-purple-100 text-purple-700 border-purple-200'
        if (cat.includes('training')) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        if (cat.includes('equipment')) return 'bg-orange-100 text-orange-700 border-orange-200'
        if (cat.includes('marketing')) return 'bg-indigo-100 text-indigo-700 border-indigo-200'
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Award className="w-10 h-10 text-primary-600" />
                                Schemes & Subsidies
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Discover and apply for central and state government agricultural benefits
                            </p>
                        </div>
                        <button
                            onClick={() => setShowWizard(true)}
                            className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg transition-all"
                        >
                            <Filter className="w-4 h-4" />
                            AI Scheme Matcher
                        </button>
                    </div>

                    {/* Search & AI Bar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSearch} className="relative group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    className="input-field pl-12 h-14 text-lg shadow-sm border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                                    placeholder={activeCategory ? `Search in ${activeCategory}s...` : "Search e.g., 'subsidy for solar pumps' or 'crop insurance'"}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                                >
                                    {isSearching ? 'Searching...' : 'AI Search'}
                                </button>
                            </form>
                        </div>
                        <div className="hidden lg:flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm leading-tight text-sm text-gray-600">
                            <HelpCircle className="w-8 h-8 text-primary-400 flex-shrink-0" />
                            <p>Try searching using natural language. Our AI will find the best matches for you!</p>
                        </div>
                    </div>

                    {/* Category Quick Filters */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <button
                            onClick={() => fetchRandomSchemes()}
                            className={`px-4 py-2.5 rounded-xl border font-bold transition-all shadow-sm ${activeCategory === '' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-primary-200'}`}
                        >
                            All Schemes
                        </button>
                        <button
                            onClick={() => fetchByCategory('Subsidy')}
                            className={`px-4 py-2.5 rounded-xl border font-bold transition-all shadow-sm flex items-center gap-2 ${activeCategory === 'Subsidy' ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100'}`}
                        >
                            <Award className="w-4 h-4" /> Subsidies
                        </button>
                        <button
                            onClick={() => fetchByCategory('Loan')}
                            className={`px-4 py-2.5 rounded-xl border font-bold transition-all shadow-sm flex items-center gap-2 ${activeCategory === 'Loan' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100'}`}
                        >
                            <Info className="w-4 h-4 rotate-180" /> Loans
                        </button>
                        <button
                            onClick={() => fetchByCategory('Insurance')}
                            className={`px-4 py-2.5 rounded-xl border font-bold transition-all shadow-sm flex items-center gap-2 ${activeCategory === 'Insurance' ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100'}`}
                        >
                            <Shield className="w-4 h-4" /> Insurance
                        </button>
                        <button
                            onClick={() => fetchByCategory('Training')}
                            className={`px-4 py-2.5 rounded-xl border font-bold transition-all shadow-sm flex items-center gap-2 ${activeCategory === 'Training' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-yellow-50 border-yellow-100 text-yellow-700 hover:bg-yellow-100'}`}
                        >
                            <BookOpen className="w-4 h-4" /> Training
                        </button>
                        <button
                            onClick={() => fetchByCategory('Equipment')}
                            className={`px-4 py-2.5 rounded-xl border font-bold transition-all shadow-sm flex items-center gap-2 ${activeCategory === 'Equipment' ? 'bg-orange-600 text-white border-orange-600' : 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100'}`}
                        >
                            <Settings className="w-4 h-4" /> Equipment
                        </button>
                        <button
                            onClick={() => fetchByCategory('Marketing')}
                            className={`px-4 py-2.5 rounded-xl border font-bold transition-all shadow-sm flex items-center gap-2 ${activeCategory === 'Marketing' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'}`}
                        >
                            <ShoppingBag className="w-4 h-4" /> Marketing
                        </button>
                    </div>

                    {/* Schemes Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Analyzing schemes for you...</p>
                        </div>
                    ) : (
                        // Quick Guide or Schemes List
                        !hasSearched ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-sky-600 p-8 rounded-3xl shadow-lg shadow-sky-100 text-center text-white relative overflow-hidden group">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Manual Search</h3>
                                    <p className="text-sky-50 text-sm leading-relaxed">
                                        Use the search bar above to find specific schemes by name or keyword like "tractor" or "irrigation".
                                    </p>
                                </div>

                                <div className="bg-primary-600 p-8 rounded-3xl shadow-lg shadow-primary-200 text-center text-white relative overflow-hidden group">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Filter className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-white">AI Scheme Matcher</h3>
                                    <p className="text-primary-50 text-sm leading-relaxed mb-6">
                                        The fastest way! Enter your profile details once and we'll unlock all eligible matches for you.
                                    </p>
                                    <button
                                        onClick={() => setShowWizard(true)}
                                        className="px-6 py-2.5 bg-white text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-50 transition-all shadow-sm flex items-center gap-2 mx-auto"
                                    >
                                        Start Matching
                                    </button>
                                </div>

                                <div className="bg-indigo-600 p-8 rounded-3xl shadow-lg shadow-indigo-100 text-center text-white relative overflow-hidden group">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Award className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-white">Explore Categories</h3>
                                    <p className="text-indigo-50 text-sm leading-relaxed">
                                        Browse through dedicated sections for Subsidies, Loans, Training, and more to find specific benefits.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {schemes.length > 0 ? (
                                    schemes.map((scheme) => (
                                        <div key={scheme.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden relative">
                                            {viewType === 'sampler' && (
                                                <div className="absolute top-0 right-0">
                                                    <div className={`px-4 py-1.5 rounded-bl-2xl border-l border-b text-[10px] font-bold uppercase tracking-widest ${getCategoryStyles(scheme.category)} shadow-sm`}>
                                                        {scheme.category}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                                                <Award className="w-6 h-6 text-primary-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight">
                                                                    {scheme.name}
                                                                </h3>
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 block">
                                                                    {scheme.authority} • {scheme.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                                                        {scheme.description}
                                                    </p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                            <p className="text-[10px] uppercase text-gray-700 font-bold mb-1 tracking-wider">Key Benefit</p>
                                                            <p className="text-gray-800 text-sm font-bold flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                                <span className="truncate">{scheme.benefits?.amount || scheme.benefits?.details || "Financial Assistance"}</span>
                                                            </p>
                                                        </div>
                                                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                            <p className="text-[10px] uppercase text-gray-700 font-bold mb-1 tracking-wider">Requirements</p>
                                                            <p className="text-gray-800 text-sm font-bold truncate">
                                                                {scheme.requirements?.join(', ') || "Land Records, Aadhaar"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:w-64 border-l md:pl-6 flex flex-col justify-between">
                                                    <div className="flex flex-col gap-2 mb-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(scheme.link, '_blank');
                                                            }}
                                                            className="w-full py-2.5 flex items-center justify-center gap-2 btn-primary rounded-xl text-xs font-bold transition-all"
                                                        >
                                                            <ExternalLink className="w-4 h-4" /> Official Website
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenDetails(scheme);
                                                            }}
                                                            className="w-full py-2.5 flex items-center justify-center gap-2 btn-primary rounded-xl text-xs font-bold transition-all"
                                                        >
                                                            <Info className="w-4 h-4" /> Full Details
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2 mt-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const isUnlocked = unlockedSchemeIds.has(scheme.id);
                                                                if (!isUnlocked) {
                                                                    checkSingleSchemeEligibility(scheme);
                                                                    return;
                                                                }
                                                                if (scheme.link) {
                                                                    window.open(scheme.link, '_blank');
                                                                    toast.success('Redirecting to official website...');
                                                                } else {
                                                                    toast.error('Application link not available for this scheme.');
                                                                }
                                                            }}
                                                            className={`w-full py-3 flex items-center justify-center gap-2 group/btn rounded-xl font-bold transition-all ${(unlockedSchemeIds.has(scheme.id))
                                                                ? 'btn-primary'
                                                                : 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none'
                                                                }`}
                                                        >
                                                            {(unlockedSchemeIds.has(scheme.id)) ? 'Apply Now' : 'Check Eligibility & Apply'}
                                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAddReminder(scheme)}
                                                            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 py-2 transition-colors"
                                                        >
                                                            <Calendar className="w-4 h-4" /> Remind Me
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">No schemes found</h3>
                                        <p className="text-gray-500 mt-2">Try adjusting your search terms or filters.</p>
                                        <button
                                            onClick={() => fetchSchemes()}
                                            className="mt-6 text-primary-600 font-bold hover:underline"
                                        >
                                            Clear all search results
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Eligibility Wizard Modal */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary-600 p-6 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-xl font-bold">AI Scheme Matcher</h2>
                                <p className="text-primary-100 text-sm">Help us find the best schemes for you</p>
                            </div>
                            <button
                                onClick={() => setShowWizard(false)}
                                className="w-8 h-8 rounded-full border border-primary-400 flex items-center justify-center hover:bg-primary-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider text-center">What type of scheme are you looking for?</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        'All types', 'Subsidy', 'Loan',
                                        'Insurance', 'Training', 'Equipment',
                                        'Marketing', 'None'
                                    ].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setProfile({ ...profile, category: cat })}
                                            className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all duration-200 flex items-center justify-center text-center leading-tight ${profile.category === cat
                                                ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-md transform scale-[1.02]'
                                                : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCheckEligibility}
                                disabled={isChecking}
                                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary-200 hover:shadow-primary-300 active:scale-95 transition-all"
                            >
                                {isChecking ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Analyzing Profiles...
                                    </>
                                ) : (
                                    <>
                                        Find Matching Schemes
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetails && selectedScheme && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary-600 p-6 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold">{selectedScheme.name}</h2>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="w-8 h-8 rounded-full border border-primary-400 flex items-center justify-center hover:bg-primary-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[70vh]">
                            <div className="mb-6">
                                <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Description</h4>
                                <p className="text-gray-700 leading-relaxed">{selectedScheme.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Authority</h4>
                                    <p className="text-gray-800 font-semibold">{selectedScheme.authority}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Category</h4>
                                    <p className="text-gray-800 font-semibold">{selectedScheme.category}</p>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Detailed Benefits</h4>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {selectedScheme.benefits && typeof selectedScheme.benefits === 'object' ? (
                                        Object.entries(selectedScheme.benefits).map(([key, value]) => (
                                            <li key={key}>
                                                <strong className="capitalize">{key.replace('_', ' ')}:</strong> {value}
                                            </li>
                                        ))
                                    ) : (
                                        <li>Financial assistance for eligible farmers.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="mb-8">
                                <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Required Documents</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedScheme.requirements || ['Land Records', 'Aadhaar Card', 'Bank Details']).map((req, idx) => (
                                        <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 border border-gray-200">
                                            {req}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                                <a
                                    href={selectedScheme.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-[2] py-3 bg-primary-600 text-white rounded-xl font-bold text-center hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
                                >
                                    Visit Official Portal <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
