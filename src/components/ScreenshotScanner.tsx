import React, { useState, useRef } from "react";
import { Image, Upload, Trash2, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle, Search, FileText } from "lucide-react";
import { ScreenshotResult } from "../types";

export default function ScreenshotScanner() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    setImageFile(file);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Extract raw base64 string without meta prefix
        const base64Data = reader.result.split(",")[1];
        setBase64Image(base64Data);
      }
    };
    reader.onerror = () => {
      setError("Failed to convert image to base64 binary");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setImageFile(null);
    setBase64Image(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = async () => {
    if (!base64Image || !imageFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType: imageFile.type,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to scan screenshot");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while analyzing the image.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return { bg: "bg-emerald-505/10", text: "text-emerald-400", border: "border-emerald-500/20", fill: "bg-emerald-500" };
    if (score < 70) return { bg: "bg-amber-505/10", text: "text-amber-400", border: "border-amber-500/20", fill: "bg-amber-500" };
    return { bg: "bg-rose-505/10", text: "text-rose-450", border: "border-rose-500/20", fill: "bg-rose-500" };
  };

  // Demo images base64 (placeholders or presets if available - we can describe instructions)
  const triggers = [
    {
      title: "How to capture screenshots:",
      desc: "Take a screenshot of an SMS thread, WhatsApp conversation, suspicious fake banking transaction slip, or spam email layout on your phone and upload it directly. The analyzer will perform OCR text reading and scan visual elements for scam indicators."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-white tracking-tight flex items-center gap-2">
          <Image className="w-5 h-5 text-purple-400" />
          Screenshot Scam Visual Inspector
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Upload a screenshot of potentially malicious text chat threads, fake bank transaction notifications, deceptive alerts, or suspicious emails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-5 backdrop-blur-md">
            <h3 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-semibold">Screenshot Upload</h3>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] ${
                isDragOver ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-purple-500 hover:bg-white/[0.02]"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {base64Image ? (
                <div className="space-y-4 w-full" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={`data:${imageFile?.type};base64,${base64Image}`}
                    alt="Preview of uploaded screenshot"
                    referrerPolicy="no-referrer"
                    className="max-h-[160px] mx-auto rounded border border-white/10 shadow-lg object-contain"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-medium text-slate-300 truncate max-w-[180px]">
                      {imageFile?.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="Remove image file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-350">Drag & Drop Image Here</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    or click to pick from folders (PNG, JPG, JPEG, WEBP)
                  </p>
                </>
              )}
            </div>

            {/* Inspect / Scan Trigger Button */}
            {base64Image && (
              <button
                type="button"
                onClick={handleScan}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-650 text-white rounded-lg font-mono uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-md shadow-purple-900/10 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Layout & Text...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Scan Selected Screenshot
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-2">
            <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              Screenshot Scanning Guide
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {triggers[0].desc}
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6">
          {error && (
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 text-rose-300 text-sm flex gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="mt-1 text-xs opacity-90">{error}</p>
                <p className="text-xs text-rose-400 mt-2 font-medium">Please review if the server is active on port 3000.</p>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-10 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
              <Image className="w-10 h-10 text-slate-700 mb-3" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Awaiting Screenshot</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Upload a suspicious mobile screenshot, transaction slip image, or email graphic, then click Scan to perform visual OCR analysis.
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[350px] shadow-sm">
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-purple-900/30 border-t-purple-500 animate-spin" />
                <Image className="w-5 h-5 text-purple-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 animate-pulse">Analyzing Visual Cues</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                Transcribing layout elements with Gemini OCR...
              </p>
            </div>
          )}

          {result && (
            <div className="bg-[#0b0c10]/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-5 p-5 backdrop-blur-md">
              {/* Risk Banner */}
              <div className={`p-4 rounded-xl border ${getRiskColor(result.risk_score).bg} ${getRiskColor(result.risk_score).border} ${getRiskColor(result.risk_score).text} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {result.risk_score >= 70 ? (
                    <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
                  ) : result.risk_score >= 30 ? (
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-wider opacity-60">Visual Verdict</h4>
                    <p className="text-base font-semibold mt-0.5">{result.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase opacity-60 block">Risk rating</span>
                  <span className="text-2xl font-black">{result.risk_score}%</span>
                </div>
              </div>

              {/* Score bar */}
              <div className="space-y-1">
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${getRiskColor(result.risk_score).fill}`}
                    style={{ width: `${result.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="bg-purple-950/25 border border-purple-500/25 rounded-xl p-4">
                <h4 className="text-[10px] font-mono text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Immediate Recommendation:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {result.recommendation}
                </p>
              </div>

              {/* OCR transcription panel */}
              <div className="bg-black/30 border border-white/5 rounded-lg p-3.5 space-y-2">
                <h4 className="text-[9px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Extracted Screen Text (OCR transcript)
                </h4>
                <div className="bg-black/40 p-2.5 rounded border border-white/5 max-h-[120px] overflow-y-auto font-mono text-[11px] text-slate-300 leading-normal white-space-pre-wrap">
                  {result.extractedText || "[No legible text detected inside screenshot picture]"}
                </div>
              </div>

              {/* Visual Analysis detail */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Visual Tells & Context Analysis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {result.safetyInfo}
                </p>
              </div>

              {/* Explanations list */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Specific Visual Flags
                </h4>
                <ul className="space-y-1.5">
                  {result.reasons.map((re, index) => (
                    <li key={index} className="text-xs text-slate-300 flex gap-2">
                      <span className="text-purple-400 shrink-0 mt-1">•</span>
                      <span className="leading-relaxed">{re}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
