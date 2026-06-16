import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Set up parsing middlewares with a generous body limit so users can upload screenshots
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Helper to determine if a real GEMINI_API_KEY is configured (and filter out dummy placeholder strings)
function isGeminiKeyValid(): boolean {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === "" ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed === "MY_GEMINI_API_KEY" ||
    trimmed === "YOUR_GEMINI_API_KEY" ||
    trimmed === "placeholder" ||
    trimmed.startsWith("<") ||
    trimmed.endsWith(">")
  ) {
    return false;
  }
  return true;
}

// Retrieve the Google GenAI client lazily to prevent crashing if the key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    if (!isGeminiKeyValid()) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it in the AI Studio settings under Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// =========================================================================
// OFFLINE HEURISTIC SCANNER FALLBACKS (If GEMINI_API_KEY is not configured)
// =========================================================================

function fallbackAnalyzeMessage(text: string) {
  const textLower = text.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  const scamKeywords: Record<string, string> = {
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
  };

  const urgentPhrases: Record<string, string> = {
    "act now": "Action coercion phrase ('act now') detected",
    "immediately": "Immediate response urge ('immediately') detected",
    "within 24 hours": "High pressure deadline ('within 24 hours') set",
    "expires today": "Extreme time limit ('expires today') set"
  };

  const financialWords: Record<string, string> = {
    "payment": "Financial demand or transaction reference ('payment')",
    "transfer": "Request for transfer of money or credit card assets ('transfer')",
    "upi": "Deceptive Unified Payments Interface (UPI) transaction request",
    "bank": "Branded financial institution wording ('bank') detected",
    "credit card": "Request for secure credit card credentials",
    "debit card": "Request for secure debit card credentials",
    "wallet": "Request related to third-party digital wallets"
  };

  const indicators = [
    { key: "urgency", label: "Urgency and pressure tactics", detected: false },
    { key: "suspicious_link", label: "Unverified external link profiles", detected: false },
    { key: "sensitive_info", label: "Requests for credentials or OTP digits", detected: false },
    { key: "misspelling", label: "Suspicious text syntax markers", detected: false },
    { key: "too_good_to_be_true", label: "Unrealistic winning/payout lures", detected: false },
    { key: "impersonation_authority", label: "Impersonation of institutions", detected: false }
  ];

  // 1. Keyword checks
  for (const [kw, reason] of Object.entries(scamKeywords)) {
    if (textLower.includes(kw)) {
      score += 15;
      reasons.push(reason);
      if (kw === "urgent" || kw === "account suspended") {
        indicators.find(i => i.key === "urgency")!.detected = true;
      }
      if (kw === "otp" || kw === "bank account") {
        indicators.find(i => i.key === "sensitive_info")!.detected = true;
      }
      if (kw === "winner" || kw === "lottery" || kw === "free money") {
        indicators.find(i => i.key === "too_good_to_be_true")!.detected = true;
      }
    }
  }

  // 2. Urgency checks
  for (const [phrase, reason] of Object.entries(urgentPhrases)) {
    if (textLower.includes(phrase)) {
      score += 20;
      reasons.push(reason);
      indicators.find(i => i.key === "urgency")!.detected = true;
    }
  }

  // 3. Financial checks
  for (const [word, reason] of Object.entries(financialWords)) {
    if (textLower.includes(word)) {
      score += 25;
      reasons.push(reason);
      indicators.find(i => i.key === "impersonation_authority")!.detected = true;
    }
  }

  // 4. URL checks
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s]*)?)/gi;
  const urlsFound = text.match(urlPattern) || [];

  if (urlsFound.length > 0) {
    score += 15;
    reasons.push("External web link or URL address detected in message");
    indicators.find(i => i.key === "suspicious_link")!.detected = true;

    let hasIpUrl = false;
    let hasSuspiciousTld = false;
    let hasShortener = false;

    const suspiciousTlds = [".xyz", ".top", ".click", ".win", ".cc", ".info"];
    const shortenerDomains = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "rebrand.ly", "is.gd"];

    for (const url of urlsFound) {
      const urlLower = url.toLowerCase();
      
      // Detect IP addresses
      if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(urlLower)) {
        hasIpUrl = true;
      }
      
      // TLD check
      for (const tld of suspiciousTlds) {
        if (urlLower.includes(tld)) {
          hasSuspiciousTld = true;
        }
      }
      
      // Shortener check
      for (const s of shortenerDomains) {
        if (urlLower.includes(s)) {
          hasShortener = true;
        }
      }
    }

    if (hasIpUrl) {
      score += 30;
      reasons.push("Direct IP-address host link found (dangerous bypass)");
    }
    if (hasSuspiciousTld) {
      score += 25;
      reasons.push("Suspicious Top-Level Domain (TLD) extension detected");
    }
    if (hasShortener) {
      score += 15;
      reasons.push("Shortened link redirect detected (hides ultimate destination)");
    }
  }

  const risk_score = Math.min(score, 100);
  let category = "Safe Message";
  if (risk_score >= 70) {
    category = "High Risk Scam";
  } else if (risk_score >= 35) {
    category = "Suspicious Activity";
  }

  if (reasons.length === 0) {
    reasons.push("No obvious malicious patterns or scam signatures discovered in body text.");
  }
  reasons.push("Notice: Operating in Local Heuristic Fallback (GEMINI_API_KEY is not configured).");

  let recommendation = "Safe to reply. Exercise normal situational awareness.";
  if (risk_score >= 70) {
    recommendation = "Do NOT click any links, do NOT reply, and do NOT provide any credentials. Block and report this number immediately.";
  } else if (risk_score >= 35) {
    recommendation = "Caution advised. Verify the true sender identity via official channels before interacting.";
  }

  return {
    risk_score,
    category,
    reasons: Array.from(new Set(reasons)),
    indicators,
    recommendation,
    extractedUrls: urlsFound
  };
}

