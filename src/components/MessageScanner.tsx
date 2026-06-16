import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, Search, HelpCircle, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { MessageResult } from "../types";

export default function MessageScanner() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MessageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze message");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while analyzing the text.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", fill: "bg-emerald-500" };
    if (score < 70) return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", fill: "bg-amber-500" };
    return { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", fill: "bg-rose-500" };
  };

  const sampleMessages = [
    {
      label: "Netflix Expired Alert (Scam)",
      text: "NETFLIX: Your subscription payment has failed. To avoid immediately losing service, verify your details here: https://verify-netflix-users.cc/login"
    },
    {
      label: "USPS Stuck Package (Scam)",
      text: "USPS Notice: Your package could not be delivered due to an incomplete street address. Please update your shipment details within 12 hours: https://usps-redeliverytracker.info/ship"
    },
    {
      label: "Standard Friendly Texts (Safe)",
      text: "Hey! Just checking if we are still on for lunch at 1 PM today? Let me know if you want me to pick you up on the way."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          Message Scam Analyzer
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Paste suspicious text alerts, SMS, phishing emails, or direct messages to evaluate fraud hazard and deceptive indicators instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleScan} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4 backdrop-blur-md">
            <div>
              <label htmlFor="message-text" className="block text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2 font-semibold">
                Suspicious Message Body
              </label>
              <textarea
                id="message-text"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the message content exactly as received (including any link URLs)..."
                className="w-full rounded-lg bg-black/30 border border-white/10 p-3 h-40 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] font-mono text-slate-500">
                AI scans for urgency, grammatical errors, and credential hooks.
              </span>
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-650 text-white rounded-lg font-mono uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-md shadow-purple-900/10 active:scale-[0.98]"
                id="analyse-msg-btn"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Patterns...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Scan Message
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Sandbox templates */}
          <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
            <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2.5">
              Sandbox Test Templates
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {sampleMessages.map((samp, i) => (
                <button
                  key={i}
                  onClick={() => setText(samp.text)}
                  className="text-left text-xs bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-slate-300 p-2.5 rounded-lg transition flex items-center justify-between group"
                >
                  <span className="truncate max-w-[85%]">{samp.label}</span>
                  <span className="text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11.5px] font-mono shrink-0">
                    LOAD <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5">
          {error && (
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 text-rose-300 text-sm flex gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="mt-1 text-xs opacity-90">{error}</p>
                <p className="text-xs text-rose-400 mt-2 font-medium">Please verify your secrets panel or network settings.</p>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <HelpCircle className="w-10 h-10 text-slate-700 mb-3" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Awaiting Input</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Input suspicious text content or select any test sample template to populate our deep scam analysis engine.
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px] shadow-sm">
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-purple-900/30 border-t-purple-500 animate-spin" />
                <ShieldCheck className="w-5 h-5 text-purple-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Pattern Classification</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1 animate-pulse">
                Consulting server-side Gemini intelligence to check message threat level...
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
                    <h4 className="text-[10px] font-mono uppercase tracking-wider opacity-60">Scam Categorization</h4>
                    <p className="text-base font-semibold mt-0.5">{result.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono opacity-60 uppercase block">Risk Score</span>
                  <span className="text-2xl font-black">{result.risk_score}%</span>
                </div>
              </div>

              {/* Score bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Safe</span>
                  <span>Threat Level</span>
                  <span>Severe</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${getRiskColor(result.risk_score).fill}`}
                    style={{ width: `${result.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Key Indicators */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  Pattern Evaluation
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {result.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2.5 rounded-lg border flex items-center justify-between ${
                        ind.detected
                          ? "bg-rose-500/5 text-rose-300 border-rose-500/10"
                          : "bg-white/[0.01] text-slate-400 border-white/5"
                      }`}
                    >
                      <span className="font-medium text-slate-300">{ind.label}</span>
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                        ind.detected ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-white/5 text-slate-500"
                      }`}>
                        {ind.detected ? "Detected" : "Clean"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="bg-purple-950/25 border border-purple-500/25 rounded-xl p-4">
                <h4 className="text-[10px] font-mono text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Recommended Action:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.recommendation}
                </p>
              </div>

              {/* Explanations list */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Detailed Findings
                </h4>
                <ul className="space-y-2">
                  {result.reasons.map((re, index) => (
                    <li key={index} className="text-xs text-slate-300 flex gap-2">
                      <span className="text-purple-400 shrink-0 mt-1">•</span>
                      <span className="leading-relaxed">{re}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extracted Links */}
              {result.extractedUrls && result.extractedUrls.length > 0 && (
                <div className="bg-black/30 border border-white/5 p-3 rounded-lg space-y-2">
                  <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Captured Links ({result.extractedUrls.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {result.extractedUrls.map((link, ind) => (
                      <span
                        key={ind}
                        className="text-[11px] bg-purple-500/5 text-purple-300 border border-purple-500/15 px-2 py-0.5 rounded font-mono truncate max-w-full"
                        title={link}
                      >
                        {link}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
