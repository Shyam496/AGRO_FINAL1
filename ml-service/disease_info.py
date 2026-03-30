# Disease Information Databases for AgroMind ML Service
# This file contains comprehensive disease information including symptoms, causes, and treatments

# Disease-specific symptoms database
DISEASE_SYMPTOMS = {
    'Apple_scab': [
        'Olive-green to brown spots on leaves',
        'Velvety or fuzzy appearance on lesions',
        'Premature leaf drop',
        'Scabby lesions on fruit',
        'Cracked or deformed fruit',
        'Reduced fruit quality and marketability'
    ],
    'Black_rot': [
        'Circular brown spots with purple margins',
        'Black pycnidia (fruiting bodies) in lesions',
        'Fruit mummification',
        'Cankers on branches',
        'Leaf spots with concentric rings',
        'Premature fruit drop'
    ],
    'Cedar_apple_rust': [
        'Bright orange-yellow spots on upper leaf surface',
        'Small tube-like structures on leaf undersides',
        'Premature defoliation',
        'Reduced tree vigor',
        'Fruit lesions in severe cases',
        'Distorted leaf growth'
    ],
    'Powdery_mildew': [
        'White powdery coating on leaves and stems',
        'Leaf curling and distortion',
        'Stunted plant growth',
        'Yellowing of affected leaves',
        'Reduced photosynthesis',
        'Premature leaf drop in severe cases'
    ],
    'Cercospora_leaf_spot': [
        'Circular to irregular brown spots',
        'Gray center with dark purple border',
        'Yellowing around lesions',
        'Premature defoliation',
        'Reduced yield',
        'Weakened plant vigor'
    ],
    'Common_rust': [
        'Small orange-brown pustules on leaves',
        'Pustules arranged in rows',
        'Yellowing of leaf tissue',
        'Premature leaf death',
        'Reduced photosynthetic area',
        'Stunted plant growth'
    ],
    'Northern_Leaf_Blight': [
        'Long cigar-shaped gray-green lesions',
        'Lesions turn tan to brown as they age',
        'Lesions parallel to leaf veins',
        'Entire leaves may die',
        'Reduced grain fill',
        'Lower ear quality'
    ],
    'Esca': [
        'Tiger-stripe pattern on leaves',
        'Sudden wilting of shoots',
        'Dark streaking in wood',
        'Dried, shriveled grapes',
        'Gradual vine decline',
        'White rot on berries'
    ],
    'Leaf_blight': [
        'Brown to black lesions on leaves',
        'Water-soaked appearance initially',
        'Rapid spread during wet weather',
        'Leaf death and drop',
        'Stem lesions in advanced stages',
        'Reduced plant vigor'
    ],
    'Haunglongbing': [
        'Yellow shoots (blotchy mottle)',
        'Lopsided, bitter fruit',
        'Premature fruit drop',
        'Twig dieback',
        'Stunted tree growth',
        'Eventual tree death'
    ],
    'Bacterial_spot': [
        'Small dark spots with yellow halos',
        'Spots on leaves, stems, and fruit',
        'Leaf drop in severe infections',
        'Fruit lesions reduce marketability',
        'Defoliation weakens plants',
        'Reduced yield'
    ],
    'Fusarium': [
        'Yellowing of lower leaves first',
        'Wilting during hot hours',
        'Brown discoloration in vascular tissue',
        'Stunted growth',
        'One-sided symptoms common',
        'Plant death in severe cases'
    ],
    'Leaf_Curl': [
        'Upward curling of leaves',
        'Yellowing between veins',
        'Leaf thickening',
        'Stunted plant growth',
        'Reduced fruit set',
        'Transmitted by whiteflies'
    ],
    'Mosaic': [
        'Mottled light and dark green pattern',
        'Leaf distortion and curling',
        'Stunted plant growth',
        'Reduced fruit size and quality',
        'Yellow streaking on leaves',
        'Flower color breaking'
    ],
    'Early_blight': [
        'Dark brown spots with concentric rings (target pattern)',
        'Lower leaves affected first',
        'Yellowing around lesions',
        'Premature defoliation',
        'Fruit lesions near stem end',
        'Reduced yield'
    ],
    'Late_blight': [
        'Water-soaked lesions on leaves',
        'White fuzzy growth on leaf undersides',
        'Rapid leaf and stem death',
        'Brown lesions on fruit',
        'Foul odor from infected tissue',
        'Can destroy entire crop quickly'
    ],
    'Leaf_Mold': [
        'Yellow spots on upper leaf surface',
        'Olive-green to brown fuzzy growth underneath',
        'Leaf curling',
        'Premature leaf drop',
        'Reduced photosynthesis',
        'Common in greenhouse conditions'
    ],
    'Septoria_leaf_spot': [
        'Small circular spots with gray centers',
        'Dark borders around lesions',
        'Tiny black specks (pycnidia) in center',
        'Lower leaves affected first',
        'Progressive upward spread',
        'Severe defoliation possible'
    ],
    'Spider_mites': [
        'Fine webbing on leaves',
        'Yellow stippling on leaf surface',
        'Bronzing of leaves',
        'Leaf drop in severe infestations',
        'Reduced plant vigor',
        'Tiny moving dots visible with magnification'
    ],
    'Target_Spot': [
        'Circular lesions with concentric rings',
        'Brown to tan colored spots',
        'Lesions on leaves, stems, and fruit',
        'Premature defoliation',
        'Reduced fruit quality',
        'Yield loss in severe cases'
    ],
    'Yellow_Leaf_Curl_Virus': [
        'Severe upward leaf curling',
        'Yellowing of leaf margins',
        'Stunted plant growth',
        'Reduced fruit set',
        'Small, hard fruit',
        'Transmitted by whiteflies'
    ],
    'Tomato_mosaic_virus': [
        'Mottled light and dark green leaves',
        'Leaf distortion and fern-like appearance',
        'Stunted growth',
        'Reduced fruit set',
        'Fruit with yellow blotches',
        'Internal browning of fruit'
    ],
    'Leaf_scorch': [
        'Brown leaf margins and tips',
        'V-shaped lesions between veins',
        'Yellowing before browning',
        'Premature leaf drop',
        'Reduced plant vigor',
        'Fruit size reduction'
    ],
    'Pear_scab': [
        'Dark, velvety spots on leaves and fruit',
        'Cracking of pear fruit as it matures',
        'Premature yellowing and leaf drop',
        'Distorted leaf and fruit growth',
        'Cankers on young shoots and twigs',
        'Reduced fruit size and quality'
    ],
    'Pear_rust': [
        'Bright orange or red lesions on upper leaf surface',
        'Spiky, tube-like growths on leaf undersides',
        'Swollen orange spots on young branches',
        'Premature defoliation in severe cases',
        'Reduced tree vigor and stunted growth',
        'Orange cup-shaped lesions on fruit surface'
    ]
}