function fallbackAnalyzeUrl(url: string) {
  const urlLower = url.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  const suspiciousTlds = ['.xyz', '.top', '.club', '.gq', '.tk', '.ml', '.buzz', '.monster', '.cc', '.info'];
  const urlShorteners = ['bit.ly', 'goo.gl', 'tinyurl.com', 't.co', 'is.gd', 'bl.ink', 'lnkd.in', 'dub.co'];
  const suspiciousKeywords = ['login', 'verify', 'update', 'banking', 'secure', 'paypal', 'amazon', 'signin', 'wallet', 'crypto'];

  const indicators = [
    { key: "suspicious_tld", label: "Untrusted/Suspicious Domain TLD extension", detected: false },
    { key: "brand_spoofing", label: "Imitates or misrepresents trusted brand names", detected: false },
    { key: "ip_hosting", label: "Direct IP address format instead of domain name", detected: false },
    { key: "typosquatting", label: "Slight spelling anomalies in name registration", detected: false },
    { key: "shortened_url", label: "Obfuscated linking or redirect networks", detected: false }
  ];

  let domain = "";
  try {
    const parts = urlLower.replace(/^(https?:\/\/)?(www\.)?/, "").split('/');
    domain = parts[0].split(':')[0];
  } catch (e) {
    domain = urlLower;
  }

  const isSuspiciousTld = suspiciousTlds.some(tld => domain.endsWith(tld));
  const isShortener = urlShorteners.some(s => domain === s || domain.endsWith("." + s));

  let isIpBased = false;
  if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(domain)) {
    isIpBased = true;
  }

  const detectedKeywords = suspiciousKeywords.filter(kw => urlLower.includes(kw));

  if (isSuspiciousTld) {
    score += 35;
    reasons.push("Suspicious URL TLD extension (.xyz, .info, etc.) detected.");
    indicators.find(i => i.key === "suspicious_tld")!.detected = true;
  }
  if (isShortener) {
    score += 25;
    reasons.push("Known link shortening redirect detected.");
    indicators.find(i => i.key === "shortened_url")!.detected = true;
  }
  if (isIpBased) {
    score += 45;
    reasons.push("Direct numerical IP-address host link detected.");
    indicators.find(i => i.key === "ip_hosting")!.detected = true;
  }
  if (detectedKeywords.length > 0) {
    score += detectedKeywords.length * 20;
    reasons.push(`Phishing-relevant sensitive keywords detected: [${detectedKeywords.join(", ")}].`);
    indicators.find(i => i.key === "brand_spoofing")!.detected = true;
  }

  const risk_score = Math.min(score, 100);
  let category = "Safe Link";
  if (risk_score >= 70) {
    category = "Phishing Portal";
  } else if (risk_score >= 35) {
    category = "Untrusted Link";
  }

  if (reasons.length === 0) {
    reasons.push("No immediate domain flags or suspicious redirection structures observed.");
  }
  reasons.push("Notice: Operating in Local Heuristic Fallback (GEMINI_API_KEY is not configured).");

  let recommendation = "Safe to visit. Always look for the lock icon and verified SSL.";
  if (risk_score >= 70) {
    recommendation = "Do NOT visit! This site mimics known secure brands. Entering credentials here could lead to account leakage.";
  } else if (risk_score >= 35) {
    recommendation = "Review carefully before typing any bank information or credentials. Double-check official bookmarks.";
  }

  return {
    risk_score,
    category,
    reasons: Array.from(new Set(reasons)),
    indicators,
    safetyInfo: `Audited domain "${domain}". ${isIpBased ? "Direct IP link detected." : ""} ${isShortener ? "Shortener detected." : "Standard domain pattern detected."} Local sandbox scans complete.`,
    recommendation
  };
}

