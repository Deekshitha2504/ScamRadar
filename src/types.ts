export interface ScanIndicator {
  key: string;
  label: string;
  detected: boolean;
}

export interface MessageResult {
  risk_score: number;
  category: string;
  reasons: string[];
  indicators: ScanIndicator[];
  recommendation: string;
  extractedUrls: string[];
}

export interface UrlResult {
  risk_score: number;
  category: string;
  reasons: string[];
  indicators: ScanIndicator[];
  safetyInfo: string;
  recommendation: string;
}

export interface ScreenshotResult {
  extractedText: string;
  risk_score: number;
  category: string;
  reasons: string[];
  safetyInfo: string;
  recommendation: string;
}