# Disease-specific treatment database
DISEASE_TREATMENTS = {
    'Apple_scab': [
        'Apply fungicides (Captan, Myclobutanil) preventively',
        'Remove and destroy infected leaves and fruit',
        'Prune to improve air circulation',
        'Apply dormant oil spray in early spring',
        'Use resistant varieties for new plantings',
        'Maintain proper tree spacing'
    ],
    'Black_rot': [
        'Remove all mummified fruit and infected wood',
        'Apply copper-based fungicides',
        'Prune out cankers during dormant season',
        'Improve drainage around trees',
        'Apply fungicides at petal fall',
        'Destroy all infected plant material'
    ],
    'Cedar_apple_rust': [
        'Apply fungicides in early spring',
        'Remove nearby cedar/juniper hosts if possible',
        'Rake and destroy fallen infected leaves',
        'Use resistant apple varieties',
        'Apply protectant fungicides before symptoms',
        'Monitor during wet spring weather'
    ],
    'Powdery_mildew': [
        'Apply sulfur or potassium bicarbonate sprays',
        'Use neem oil as organic treatment',
        'Apply fungicides at first sign',
        'Remove heavily infected plant parts',
        'Improve air circulation through pruning',
        'Water at soil level, avoid wetting foliage'
    ],
    'Cercospora_leaf_spot': [
        'Apply fungicides (Chlorothalonil, Mancozeb)',
        'Remove and destroy infected plant debris',
        'Practice crop rotation',
        'Avoid overhead irrigation',
        'Use disease-free seeds',
        'Apply fungicides preventively'
    ],
    'Common_rust': [
        'Apply fungicides if disease appears early',
        'Plant rust-resistant varieties',
        'Remove volunteer corn plants',
        'Monitor fields during humid weather',
        'Apply foliar fungicides if needed',
        'Ensure balanced fertilization'
    ],
    'Northern_Leaf_Blight': [
        'Use resistant hybrid varieties',
        'Apply foliar fungicides (Azoxystrobin, Propiconazole)',
        'Bury crop residue through tillage',
        'Rotate with non-host crops',
        'Scout fields regularly',
        'Apply fungicides at first symptoms'
    ],
    'Esca': [
        'Prune during dry weather only',
        'Remove and destroy infected vines',
        'Apply wound protectants after pruning',
        'Disinfect pruning tools between plants',
        'Maintain vine vigor through nutrition',
        'No curative treatment available'
    ],
    'Leaf_blight': [
        'Apply copper-based fungicides',
        'Remove infected leaves immediately',
        'Improve air circulation',
        'Avoid overhead watering',
        'Use disease-free planting material',
        'Apply preventive fungicide sprays'
    ],
    'Haunglongbing': [
        'Remove and destroy infected trees immediately',
        'Control Asian citrus psyllid with insecticides',
        'Use certified disease-free nursery stock',
        'Apply nutritional sprays to support tree health',
        'Report suspected cases to authorities',
        'No cure available - prevention is critical'
    ],
    'Bacterial_spot': [
        'Apply copper-based bactericides',
        'Use disease-free seeds and transplants',
        'Avoid working with wet plants',
        'Remove and destroy infected debris',
        'Practice 3-4 year crop rotation',
        'Disinfect tools regularly'
    ],
    'Fusarium': [
        'Use resistant varieties',
        'Solarize soil before planting',
        'Improve soil drainage',
        'Practice long crop rotations (4+ years)',
        'Remove and destroy infected plants',
        'Avoid over-watering and water stress'
    ],
    'Leaf_Curl': [
        'Apply insecticides to control whiteflies',
        'Remove severely infected plants',
        'Use reflective mulches',
        'Plant resistant varieties if available',
        'Control weeds that harbor virus',
        'Monitor plants weekly'
    ],
    'Mosaic': [
        'Use virus-free certified seeds',
        'Control aphid populations with insecticides',
        'Remove infected plants immediately',
        'Eliminate weed reservoirs',
        'Disinfect hands and tools between plants',
        'Use reflective mulches to deter aphids'
    ],
    'Early_blight': [
        'Apply fungicides (Chlorothalonil, Mancozeb)',
        'Remove lower leaves touching soil',
        'Mulch around plants',
        'Practice 3-year crop rotation',
        'Water at soil level',
        'Apply fungicides preventively'
    ],
    'Late_blight': [
        'Apply fungicides (Chlorothalonil, Copper) preventively',
        'Remove and destroy infected material',
        'Avoid overhead irrigation',
        'Eliminate volunteer plants',
        'Use resistant varieties',
        'Monitor weather for favorable conditions'
    ],
    'Leaf_Mold': [
        'Improve greenhouse ventilation',
        'Reduce humidity levels',
        'Remove infected leaves',
        'Apply fungicides if persistent',
        'Space plants for air movement',
        'Maintain temperatures above 70°F'
    ],
    'Septoria_leaf_spot': [
        'Remove infected lower leaves',
        'Apply fungicides during wet weather',
        'Mulch to prevent soil splash',
        'Stake or cage plants',
        'Practice crop rotation',
        'Avoid working with wet plants'
    ],
    'Spider_mites': [
        'Spray with strong water stream',
        'Apply insecticidal soap or neem oil',
        'Introduce predatory mites',
        'Maintain adequate soil moisture',
        'Remove heavily infested leaves',
        'Avoid excessive nitrogen fertilization'
    ],
    'Target_Spot': [
        'Apply fungicides at early stages',
        'Remove and destroy infected debris',
        'Improve air circulation',
        'Avoid overhead irrigation',
        'Practice crop rotation',
        'Use disease-free transplants'
    ],
    'Yellow_Leaf_Curl_Virus': [
        'Control whitefly populations aggressively',
        'Use insect-proof netting in greenhouses',
        'Remove and destroy infected plants',
        'Plant virus-resistant varieties',
        'Use reflective mulches',
        'Eliminate weed hosts'
    ],
    'Tomato_mosaic_virus': [
        'Use virus-free certified seeds',
        'Disinfect hands and tools with milk/soap',
        'Remove infected plants immediately',
        'Control aphid and thrips populations',
        'Avoid tobacco use near plants',
        'Practice good greenhouse sanitation'
    ],
    'Leaf_scorch': [
        'Ensure consistent soil moisture',
        'Mulch around plants',
        'Remove infected leaves',
        'Avoid overhead watering',
        'Apply fungicides if severe',
        'Improve soil drainage'
    ],
    'Pear_scab': [
        'Apply fungicides (Myclobutanil, Copper) preventively',
        'Rake and destroy fallen leaves and fruit',
        'Improve air circulation through pruning',
        'Avoid overhead irrigation techniques',
        'Select resistant cultivars for new plantings',
        'Ensure proper drainage in the orchard'
    ],
    'Pear_rust': [
        'Remove alternative hosts (Junipers, Cedars) within 1 km',
        'Apply sulfur or protectant fungicides in spring',
        'Prune and destroy infected shoot tips',
        'Keep foliage dry during irrigation cycles',
        'Provide adequate fertilization and water',
        'Consult experts for intensive fungicide programs'
    ]
}
