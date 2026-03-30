import json
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Common agricultural synonyms to expand the search capability
SYNONYMS = {
    "money": ["financial", "cash", "funds", "subsidy", "subsidies", "assistance", "payment", "grant"],
    "subsidy": ["subsidies", "grant", "support", "financial assistance"],
    "subsidies": ["subsidy", "grants", "support", "financial help"],
    "seed": ["planting", "sowing", "seeds", "crop", "input"],
    "water": ["irrigation", "pump", "well", "borewell", "drip", "sprinkler"],
    "solar": ["sun", "energy", "electric", "power", "panels"],
    "loan": ["credit", "kcc", "bank", "borrow", "debt", "finance"],
    "insurance": ["bima", "claim", "protection", "loss", "damage", "security"],
    "soil": ["ground", "earth", "land", "field", "testing", "sand", "clay"],
    "urea": ["fertilizer", "nutrient", "nitrogen", "npk", "manure"]
}

class SchemeRecommender:
    def __init__(self, data_path=None):
        if data_path is None:
            data_path = os.path.join(os.path.dirname(__file__), 'schemes_data.json')
        
        self.data_path = data_path
        self.schemes = self.load_schemes()
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        self.prepare_search_engine()

    def load_schemes(self):
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading schemes: {e}")
            return []

    def prepare_search_engine(self):
        """Prepare TF-IDF matrix for semantic search"""
        if not self.schemes:
            return
        
        # Combine name, description, category, keywords and requirements for better matching
        corpus = []
        for s in self.schemes:
            fields = [
                s.get('name', ''),
                s.get('description', ''),
                s.get('category', ''),
                s.get('keywords', ''),
                ' '.join(s.get('requirements', []))
            ]
            corpus.append(' '.join(fields).lower())
            
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(corpus)

    def get_eligible_schemes(self, user_profile):
        """
        Filter schemes based on user profile and calculate compatibility score.
        user_profile: {category: str}
        """
        eligible_list = []
        selected_category = user_profile.get('category', 'All types').lower()
        
        for scheme in self.schemes:
            scheme_category = scheme.get('category', '').lower()
            
            # Strict category filtering: skip if not "all types" and category doesn't match
            if selected_category != 'all types':
                if selected_category not in scheme_category and scheme_category not in selected_category:
                    continue

            # Rank based on category focus.
            score = self.calculate_compatibility_score(scheme, user_profile)
            
            eligible_list.append({
                **scheme,
                "compatibility_score": round(score, 2)
            })
        
        # Sort by score (descending)
        return sorted(eligible_list, key=lambda x: x['compatibility_score'], reverse=True)

    def calculate_compatibility_score(self, scheme, user_profile):
        """
        A scoring algorithm that prioritizes the user's selected category.
        """
        base_score = 60  # Base score for any scheme
        
        selected_category = user_profile.get('category', 'All types').lower()
        scheme_category = scheme.get('category', '').lower()
        
        # 1. Direct Category Match (Highest Priority)
        if selected_category != 'all types':
            # Check for exact matches or partial matches (e.g., "Loan" matching "Credit/Loan")
            if selected_category in scheme_category or scheme_category in selected_category:
                base_score += 40
            else:
                # Also check keywords as a fallback for the 100% match
                keywords = scheme.get('keywords', '').lower()
                if selected_category in keywords:
                    base_score += 35
        
        # Ensure score stays in 0-100 range
        return min(max(base_score, 0), 100)

    def expand_query(self, query):
        """Expand search query using common synonyms to increase hit rate"""
        words = query.lower().split()
        expanded_words = []
        for word in words:
            expanded_words.append(word)
            # If the user's word has a known synonym list, add those words to the query
            if word in SYNONYMS:
                expanded_words.extend(SYNONYMS[word])
        return ' '.join(expanded_words)

    def search_schemes(self, query, top_n=20):
        """Semantic search using TF-IDF and Cosine Similarity"""
        if not self.schemes or not query:
            return []
            
        # 1. Expand the user's query with synonyms (AI expansion)
        expanded_query = self.expand_query(query)
        
        # 2. Vectorize the expanded query
        query_vec = self.tfidf_vectorizer.transform([expanded_query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # 3. Get indices of top matches
        top_indices = similarities.argsort()[-top_n:][::-1]
        
        results = []
        for idx in top_indices:
            # Threshold of 0.05 is much more forgiving for semantic matches
            if similarities[idx] > 0.05:  
                results.append({
                    **self.schemes[idx],
                    "search_score": round(float(similarities[idx]), 2)
                })
        
        return results

# Singleton instance
_recommender = None

def get_scheme_recommender():
    global _recommender
    if _recommender is None:
        _recommender = SchemeRecommender()
    return _recommender
