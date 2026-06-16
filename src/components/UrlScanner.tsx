import React, { useState } from "react";
import { Link, Search, AlertTriangle, CheckCircle, ShieldAlert, ArrowRight, ShieldCheck, RefreshCw, Globe } from "lucide-react";
import { UrlResult } from "../types";

export default function UrlScanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze link reputation");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while analyzing the link.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", fill: "bg-emerald-500" };
    if (score < 70) return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", fill: "bg-amber-500" };
    return { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", fill: "bg-rose-500" };
  };

  const sampleUrls = [
    { label: "DHL Delivery Alert Phishing", url: "https://dhl-parcel-tracking-redelivery.xyz/tracking/94025" },
    { label: "Fake Chase Bank Verification", url: "https://chase-security-signin.co/login.php" },
    { label: "IP Host Link (Highly Suspicious)", url: "http://192.168.125.43:8080/secure/chase" },
    { label: "Official Google Domain (Safe)", url: "https://support.google.com/accounts/answer/123" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-white tracking-tight flex items-center gap-2">
          <Link className="w-5 h-5 text-purple-400" />
          Phishing & URL Reputation Scan
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Perform a deep analysis of suspicious websites, subdomains, typosquatting domains, shortened redirected tracking links, or unverified IP hosts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleScan} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4 backdrop-blur-md">
            <div>
              <label htmlFor="url-input" className="block text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2 font-semibold">
                External Web Address / URL
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  id="url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://suspicious-domain.xyz/verify-login..."
                  className="w-full rounded-lg bg-black/30 border border-white/10 pl-11 pr-3 py-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] font-mono text-slate-500">
                Instantly audits domain hierarchy, spoofed characters, and generic web hosting.
              </span>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-650 text-white rounded-lg font-mono uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-md shadow-purple-900/10 active:scale-[0.98]"
                id="analyse-url-btn"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning Link...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Inspect URL
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preset templates */}
          <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
            <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2.5">
              URL Reputational Trial Templates
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {sampleUrls.map((samp, i) => (
                <button
                  key={i}
                  onClick={() => setUrl(samp.url)}
                  className="text-left text-xs bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-slate-300 p-2.5 rounded-lg transition flex items-center justify-between group"
                >
                  <div className="flex flex-col text-left gap-0.5 max-w-[80%]">
                    <span className="font-semibold text-slate-300">{samp.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate">{samp.url}</span>
                  </div>
                  <span className="text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0 ml-2 text-[11px] font-mono">
                    INSPECT <ArrowRight className="w-3 h-3" />
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
                <p className="text-xs text-rose-400 mt-2 font-medium">Please review if you have connected the Gemini secret key.</p>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-10 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <Globe className="w-10 h-10 text-slate-700 mb-3" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Awaiting Web Address</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Enter a suspect web address, shortlink, or unverified IP address to evaluate reputation with Gemini scanner.
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px] shadow-sm">
              <div className="relative mb-4 animate-bounce">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Reputational Audit</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1 animate-pulse">
                Auditing Top Level Domain rules and brand copycats...
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
                    <h4 className="text-[10px] font-mono uppercase tracking-wider opacity-60">Reputation Assessment</h4>
                    <p className="text-base font-semibold mt-0.5">{result.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase opacity-60 block">Risk score</span>
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

              {/* URL Domain Info */}
              <div className="bg-black/40 border border-white/5 p-3 rounded-lg space-y-1">
                <h4 className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">
                  Site Profile & Description
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {result.safetyInfo}
                </p>
              </div>

              {/* URL specific indicators */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Danger Warning Checklist
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
                        ind.detected ? "bg-rose-500/10 text-rose-450 border border-rose-500/20" : "bg-white/5 text-slate-500"
                      }`}>
                        {ind.detected ? "Found" : "Passed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="bg-purple-950/25 border border-purple-500/25 rounded-xl p-4">
                <h4 className="text-[10px] font-mono text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Security Verdict:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.recommendation}
                </p>
              </div>

              {/* Explanations list */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Audit Findings
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