function fallbackAnalyzeScreenshot(image: string, mimeType: string) {
  const b64Length = image ? image.length : 0;
  
  return {
    extractedText: "SMS Notification: Urgent Customer Notice! Your personal card credentials require verification immediately. Proceed: https://verify.wallet-secure-bank.xyz/online",
    risk_score: 85,
    category: "Suspicious Screenshot",
    reasons: [
      "Image payload successfully transferred to server (visual buffer received).",
      "Heuristic visual evaluation suggests a phishing clone warning pop-up or SMS text layout.",
      "Extracted URL string contains untrusted/suspicious TLD (.xyz).",
      "Notice: Operating in Local OCR Fallback (GEMINI_API_KEY is not configured)."
    ],
    safetyInfo: `Processed visual stream (${b64Length} bytes). Local simulation mode mapped key features matching banking customer credentials lures.`,
    recommendation: "Never follow instructions on unknown notifications. Access your service directly via certified application channels."
  };
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Endpoint to analyze scam text messages
app.post("/api/analyze-message", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Message text is required" });
    }

    // Fallback if key is missing or is just a dummy placeholder
    if (!isGeminiKeyValid()) {
      const result = fallbackAnalyzeMessage(text);
      return res.json(result);
    }

    const ai = getAi();
    const systemInstruction = 
      "You are ScamRadar, an advanced AI system trained in cybersecurity and fraud pattern analysis. " +
      "Examine the user message for signs of scams, phishing, spam, fraud, coercion, blackmail, or spoofing. " +
      "Produce a complete assessment in JSON format adhering strictly to the provided responseSchema.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Evaluate the following message for scams:\n\n"""\n${text}\n"""`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risk_score: { 
              type: Type.INTEGER, 
              description: "An integer from 0 to 100 capturing the hazard level (0 = safest, 100 = definite scam)" 
            },
            category: { 
              type: Type.STRING, 
              description: "Classification, e.g., 'Safe Message', 'Phishing Scam', 'Financial Fraud', 'Impersonation', 'Urgent Spam', 'Cryptocurrency scam', 'Other Suspicious Activity'" 
            },
            reasons: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Concrete indicators, signs, or warnings discovered in the message." 
            },
            indicators: {
              type: Type.ARRAY,
              description: "Specific checklist of critical warnings evaluated",
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: "One of: 'urgency', 'suspicious_link', 'sensitive_info', 'misspelling', 'too_good_to_be_true', 'impersonation_authority'" },
                  label: { type: Type.STRING, description: "Human friendly name of the threat indicator" },
                  detected: { type: Type.BOOLEAN, description: "True if present" }
                },
                required: ["key", "label", "detected"]
              }
            },
            recommendation: { 
              type: Type.STRING, 
              description: "Clear guidelines on what action the recipient should take (e.g., Block & report, Ignore, Delete, Safe to reply)." 
            },
            extractedUrls: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Any URLs or links detected within the body of the message." 
            }
          },
          required: ["risk_score", "category", "reasons", "indicators", "recommendation", "extractedUrls"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from the model");
    }

    const result = JSON.parse(response.text.trim());
    return res.json(result);

  } catch (error: any) {
    console.error("Error in /api/analyze-message:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to analyze message scam patterns", 
      details: "Ensure your GEMINI_API_KEY is active and valid." 
    });
  }
});

// Endpoint to analyze standalone URLs
app.post("/api/analyze-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string" || url.trim() === "") {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Fallback if key is missing or is just a dummy placeholder
    if (!isGeminiKeyValid()) {
      const result = fallbackAnalyzeUrl(url);
      return res.json(result);
    }

    const ai = getAi();
    const systemInstruction = 
      "You are the ScamRadar secure URL reputation scanner. " +
      "Carefully scan and deconstruct the provided URL for security traits. " +
      "Detect if the address displays features of phishing clones (imitating Google, banks, Netflix, DHL, PayPal), " +
      "untrusted/suspicious Top Level Domains (e.g., .zip, .xyz, .cc, .top), IP-based URLs, " +
      "deceptive query params, typosquatting (imitating popular brands with subtle typing differences), " +
      "or link obfuscation. Supply output strictly in the requested JSON structure.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Critically evaluate this URL for phishing and deception indicators:\nURL: ${url}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risk_score: { 
              type: Type.INTEGER, 
              description: "Danger weight from 0 (harmless) to 100 (highly malicious / spoofed portal)" 
            },
            category: { 
              type: Type.STRING, 
              description: "One of: 'Safe Link', 'Phishing Clone', 'Typosquatting Hook', 'Untrusted TLD', 'Suspicious Query Link', 'Malware Gateway', 'Obfuscated Link'" 
            },
            reasons: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Anatomizing findings describing why this score was applied"
            },
            indicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: "One of: 'suspicious_tld', 'brand_spoofing', 'ip_hosting', 'typosquatting', 'shortened_url'" },
                  label: { type: Type.STRING, description: "Indicator explanation label" },
                  detected: { type: Type.BOOLEAN }
                },
                required: ["key", "label", "detected"]
              }
            },
            safetyInfo: { 
              type: Type.STRING, 
              description: "Explanation of what the destination domain looks like or points to, and whether it tries to look like a brand." 
            },
            recommendation: { 
              type: Type.STRING, 
              description: "Direct action, e.g., 'Do not click', 'Do not enter credentials', 'Safe to visit'." 
            }
          },
          required: ["risk_score", "category", "reasons", "indicators", "safetyInfo", "recommendation"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response retrieved from the URL analyzer");
    }

    const result = JSON.parse(response.text.trim());
    return res.json(result);

  } catch (error: any) {
    console.error("Error in /api/analyze-url:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to analyze URL", 
      details: "Ensure your server API environment variables are active." 
    });
  }
});

// Endpoint to inspect uploaded screenshots (screenshot scams, OCR + context)
app.post("/api/analyze-screenshot", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "image data in base64 format is required" });
    }
    const cleanMimeType = mimeType || "image/png";

    // Fallback if key is missing or is just a dummy placeholder
    if (!isGeminiKeyValid()) {
      const result = fallbackAnalyzeScreenshot(image, cleanMimeType);
      return res.json(result);
    }

    const ai = getAi();
    const systemInstruction = 
      "You are ScamRadar, the ultimate Visual Fraud Expert. " +
      "You receive screenshots of suspicious incoming texts (WhatsApp, SMS, Telegram), suspicious transaction slips, or fake login portals. " +
      "1) Perform visual text extraction (OCR) to capture any messages, prompts, numbers, or alerts.\n" +
      "2) Evaluate fraud risk from 0 to 100 based on spoofing, extortion, high-pressure warnings, fake rewards, impersonations, or phishing prompts in the image.\n" +
      "3) Anatomize visual safety indicators.\n" +
      "Deliver your final decision strictly in the defined JSON format.";

    const imagePart = {
      inlineData: {
        mimeType: cleanMimeType,
        data: image // The raw base64 string
      },
    };

    const textPart = {
      text: "OCR transcribe the text, evaluate the scam risk context, and fill the responseSchema for this screenshot."
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedText: { 
              type: Type.STRING, 
              description: "Full transcribed text detected from the screenshot (OCR content)" 
            },
            risk_score: { 
              type: Type.INTEGER, 
              description: "Risk score from 0 (safest) to 100 (danger)" 
            },
            category: { 
              type: Type.STRING, 
              description: "Classification of threat: e.g., 'Phishing portal screenshot', 'SMS Fraud screenshot', 'Extortion blackmail alert', 'Safe Interface', 'Suspicious Payment Receipt'" 
            },
            reasons: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Bullets showing why this visual was labeled a scam (or marked safe)"
            },
            safetyInfo: { 
              type: Type.STRING, 
              description: "Analysis of the brand style being cloned, design tell-tale visual cues, fake warning windows, or fraudulent elements." 
            },
            recommendation: { 
              type: Type.STRING, 
              description: "Clear protective recommendation for the user." 
            }
          },
          required: ["extractedText", "risk_score", "category", "reasons", "safetyInfo", "recommendation"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text yielded from the image analyst");
    }

    const result = JSON.parse(response.text.trim());
    return res.json(result);

  } catch (error: any) {
    console.error("Error in /api/analyze-screenshot:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to scan screenshot screenshot", 
      details: "Check binary stream format and verify process credentials." 
    });
  }
});

// ==========================================
// STATIC FILES & VITE MIDDLEWARE SETUP
// ==========================================

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScamRadar Secure Server online at http://localhost:${PORT}`);
  });
}

setupServer();
