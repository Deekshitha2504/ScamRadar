import urllib.parse
import ipaddress
import re
import io
from typing import List
from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import easyocr

from detector import analyze_message

# Initialize FastAPI application (Person 4 & Person 1 Base Setup)
app = FastAPI(
    title="ScamRadar API",
    description="Python FastAPI scam assessment engine serving Message Detection, URL Intelligence, and Screenshot visual OCR.",
    version="1.1.0"
)

# Enable CORS for easier local microservice integration during hackathons (Person 4 Support)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================================
# PERSON 1: Message Detection API Structures
# =========================================================================

class AnalyzeRequest(BaseModel):
    text: str = Field(
        ..., 
        description="The message body text to scan for potential fraudulent patterns.",
        example="Your bank account has been suspended! Proceed immediately to click here: http://192.168.1.55/verify"
    )

class AnalyzeResponse(BaseModel):
    risk_score: int = Field(..., description="Calculated hazard score ranging from 0 (safest) to 100 (highest risk).")
    category: str = Field(..., description="Classification level: 'Safe', 'Suspicious', or 'High Risk Scam'.")
    reasons: list[str] = Field(..., description="Concrete indicators and triggers discovered in text.")

# Root probe endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "ScamRadar Security Scanner Service",
        "team_roles": {
            "Person 1": "Message Scam Analysis & Classification Engine",
            "Person 2": "URL Safety Evaluator & Screenshot Visual OCR OCR Analysis Operator",
            "Person 4": "Infrastructure Deployment & DevOps Orchestrator"
        },
        "docs_url": "/docs"
    }

# Person 1 Message Analysis Endpoint
@app.post(
    "/analyze", 
    response_model=AnalyzeResponse, 
    status_code=status.HTTP_200_OK,
    summary="Scans and analyzes a prospective spam message for malicious signals."
)
def post_analyze(payload: AnalyzeRequest):
    """
    Evaluates submitted text messages for spam keywords, urgency signals,
    financial lures, and suspicious or cloaked hyperlink profiles.
    Returns calculated risk rating, classification group, and a list of indicators.
    """
    text = payload.text
    if text is None:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload format error: 'text' field cannot be null"
        )
         
    # Handle empty or blank text specifically as requested
    if not isinstance(text, str) or text.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message evaluation failed: Text sequence cannot be empty or whitespace only"
        )
        
    try:
        # Run detection engine
        result = analyze_message(text)
        return AnalyzeResponse(
            risk_score=result["risk_score"],
            category=result["category"],
            reasons=result["reasons"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during text classification: {str(e)}"
        )


# =========================================================================
# PERSON 2: URL Scanner & OCR Specialist Router & Implementations
# =========================================================================

router = APIRouter()

# Lazy initialisation of EasyOCR reader to optimize cold starts and reduce RAM footprint
# We create a helper function or cache the reader
_reader = None

def get_ocr_reader():
    global _reader
    if _reader is None:
        # Initialize EasyOCR Reader for English text extraction
        _reader = easyocr.Reader(['en'])
    return _reader

# Threat Intelligence Configurations
SUSPICIOUS_TLDS = {'.xyz', '.top', '.club', '.gq', '.tk', '.ml', '.buzz', '.monster', '.cc', '.info'}
URL_SHORTENERS = {'bit.ly', 'goo.gl', 'tinyurl.com', 't.co', 'is.gd', 'bl.ink', 'lnkd.in', 'dub.co'}
SUSPICIOUS_KEYWORDS = {'login', 'verify', 'update', 'banking', 'secure', 'paypal', 'amazon', 'signin', 'wallet', 'crypto'}

class URLRequest(BaseModel):
    url: str

def analyze_url_string(url: str):
    try:
        parsed_url = urllib.parse.urlparse(url)
        domain = parsed_url.netloc or parsed_url.path.split('/')[0]
    except Exception:
        domain = ""

    clean_domain = domain.replace('www.', '').split(':')[0]
    
    is_suspicious_tld = any(clean_domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
    is_shortener = clean_domain in URL_SHORTENERS
    
    is_ip_based = False
    try:
        ipaddress.ip_address(clean_domain)
        is_ip_based = True
    except ValueError:
        pass

    detected_keywords = [word for word in SUSPICIOUS_KEYWORDS if word in url.lower()]
    
    return {
        "domain": domain,
        "suspicious_tld": is_suspicious_tld,
        "url_shortener": is_shortener,
        "ip_based_url": is_ip_based,
        "detected_keywords": detected_keywords
    }

@router.post("/analyze-url")
async def analyze_url(request: URLRequest):
    metrics = analyze_url_string(request.url)
    
    # Risk Scoring Algorithm
    score = 0
    if metrics["suspicious_tld"]: score += 35
    if metrics["url_shortener"]: score += 25
    if metrics["ip_based_url"]: score += 45
    score += len(metrics["detected_keywords"]) * 20
    
    return {
        "url": request.url,
        "risk_score": min(score, 100),
        "verdict": "High Risk" if score >= 40 else "Safe",
        "indicators": metrics
    }

@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    try:
        image_bytes = await file.read()
        
        # Validate that the file is indeed a parseable image
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.verify()  # Verify that the image stream is intact and valid
        except Exception:
            raise HTTPException(status_code=400, detail="Corrupted or unreadable image file uploaded.")
            
        # Perform OCR
        reader = get_ocr_reader()
        ocr_results = reader.readtext(image_bytes, detail=0)
        extracted_text = " ".join(ocr_results)
        
        found_keywords = [word for word in SUSPICIOUS_KEYWORDS if word in extracted_text.lower()]
        urls_found = re.findall(r'(https?://[^\s]+)', extracted_text)
        is_suspicious = len(found_keywords) > 0 or len(urls_found) > 0

        return {
            "filename": file.filename,
            "extracted_text": extracted_text,
            "analysis": {
                "detected_keywords": found_keywords,
                "found_urls": urls_found,
            },
            "verdict": "Suspicious Screenshot" if is_suspicious else "Clean Screenshot"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR engine failure: {str(e)}")

# Mount Router to Application Path
app.include_router(router)
