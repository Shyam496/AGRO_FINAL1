/**
 * Mock data for development and testing
 */

// Mock Users
export const mockUsers = [
    {
        id: '1',
        email: 'farmer@agromind.com',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        role: 'farmer'
    }
]

// Mock Diseases
export const mockDiseases = [
    {
        id: '1',
        name: 'Tomato Late Blight',
        cropType: 'Tomato',
        symptoms: ['Dark spots', 'White mold'],
        treatment: ['Fungicide'],
        severity: 'high',
        prevention: ['Resistant varieties']
    }
]

// Mock Fertilizers
export const mockFertilizers = [
    { id: '1', name: 'Urea', price: 266 },
    { id: '2', name: 'DAP', price: 1350 }
]

// Mock Government Schemes
export const mockSchemes = [
    {
        id: 'pm-kisan',
        name: 'Agricultural Income Subsidy (PM-KISAN)',
        description: 'Direct income support and primary agricultural subsidy of Rs. 6,000 per year to farmer families.',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { amount: 'Rs. 6,000 per year', installments: '3 payments of Rs. 2,000' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Land Records'],
        link: 'https://pmkisan.gov.in/',
        isActive: true
    },
    {
        id: 'pmksy',
        name: 'Irrigation Subsidy (PMKSY)',
        description: 'Major irrigation subsidy focusing on achieving "Har Khet Ko Pani" (water for every field).',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { subsidy: '45% to 55% for micro-irrigation', systems: 'Drip and Sprinkler' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Land Records', 'Aadhaar'],
        link: 'https://pmksy.gov.in/',
        isActive: true
    },
    {
        id: 'pm-kusum',
        name: 'Solar Pump Subsidy (PM-KUSUM)',
        description: 'Revolutionizing farm energy by providing up to 60% subsidy for solar-powered irrigation pumps.',
        authority: 'Ministry of New & Renewable Energy',
        category: 'Subsidy',
        benefits: { subsidy: '60% cost support', loan: '30% bank loan' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Bank Details'],
        link: 'https://pmkusum.mnre.gov.in/',
        isActive: true
    },
    {
        id: 'pkvy',
        name: 'Organic Farming Subsidy (PKVY)',
        description: 'A flagship subsidy scheme to promote organic farming. Rs. 50,000 per hectare for 3 years.',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { amount: 'Rs. 50,000/ha', support: 'Certification' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Cluster Card'],
        link: 'https://pgsindia-ncof.gov.in/',
        isActive: true
    },
    {
        id: 'midh',
        name: 'Horticulture Infrastructure Subsidy (MIDH)',
        description: 'Focuses on horticulture growth, providing primary subsidies for polyhouses and greenhouses.',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { subsidy: '35% to 50%', infrastructure: 'Polyhouses' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Project Report'],
        link: 'https://midh.gov.in/',
        isActive: true
    },
    {
        id: 'nfsm',
        name: 'Quality Seed & Input Subsidy (NFSM)',
        description: 'Aims to increase productivity via subsidies for quality seeds and input support.',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { seed_subsidy: 'Quality seeds', input_support: 'Fertilizers' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Land Records'],
        link: 'https://www.nfsm.gov.in/',
        isActive: true
    },
    {
        id: 'rkvy',
        name: 'State Agricultural Project Subsidy (RKVY)',
        description: 'Empowers states to develop programs with substantial subsidies for innovfarming projects.',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { subsidy: 'Up to 50%', infra: 'Warehouses' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Project Report', 'Land Proof'],
        link: 'https://rkvy.nic.in/',
        isActive: true
    },
    {
        id: 'shc',
        name: 'Soil Health Card & Nutrient Subsidy (SHC)',
        description: 'Promotes balanced fertilizer use by subsidizing soil testing and micronutrient assistance.',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { testing: 'Free health reports', input_subsidy: 'Micronutrients' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Soil Sample', 'Aadhaar'],
        link: 'https://soilhealth.dac.gov.in/',
        isActive: true
    },
    {
        id: 'pmfby-subsidy',
        name: 'Crop Insurance Premium Subsidy (PMFBY)',
        description: 'Government pays 98% of the crop insurance premium as a massive subsidy.',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { premium_support: 'Covers most cost', safety: 'Weather protection' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Land Records', 'Aadhaar'],
        link: 'https://pmfby.gov.in/',
        isActive: true
    },
    {
        id: 'isam-subsidy',
        name: 'Marketing Infrastructure Subsidy (ISAM)',
        description: 'Provides back-ended capital subsidies for storage and mandi infrastructure.',
        authority: 'Ministry of Agriculture',
        category: 'Subsidy',
        benefits: { subsidy: '25% to 33%', storage: 'Silos' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Land Records', 'Plan'],
        link: 'https://agmarknet.gov.in/',
        isActive: true
    },
    {
        id: 'kcc',
        name: 'Kisan Credit Card (KCC)',
        description: 'Timely and adequate credit for cultivation.',
        authority: 'RBI & NABARD',
        category: 'Loan',
        benefits: { interest: '4% prompt pay', card: 'RuPay Debit Card' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Land Records'],
        link: 'https://www.myscheme.gov.in/schemes/kcc',
        isActive: true
    },
    {
        id: 'farm-mech',
        name: 'Farm Mechanization Loan',
        description: 'Loans for tractors and modern harvesters.',
        authority: 'All Banks',
        category: 'Loan',
        benefits: { margin: '15-25% low margin', collateral: 'Hypothecation' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Dealer Quotation', 'Land Records'],
        link: 'https://www.bankofbaroda.in/',
        isActive: true
    },
    {
        id: 'land-purchase',
        name: 'Land Purchase Loan',
        description: 'Help small farmers buy additional farming land.',
        authority: 'Commercial Banks',
        category: 'Loan',
        benefits: { purpose: 'Acquiring arable land', tenure: '7-10 years' },
        eligibility: { farmer_type: ['Small/Marginal Farmers'] },
        requirements: ['Sale Agreement', 'Valuation'],
        link: 'https://www.sbi.co.in/',
        isActive: true
    },
    {
        id: 'produce-marketing',
        name: 'Produce Pledge Loan',
        description: 'Credit against warehouse receipts.',
        authority: 'NABARD',
        category: 'Loan',
        benefits: { limit: 'Up to 75% of value', avoid_loss: 'Better prices' },
        eligibility: { farmer_type: ['Farmers with stored produce'] },
        requirements: ['Warehouse Receipt', 'KCC'],
        link: 'https://www.myscheme.gov.in/',
        isActive: true
    },
    {
        id: 'agri-gold-loan',
        name: 'Gold Loan',
        description: 'Instant funds pledging gold ornaments.',
        authority: 'Commercial Banks',
        category: 'Loan',
        benefits: { speed: 'Instant disbursement', interest: '7-9% low rate' },
        eligibility: { farmer_type: ['All farmers with gold'] },
        requirements: ['Gold Ornaments', 'ID Proof'],
        link: 'https://www.sbi.co.in/',
        isActive: true
    },
    {
        id: 'horticulture-loan',
        name: 'National Horticulture Board (NHB) Horticulture Loan',
        description: 'Soft loans for commercial fruit/veg projects.',
        authority: 'National Horticulture Board',
        category: 'Loan',
        benefits: { subsidy: '35-50% capital', focus: 'High-value crops' },
        eligibility: { farmer_type: ['Horticulture Farmers'] },
        requirements: ['Project Report', 'Land Proof'],
        link: 'https://nhb.gov.in/',
        isActive: true
    },
    {
        id: 'acabc-loan',
        name: 'Agri-Clinics and Agri-Business Centres (ACABC) Loan',
        description: 'Loans for agri-graduates to start ventures.',
        authority: 'NABARD',
        category: 'Loan',
        benefits: { subsidy: '36% to 44%', amount: 'Up to Rs. 20 Lakh' },
        eligibility: { farmer_type: ['Agri-graduates'] },
        requirements: ["Degree Proof", "Project Report"],
        link: "https://www.acabc.gov.in/",
        isActive: true
    },
    {
        id: 'miss',
        name: 'Interest Subvention Scheme',
        description: 'Direct discount on short-term crop loans.',
        authority: 'Ministry of Agriculture',
        category: 'Loan',
        benefits: { rate: 'Subsidized interest', incentive: '3% prompt bonus' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['KCC Book', 'Aadhaar'],
        link: 'https://pib.gov.in/',
        isActive: true
    },
    {
        id: 'aif',
        name: 'Agriculture Infrastructure Fund',
        description: 'Long-term financing for post-harvest assets.',
        authority: 'Ministry of Agriculture',
        category: 'Loan',
        benefits: { subvention: '3% per annum', tenure: '7 years' },
        eligibility: { farmer_type: ['All farmers', 'FPOs'] },
        requirements: ["Project Report", "KYC"],
        link: "https://agriinfra.dac.gov.in/",
        isActive: true
    },
    {
        id: 'micro-irrigation-fund',
        name: 'Micro Irrigation Fund',
        description: 'State loans for precision irrigation reach.',
        authority: 'NABARD',
        category: 'Loan',
        benefits: { extra_subsidy: '15-20% extra pool', focus: 'Drip coverage' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Irrigation App', 'Land Proof'],
        link: 'https://www.nabard.org/',
        isActive: true
    },
    {
        id: 'pmfby-ins',
        name: 'Pradhan Mantri Fasal Bima (PMFBY)',
        description: 'Flagship crop insurance for natural calamities.',
        authority: 'Ministry of Agriculture',
        category: 'Insurance',
        benefits: { coverage: 'Drought, Flood, Pests', premium: 'Capped 1.5-2%' },
        eligibility: { farmer_type: ['All farmers growing notified crops'] },
        requirements: ['Land Records', 'Sowing Cert'],
        link: 'https://pmfby.gov.in/',
        isActive: true
    },
    {
        id: 'rwbcis',
        name: 'Weather Based Crop Insurance (RWBCIS)',
        description: 'Insurance based on weather station data.',
        authority: 'Ministry of Agriculture',
        category: 'Insurance',
        benefits: { fast_claim: 'Automatic weather trigger', specificity: 'Heat/Rain' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Land Detail'],
        link: 'https://pmfby.gov.in/',
        isActive: true
    },
    {
        id: 'upis',
        name: 'Unified Package Insurance (UPIS)',
        description: 'Composite insurance covering crop, cattle, and family.',
        authority: 'Dept of Agriculture',
        category: 'Insurance',
        benefits: { all_in_one: 'Crop, Tractor, Family', convenience: 'One window' },
        eligibility: { farmer_type: ['Small/Marginal Farmers'] },
        requirements: ['KCC Details', 'Personal ID'],
        link: 'https://www.myscheme.gov.in/',
        isActive: true
    },
    {
        id: 'seed-ins',
        name: 'Pilot Seed Crop Insurance',
        description: 'Covers seed crop purity and germination risks.',
        authority: 'DAC&FW',
        category: 'Insurance',
        benefits: { specialized: 'Seed production risk', coverage: 'Purity/Germination' },
        eligibility: { farmer_type: ["Seed Growers"] },
        requirements: ["Seed Cert", "Grower Agreement"],
        link: "https://agricoop.nic.in/",
        isActive: true
    },
    {
        id: 'cpis',
        name: 'Coconut Palm Insurance (CPIS)',
        description: 'Protection for coconut palms against disasters.',
        authority: 'Coconut Board',
        category: 'Insurance',
        benefits: { per_tree: 'Compensation per palm', protection: 'Storm/Pests' },
        eligibility: { farmer_type: ['Coconut Farmers'] },
        requirements: ["Palm Count", "Land Detail"],
        link: "https://coconutboard.nic.in/",
        isActive: true
    },
    {
        id: 'wheat-ins',
        name: 'Index Based Wheat Insurance',
        description: 'Uses satellite imagery to detect wheat stress.',
        authority: 'State Governments',
        category: 'Insurance',
        benefits: { hi_tech: 'Remote sensing loss', fairness: 'Zero survey error' },
        eligibility: { farmer_type: ['Wheat Farmers'] },
        requirements: ['Geo-farm Info', 'Aadhaar'],
        link: 'https://pmfby.gov.in/',
        isActive: true
    },
    {
        id: 'horti-ins',
        name: 'Horticulture Yield Insurance',
        description: 'Protects Mango, Citrus, Grapes from yield drops.',
        authority: 'Ministry of Agriculture',
        category: 'Insurance',
        benefits: { high_value: 'Premium crop cover', pest_focus: 'Orchard pests' },
        eligibility: { farmer_type: ['Horticulture Farmers'] },
        requirements: ['Orchard Reg', 'Yield Record'],
        link: 'https://midh.gov.in/',
        isActive: true
    },
    {
        id: 'weather-index-ins',
        name: 'Weather Index Compensation',
        description: 'State relief for unseasonal weather events.',
        authority: 'Disaster Management',
        category: 'Insurance',
        benefits: { emergency: 'Quick relief pay', broad: 'Covers minor crops' },
        eligibility: { farmer_type: ['All farmers in regions'] },
        requirements: ['Region Verification', 'ID'],
        link: 'https://pib.gov.in/',
        isActive: true
    },
    {
        id: 'sugarcane-ins',
        name: 'Sugarcane Crop Insurance',
        description: 'Specialized coverage for sugarcane crops against weather perils.',
        authority: 'Ministry of Agriculture',
        category: 'Insurance',
        benefits: { premium: 'Annual commercial crop rates', coverage: 'Yield & Pest loss' },
        eligibility: { farmer_type: ['Sugarcane Farmers'] },
        requirements: ['Land Records', 'Sowing Proof'],
        link: 'https://pmfby.gov.in/',
        isActive: true
    },
    {
        id: 'yield-loss-ins',
        name: 'Village Yield Insurance',
        description: 'Village-wide payout based on average yield.',
        authority: 'Insurance Companies',
        category: 'Insurance',
        benefits: { community: 'Entire village claims', stability: 'Resilience' },
        eligibility: { farmer_type: ['Community Farmers'] },
        requirements: ['Village Records', 'Sowing Proof'],
        link: 'https://pmfby.gov.in/',
        isActive: true
    },
    {
        id: 'stry-train',
        name: 'Rural Youth Skill Training (STRY)',
        description: 'Vocational skills for rural youth in agri fields.',
        authority: 'MANAGE',
        category: 'Training',
        benefits: { skill: 'Vocational Cert', stipend: 'Training allowance' },
        eligibility: { farmer_type: ["Rural Youth"] },
        requirements: ["Aadhaar", "Edu Proof"],
        link: "https://www.manage.gov.in/",
        isActive: true
    },
    {
        id: 'kvk-train',
        name: 'KVK Farm Science Training',
        description: 'Hands-on training at local science centers.',
        authority: 'ICAR - KVK',
        category: 'Training',
        benefits: { hands_on: 'Field demos', expert_access: 'Agri Scientists' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Local Proof', 'Farmer ID'],
        link: 'https://kvk.icar.gov.in/',
        isActive: true
    },
    {
        id: 'ffs-train',
        name: 'Farmer Field School (FFS)',
        description: 'Learning experimental farming in own fields.',
        authority: 'Dept of Agriculture',
        category: 'Training',
        benefits: { peer_learning: 'Group learning', solution: 'Local problems' },
        eligibility: { farmer_type: ['Active Cultivators'] },
        requirements: ["Farm access", "Participation"],
        link: "https://agricoop.nic.in/",
        isActive: true
    },
    {
        id: 'digital-agri-train',
        name: 'Digital Agriculture Training',
        description: 'Learn to use apps for weather and markets.',
        authority: 'CSC & Digital India',
        category: 'Training',
        benefits: { hi_tech: 'Market Intelligence', transparency: 'No middlemen' },
        eligibility: { farmer_type: ["Tech Farmers"] },
        requirements: ["Smartphone Access", "Aadhaar"],
        link: "https://www.digitalindia.gov.in/",
        isActive: true
    },
    {
        id: 'acabc-train',
        name: 'ACABC Entrepreneur Training',
        description: '45-day course on starting agri-ventures.',
        authority: 'MANAGE',
        category: 'Training',
        benefits: { business: 'Management Skills', certification: 'Subsidy eligibility' },
        eligibility: { farmer_type: ["Agri Graduates"] },
        requirements: ["Degree Cert", "Interview"],
        link: "https://www.acabc.gov.in/",
        isActive: true
    },
    {
        id: 'organic-train',
        name: 'Organic Certification Training',
        description: 'Mastering organic inputs and PGS-India rules.',
        authority: 'NCOF - PKVY',
        category: 'Training',
        benefits: { organic: 'Bio-input making', premium: 'Export certification' },
        eligibility: { farmer_type: ["Organic Farmers"] },
        requirements: ["Pledge", "Cluster Member"],
        link: "https://pgsindia-ncof.gov.in/",
        isActive: true
    },
    {
        id: 'asci-train',
        name: 'ASCI Agriculture Skill Training',
        description: 'Certified courses for specialized agri jobs.',
        authority: 'Skill Council India',
        category: 'Training',
        benefits: { certified: 'NSDC Certificate', specific: 'Technical skills' },
        eligibility: { farmer_type: ["Rural Workers"] },
        requirements: ["School Cert", "Aadhaar"],
        link: "https://asci-india.com/",
        isActive: true
    },
    {
        id: 'fpo-mgmt-train',
        name: 'FPO CEO Training',
        description: 'Governance and inventory training for FPO leaders.',
        authority: 'SFAC & NABARD',
        category: 'Training',
        benefits: { leadership: 'Group management', networking: 'Market links' },
        eligibility: { farmer_type: ["FPO Members"] },
        requirements: ["FPO Reg", "Nomination"],
        link: "https://sfacindia.com/",
        isActive: true
    },
    {
        id: 'women-agri-train',
        name: 'Training for Women Farmers',
        description: 'Value addition and nutrition garden skills.',
        authority: 'MKSP - NRLM',
        category: 'Training',
        benefits: { empower: 'Income growth', support: 'Free tools/seeds' },
        eligibility: { farmer_type: ["Women Farmers"] },
        requirements: ["SHG Member", "Aadhaar"],
        link: "https://aajeevika.gov.in/",
        isActive: true
    },
    {
        id: 'expert-farmer-train',
        name: 'Master Farmer Training',
        description: 'Success farmers teaching others locally.',
        authority: 'State Outreach',
        category: 'Training',
        benefits: { status: 'Progressive Farmer', income: 'Honorary grants' },
        eligibility: { farmer_type: ["Progressive Farmers"] },
        requirements: ["Success Proof", "Rec"],
        link: "https://pib.gov.in/",
        isActive: true
    },
    {
        id: 'smam-equip',
        name: 'Sub-Mission on Agri Mechanization (SMAM)',
        description: '50% subsidy for all farm machinery.',
        authority: 'Ministry of Agri',
        category: 'Equipment',
        benefits: { huge_saving: 'Half price tools', broad_range: 'All implements' },
        eligibility: { farmer_type: ["Registered farmers"] },
        requirements: ['Land Records', 'Aadhaar'],
        link: 'https://agrimachinery.nic.in/',
        isActive: true
    },
    {
        id: 'tractor-yojana',
        name: 'PM Kisan Tractor Subsidy',
        description: 'Direct subsidy for first-time tractor owners.',
        authority: 'Dept of Agriculture',
        category: 'Equipment',
        benefits: { max_subsidy: 'Rs 1 to 3 Lakh', ownership: 'No more rent' },
        eligibility: { farmer_type: ["Small Farmers"] },
        requirements: ['First-owner proof', 'Land'],
        link: 'https://www.myscheme.gov.in/',
        isActive: true
    },
    {
        id: 'chc-equip',
        name: 'Custom Hiring Centre Grant',
        description: 'Funds to buy machines for renting out.',
        authority: 'Rural Dev',
        category: 'Equipment',
        benefits: { rental_income: 'Earn from rent', communal: '80% Group grant' },
        eligibility: { farmer_type: ["SHG / FPO"] },
        requirements: ["Reg proof", "Site plan"],
        link: "https://agrimachinery.nic.in/",
        isActive: true
    },
    {
        id: 'drone-subsidy',
        name: 'Kisan Drone Subsidy',
        description: 'Grants to buy drones for spraying/mapping.',
        authority: 'SMAM Drone Unit',
        category: 'Equipment',
        benefits: { efficient: 'Fast spraying', safe: 'Chemical safety' },
        eligibility: { farmer_type: ["Entrepreneurs"] },
        requirements: ["Pilot Cert", "Permit"],
        link: "https://agrimachinery.nic.in/",
        isActive: true
    },
    {
        id: 'power-tiller-equip',
        name: 'Power Tiller Subsidy',
        description: 'Aid for small mechanical tillers.',
        authority: 'State Agri Dept',
        category: 'Equipment',
        benefits: { affordable: 'Tractor alternative', multiple: 'Weeding/Pumping' },
        eligibility: { farmer_type: ["Smallholders"] },
        requirements: ['Land Cert', 'Quotes'],
        link: 'https://agrimachinery.nic.in/',
        isActive: true
    },
    {
        id: 'solar-equip-sub',
        name: 'Solar Light Trap Subsidy',
        description: 'Subsidies for solar-powered pest traps.',
        authority: 'Renewable Energy',
        category: 'Equipment',
        benefits: { zero_cost: 'No electricity bill', eco_friendly: 'Pest management' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar'],
        link: 'https://pmkusum.mnre.gov.in/',
        isActive: true
    },
    {
        id: 'phtm-equip',
        name: 'Post Harvest Tool Kit',
        description: 'Subsidies for cleaning and grading tools.',
        authority: 'NHB & MIDH',
        category: 'Equipment',
        benefits: { value_add: '20% better price', quality: 'Clean produce' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Land records', 'Invoice'],
        link: 'https://agriinfra.dac.gov.in/',
        isActive: true
    },
    {
        id: 'harvester-equip',
        name: 'Combined Harvester Subsidy',
        description: 'Aid for high-capacity harvest machines.',
        authority: 'State Missions',
        category: 'Equipment',
        benefits: { time_saver: '1 acre per hour', labor_save: 'Replace labor' },
        eligibility: { farmer_type: ["Groups/Large farmers"] },
        requirements: ['Land docs', 'RC'],
        link: 'https://agrimachinery.nic.in/',
        isActive: true
    },
    {
        id: 'irrigation-equip',
        name: 'Modern Irrigation Tool Subsidy',
        description: 'Motors, pipes, and tanks for rain harvest.',
        authority: 'PMKSY',
        category: 'Equipment',
        benefits: { storage: 'Farm pond funds', distribution: 'PVC pipe support' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Plan', 'Estimate'],
        link: 'https://pmksy.gov.in/',
        isActive: true
    },
    {
        id: 'small-tools-kit',
        name: 'Manual Tool Kit Subsidy',
        description: 'Ergonomic tools for women & tribal farmers.',
        authority: 'Tribal Affairs',
        category: 'Equipment',
        benefits: { relief: 'Reduce strain', effective: 'Better weeding' },
        eligibility: { farmer_type: ["Women/Tribal"] },
        requirements: ["Gender/Caste Cert", "Aadhaar"],
        link: "https://pib.gov.in/",
        isActive: true
    },
    {
        id: 'enam-market',
        name: 'National Agriculture Market (e-NAM)',
        description: 'Online platform connecting mandis nationwide.',
        authority: 'SFAC',
        category: 'Marketing',
        benefits: { price: 'Direct bids', enam: 'Pan-India access' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Bank Account'],
        link: 'https://enam.gov.in/',
        isActive: true
    },
    {
        id: 'aif-market',
        name: 'AIF Storage Infrastructure',
        description: 'Funding to build cold storage & warehouses.',
        authority: 'Ministry of Agri',
        category: 'Marketing',
        benefits: { infra: 'Hold until peak price', storage: 'Cold chain funding' },
        eligibility: { farmer_type: ["FPOs / Individual"] },
        requirements: ["Project Report", "Land Title"],
        link: "https://agriinfra.dac.gov.in/",
        isActive: true
    },
    {
        id: 'operation-greens',
        name: 'Operation Greens (TOP-II)',
        description: 'Logistics support for perishable crops.',
        authority: 'Food Processing',
        category: 'Marketing',
        benefits: { logistics: '50% transport aid', storage: '50% rental aid' },
        eligibility: { farmer_type: ["Listed crop farmers"] },
        requirements: ["Crop verify", "Transit bill"],
        link: "https://mofpi.gov.in/",
        isActive: true
    },
    {
        id: 'agmarknet',
        name: 'Agmarknet Price Portal',
        description: 'Daily price trends from 3000 mandis.',
        authority: 'DMI',
        category: 'Marketing',
        benefits: { knowledge: 'Know prices daily', trending: 'Plan next crop' },
        eligibility: { farmer_type: ['All farmers'] },
        requirements: ['Aadhaar', 'Price Awareness'],
        link: 'https://agmarknet.gov.in/',
        isActive: true
    },
    {
        id: 'kisan-rail-market',
        name: 'Kisan Rail Transport',
        description: 'Train freight subsidy for fresh produce.',
        authority: 'Indian Railways',
        category: 'Marketing',
        benefits: { fast: 'Fresh to distant city', cheap: '50% freight off' },
        eligibility: { farmer_type: ["Fruit/Veg Producers"] },
        requirements: ["Booking", "Farmer ID"],
        link: "https://indianrailways.gov.in/",
        isActive: true
    },
    {
        id: 'ami-market',
        name: 'Agri Marketing Infrastructure (AMI)',
        description: 'Strengthening rural mandi facilities.',
        authority: 'Marketing Director',
        category: 'Marketing',
        benefits: { local: 'Better rural labs', scientific: 'Reduce damage' },
        eligibility: { farmer_type: ["Panchayats / FPOs"] },
        requirements: ["Local Proposal", "Land"],
        link: "https://agricoop.nic.in/",
        isActive: true
    },
    {
        id: 'ps-scheme',
        name: 'Price Support Scheme (PSS)',
        description: 'MSP procurement for pulses and oilseeds.',
        authority: 'NAFED',
        category: 'Marketing',
        benefits: { guarantee: 'MSP buy guarantee', security: 'No trade loss' },
        eligibility: { farmer_type: ["Oilseed Producers"] },
        requirements: ["Land", "Mandi Slip"],
        link: "https://www.nafed-india.com/",
        isActive: true
    },
    {
        id: 'mis-market',
        name: 'Market Intervention Relief',
        description: 'Compensation when horticulture prices crash.',
        authority: 'Ministry of Agri',
        category: 'Marketing',
        benefits: { relief: 'Compensate price crash', bailout: 'Potato/Ginger focus' },
        eligibility: { farmer_type: ["Horticulture Farmers"] },
        requirements: ["State notice", "Aadhaar"],
        link: "https://agricoop.nic.in/",
        isActive: true
    },
    {
        id: 'export-market',
        name: 'Agri Export Zone Benefit',
        description: 'Export support via APEDA clusters.',
        authority: 'APEDA',
        category: 'Marketing',
        benefits: { global: 'Dubai/USA access', premium: '5x higher price' },
        eligibility: { farmer_type: ["AEZ cluster farmers"] },
        requirements: ["Quality Cert", "Export Reg"],
        link: "https://apeda.gov.in/",
        isActive: true
    },
    {
        id: 'gramin-bhandaran',
        name: 'Gramin Bhandaran Storage',
        description: 'Rural scientific storage for small farm produce.',
        authority: 'NABARD',
        category: 'Marketing',
        benefits: { shelf_life: 'Moisture/Rat proof', access: 'Rural localized' },
        eligibility: { farmer_type: ["Rural Individuals"] },
        requirements: ["Land Title", "Standard Design"],
        link: "https://www.nabard.org/",
        isActive: true
    }
]

// Mock Weather Data
export const mockWeather = {
    current: { temperature: 28, humidity: 65, condition: 'Clear' },
    forecast: []
}

// Mock Functions
export function mockDiseasePredict(image) { return { diseaseName: 'Healthy', confidence: 0.95 } }
export function mockFertilizerRecommend(soilData) { return { recommendations: [], npkRequired: { n: 120, p: 60, k: 40 } } }
export const mockChatResponses = { greeting: 'Hi', default: 'Hello' }
export function getMockChatResponse(msg) { return 'Hello' }
