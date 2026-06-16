import re
from typing import TypedDict, List

# Define response schema matching requirements
class ScanResult(TypedDict):
    risk_score: int
    category: str
    reasons: List[str]

# 2. Configurable scam keyword list and friendly reason mapping
SCAM_KEYWORDS_MAPPING = {
    "urgent": "Urgency phrasing ('urgent') detected",
    "verify account": "Security verification phishing lure detected",
    "bank account": "Request for sensitive bank account information",
    "otp": "One-Time Password (OTP) request detected (potential account hijacking)",
    "click here": "Call-to-action link ('click here') found",
    "winner": "Lottery/Winner notification lure found",
    "lottery": "Unsolicited lottery payout phrase detected",
    "claim prize": "Prize/reward claim urge detected",
    "free money": "unrealistic financial lure ('free money') detected",
    "limited offer": "Artificial scarcity warning ('limited offer') detected",
    "gift card": "Gift card request or payout lure detected",
    "account suspended": "Intimidation threat ('account suspended') detected"
}

SCAM_KEYWORDS = list(SCAM_KEYWORDS_MAPPING.keys())

# 3. Urgency detection phrases and reason mapping
URGENCY_PHRASES_MAPPING = {
    "act now": "Action coercion phrase ('act now') detected",
    "immediately": "Immediate response urge ('immediately') detected",
    "urgent": "Urgent attention request detected",
    "within 24 hours": "High pressure deadline ('within 24 hours') set",
    "expires today": "Extreme time limit ('expires today') set"
}

URGENT_PHRASES = list(URGENCY_PHRASES_MAPPING.keys())

# 4. Financial scam indicators and reason mapping
FINANCIAL_WORDS_MAPPING = {
    "payment": "Financial demand or transaction reference ('payment')",
    "transfer": "Request for transfer of money or credit card assets ('transfer')",
    "upi": "Deceptive Unified Payments Interface (UPI) transaction request",
    "bank": "Branded financial institution wording ('bank') detected",
    "credit card": "Request for secure credit card credentials",
    "debit card": "Request for secure debit card credentials",
    "wallet": "Request related to third-party digital wallets"
}

FINANCIAL_WORDS = list(FINANCIAL_WORDS_MAPPING.keys())

# URL Shortener domains list for detection
SHORTENER_DOMAINS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "rebrand.ly", "is.gd", "ow.ly", "buff.ly", "tiny.cc"
]

# Suspicious top level domains
SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".click", ".win"
]

def analyze_message(text: str) -> ScanResult:
    """
    Analyzes the input text message to assess fraud and scam risks.
    Tally points based on keyword frequency, high-pressure urgency strings,
    financial keywords and extracted web links (IP/Short/Suspicious TLD).
    Capped at 100.
    """
    if not text or not isinstance(text, str) or text.strip() == "":
        return {
            "risk_score": 0,
            "category": "Safe",
            "reasons": ["Empty message provided"]
        }

    score = 0
    reasons: List[str] = []
    text_lower = text.lower()

    # --- 2. Keyword Detection (+15 each) ---
    detected_keywords = []
    for kw in SCAM_KEYWORDS:
        if kw in text_lower:
            detected_keywords.append(kw)
            score += 15
            reasons.append(SCAM_KEYWORDS_MAPPING[kw])

    # --- 3. Urgency Detection (+20 each) ---
    detected_urgency = []
    for phrase in URGENT_PHRASES:
        if phrase in text_lower:
            detected_urgency.append(phrase)
            score += 20
            reasons.append(URGENCY_PHRASES_MAPPING[phrase])

    # --- 4. Financial Scam Detection (+25 each) ---
    detected_financial = []
    for f_word in FINANCIAL_WORDS:
        if f_word in text_lower:
            detected_financial.append(f_word)
            score += 25
            reasons.append(FINANCIAL_WORDS_MAPPING[f_word])

    # --- 5. URL Extraction & Analysis ---
    # Find anything that resembles a domain or URL format
    url_pattern = r'(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?::\d+)?(?:/[^\s]*)?)'
    urlsFound = re.findall(url_pattern, text)

    if urlsFound:
        # Add basic URL found penalty (+15)
        score += 15
        reasons.append("External web link or URL address detected in message")
        
        has_ip_url = False
        has_suspicious_tld = False
        has_shortener = False

        for url in urlsFound:
            url_lower = url.lower()
            
            # Detect IP addresses (e.g. 192.168.1.1 or 8.8.8.8)
            ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
            if re.search(ip_pattern, url):
                has_ip_url = True
            
            # Detect suspicious TLDs
            for tld in SUSPICIOUS_TLDS:
                if tld in url_lower:
                    has_suspicious_tld = True
            
            # Detect shortened URLs
            for shortener in SHORTENER_DOMAINS:
                if shortener in url_lower:
                    has_shortener = True

        if has_ip_url:
            score += 30
            reasons.append("Direct IP-address host link found (dangerous bypass)")
        
        if has_suspicious_tld:
            score += 25
            reasons.append("Suspicious Top-Level Domain (TLD) extension (.xyz, .top, .click, .win) detected")
            
        if has_shortener:
            score += 15
            reasons.append("Shortened link redirect detected (hides ultimate destination)")

    # --- 6. Risk Scoring & Cap ---
    # Crop at 100 Max
    risk_score = min(score, 100)

    # --- 7. Scam Categories ---
    if risk_score <= 30:
        category = "Safe"
    elif risk_score <= 60:
        category = "Suspicious"
    else:
        category = "High Risk Scam"

    # Make reasons unique to avoid repetitive labels
    unique_reasons = list(dict.fromkeys(reasons))
    
    # If safe but has no reasons, clarify status
    if not unique_reasons:
        unique_reasons = ["No malicious patterns or scam signatures discovered in body text"]

    return {
        "risk_score": risk_score,
        "category": category,
        "reasons": unique_reasons
    }
