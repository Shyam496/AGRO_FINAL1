"""
Soil Report OCR Module
Extracts soil parameters from uploaded PDF/image reports
"""

import re
import numpy as np
from PIL import Image
import io

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("WARNING: pytesseract not available, OCR functionality limited")

try:
    import easyocr
    EASYOCR_AVAILABLE = True
    # Initialize EasyOCR reader (lazy loading)
    _easyocr_reader = None
except ImportError:
    EASYOCR_AVAILABLE = False
    print("WARNING: easyocr not available")

try:
    from pdf2image import convert_from_bytes
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    print("WARNING: pdf2image not available, PDF support disabled")

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False
    print("WARNING: pypdf not available")


class SoilReportOCR:
    def __init__(self):
        """Initialize OCR engine"""
        self.use_easyocr = EASYOCR_AVAILABLE
        self.use_tesseract = TESSERACT_AVAILABLE
        
        if not self.use_easyocr and not self.use_tesseract:
            raise RuntimeError("No OCR engine available. Install pytesseract or easyocr")
    
    def get_easyocr_reader(self):
        """Get or create EasyOCR reader (lazy loading)"""
        global _easyocr_reader
        if _easyocr_reader is None and EASYOCR_AVAILABLE:
            _easyocr_reader = easyocr.Reader(['en'], gpu=False)
        return _easyocr_reader
    
    def extract_text_from_image(self, image):
        """
        Extract text from PIL Image
        
        Args:
            image: PIL Image object
        
        Returns:
            str: Extracted text
        """
        try:
            if self.use_easyocr:
                # Use EasyOCR (more accurate)
                reader = self.get_easyocr_reader()
                img_array = np.array(image)
                results = reader.readtext(img_array)
                text = ' '.join([result[1] for result in results])
            elif self.use_tesseract:
                # Use Tesseract
                text = pytesseract.image_to_string(image)
            else:
                raise RuntimeError("No OCR engine available")
            
            return text
        
        except Exception as e:
            raise Exception(f"Error extracting text from image: {str(e)}")
    
    def extract_text_from_pdf(self, pdf_bytes):
        """
        Extract text from PDF bytes
        Attempts pure text extraction first, then falls back to OCR
        """
        all_text = []

        # Method 1: Try pypdf (No system dependencies required)
        if PYPDF_AVAILABLE:
            try:
                pdf_reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        all_text.append(text)
                
                # If we got substantial text, return it
                full_text = ' '.join(all_text).strip()
                if len(full_text) > 20:
                    return full_text
            except Exception as e:
                print(f"pypdf failed: {e}")

        # Method 2: Fallback to OCR (Requires Poppler + Tesseract/EasyOCR)
        if PDF2IMAGE_AVAILABLE:
            try:
                # Convert PDF to images
                images = convert_from_bytes(pdf_bytes)
                
                # Extract text from each page
                for image in images:
                    text = self.extract_text_from_image(image)
                    all_text.append(text)
                
                return ' '.join(all_text)
            except Exception as e:
                if "poppler" in str(e).lower():
                    raise RuntimeError("Uploaded PDF could not be processed. Please upload as an Image (JPG/PNG) or ensure it is a valid Soil Report.")
                raise Exception(f"Error extracting text from PDF: {str(e)}")
        
        # If both fail
        if not all_text:
            raise RuntimeError("Could not extract text from PDF. If it is a scanned document, please upload it as an image (JPG/PNG) instead.")
            
        return ' '.join(all_text)
    
    def parse_soil_parameters(self, text):
        """
        Parse soil parameters from extracted text
        
        Args:
            text: str, extracted text from report
        
        Returns:
            dict with extracted parameters
        """
        # Normalize text
        text = text.upper()
        text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
        
        # Initialize result
        result = {
            'nitrogen': None,
            'phosphorous': None,
            'potassium': None,
            'ph': None,
            'soil_type': None,
            'extraction_confidence': 'low'
        }
        
        # Extract N-P-K values
        result['nitrogen'] = self.extract_npk_value(text, 'N', 'NITROGEN', 'NO3-N', 'NITRATE')
        result['phosphorous'] = self.extract_npk_value(text, 'P', 'PHOSPHOROUS', 'PHOSPHORUS', 'OLSEN P', 'BRAY 1 P')
        result['potassium'] = self.extract_npk_value(text, 'K', 'POTASSIUM')
        
        # Extract pH
        result['ph'] = self.extract_ph_value(text)
        
        # Extract soil type
        result['soil_type'] = self.extract_soil_type(text)
        
        # TABLE SEQUENCE MATCHING (New Heuristic)
        # Look for sequences of 4-7 numbers that likely represent Soil Params
        # Typical sequence: [Index, Texture(Text), Organic, pH, N, P, K]
        # Or: [N, P, K, pH]
        sequence_match = re.findall(r'(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)', text)
        for seq in sequence_match:
            # Check if this looks like [Organic, pH, N, P]
            # pH is usually 4-9
            v1, v2, v3, v4 = map(float, seq)
            if 4 <= v2 <= 9 and 0 <= v1 <= 20: # Organic 0-20, pH 4-9
                if result['ph'] is None: result['ph'] = v2
                if result['nitrogen'] is None: result['nitrogen'] = v3
                if result['phosphorous'] is None: result['phosphorous'] = v4
        
        # Second attempt for N-P-K sequence
        npk_seq = re.findall(r'(?:N|NITROGEN|P|K).*?(\d+)\s+(\d+)\s+(\d+)', text, re.IGNORECASE)
        if npk_seq and result['nitrogen'] is None:
            n, p, k = map(float, npk_seq[0])
            result['nitrogen'], result['phosphorous'], result['potassium'] = n, p, k
        
        # Determine if this actually looks like a soil report
        # 1. Critical parameters check (Need N, P, or K to be found)
        critical_parameters = [result['nitrogen'], result['phosphorous'], result['potassium'], result['ph']]
        found_critical = sum(1 for p in critical_parameters if p is not None)
        
        # 2. Strict Agricultural Context check
        # We need specific agricultural phrases.
        strict_context_keywords = [
            'SOIL ANALYSIS', 'SOIL REPORT', 'SOIL TEST', 'NPK VALUE', 
            'NUTRIENT CONTENT', 'PHOSPHOROUS CONTENT', 'POTASSIUM CONTENT',
            'NITROGEN CONTENT', 'ORGANIC CARBON', 'SOIL HEALTH', 'MICRONUTRIENT',
            'AGRICULTUR', 'FERTILIZER RECOMMENDATION', 'ICAR', 'KRISHI'
        ]
        context_matches = sum(1 for kw in strict_context_keywords if kw in text)
        
        # 3. Basic keyword fallback
        basic_keywords = ['SOIL', 'FERTILIZER', 'CROP', 'KG/HA', 'PH VALUE', 'ACRE', 'HECTARE']
        basic_matches = sum(1 for kw in basic_keywords if kw in text)

        # STRICTER LOGIC:
        # A valid report MUST have:
        # (At least 1 Critical Value AND (1 Strict Keyword OR 2 Basic Keywords))
        # OR (At least 2 Strict Keywords - implying we just missed the values but it's the right doc)
        
        is_valid_report = False
        
        if found_critical >= 1 and (context_matches >= 1 or basic_matches >= 2):
            is_valid_report = True
        elif context_matches >= 2:
            is_valid_report = True
            
        if is_valid_report:
            result['is_soil_report'] = True
            # Determine confidence
            extracted_count = sum(1 for v in result.values() if v is not None and v != 'low' and v is not True and v is not False)
            if extracted_count >= 4:
                result['extraction_confidence'] = 'high'
            elif extracted_count >= 2:
                result['extraction_confidence'] = 'medium'
            else:
                result['extraction_confidence'] = 'low'
        else:
            result['is_soil_report'] = False
            result['extraction_confidence'] = 'none'
        
        return result
    
    def extract_npk_value(self, text, *keywords):
        """Extract NPK value from text with agricultural range validation"""
        for keyword in keywords:
            # Pattern 1: "Nitrogen: 150" or "Nitrogen (N): 150" or "N: 150"
            # Pattern 1.1: Standard "Keyword: Value" or "Keyword Value"
            pattern1 = rf'{keyword}(?:\s*\(.*?\))?\s*[:\-\s]?\s*(\d+\.?\d*)'
            match = re.search(pattern1, text)
            if match:
                val = float(match.group(1))
                # Validate range (0-1000 kg/ha is a sane agricultural limit)
                if 0 <= val <= 1000:
                    return val
            
            # Pattern 1.2: Keyword followed by some text then value (common in tables)
            pattern1_2 = rf'{keyword}.*?(\d+\.?\d*)'
            matches = re.finditer(pattern1_2, text)
            for m in matches:
                val = float(m.group(1))
                if 0 < val <= 1000: # Heuristic: skip 0 for table-style extraction if possible
                    return val
            
            # Pattern 2: "150 kg/ha N" or "150 N"
            pattern2 = rf'(\d+\.?\d*)\s*(?:KG/HA|KG|PPM)?\s*{keyword}'
            match = re.search(pattern2, text)
            if match:
                val = float(match.group(1))
                if 0 <= val <= 1000:
                    return val

            # Pattern 2.1: Specific for NO3-N ppm style likely found in the screenshot
            if keyword == 'NO3-N' or keyword == 'NITRATE':
                pattern2_1 = rf'{keyword}\s*PPM.*?(\d+\.?\d*)'
                match = re.search(pattern2_1, text)
                if match:
                    val = float(match.group(1))
                    if 0 <= val <= 1000:
                        return val
            
            # Pattern 3: Sequence match (finding a value that follows the keyword after other table headers)
            # This is a fallback for when the value is much further down than Pattern 1.2 might safely catch
            # if we have multiple headers.
            headers = ['NITROGEN', 'NITRATE', 'NO3-N', 'PHOSPHOROUS', 'PHOSPHORUS', 'P', 'POTASSIUM', 'K', 'PH']
            if any(h in keyword for h in headers):
                # Look for a number that isn't immediately after but follows the column structure
                # This is very heuristic but helps in linearized tables
                pass
        
        return None
        
        return None
    
    def extract_ph_value(self, text):
        """Extract pH value from text"""
        # Pattern: "pH: 6.5" or "PH 6.5"
        patterns = [
            r'PH\s*:?\s*(\d+\.?\d*)',
            r'(\d+\.?\d*)\s*PH'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                ph = float(match.group(1))
                # Validate pH range (0-14)
                if 0 <= ph <= 14:
                    return ph
        
        return None
    
    def extract_soil_type(self, text):
        """Extract soil type from text"""
        soil_types = ['SANDY', 'LOAMY', 'CLAYEY', 'RED', 'BLACK']
        
        for soil_type in soil_types:
            if soil_type in text:
                return soil_type.capitalize()
        
        return None
    
    def process_file(self, file_bytes, file_type):
        """
        Process uploaded file and extract soil parameters
        
        Args:
            file_bytes: bytes, file content
            file_type: str, 'pdf' or 'image'
        
        Returns:
            dict with extracted parameters
        """
        try:
            # Extract text based on file type
            if file_type == 'pdf':
                text = self.extract_text_from_pdf(file_bytes)
            else:
                # Image file
                image = Image.open(io.BytesIO(file_bytes))
                text = self.extract_text_from_image(image)
            
            # Parse parameters
            parameters = self.parse_soil_parameters(text)
            parameters['extracted_text'] = text[:500]  # First 500 chars for reference
            
            return {
                'success': True,
                'data': parameters
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def fill_missing_parameters(self, parameters, defaults=None):
        """
        Fill missing parameters with defaults or reasonable estimates
        
        Args:
            parameters: dict with extracted parameters
            defaults: dict with default values (optional)
        
        Returns:
            dict with filled parameters
        """
        if defaults is None:
            defaults = {
                'temperature': 25.0,  # Average temperature
                'humidity': 65.0,     # Average humidity
                'moisture': 50.0,     # Average moisture
                'soil_type': 'Loamy'  # Most common
            }
        
        filled = parameters.copy()
        
        for key, default_value in defaults.items():
            if filled.get(key) is None:
                filled[key] = default_value
                filled[f'{key}_estimated'] = True
        
        return filled


# Global instance
_ocr_engine = None

def get_ocr_engine():
    """Get or create global OCR engine instance"""
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = SoilReportOCR()
    return _ocr_engine
