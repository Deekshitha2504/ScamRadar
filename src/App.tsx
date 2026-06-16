import React, { useState } from "react";
import { Shield, ShieldAlert, Link, Image, BookOpen, Clock, Heart, Users } from "lucide-react";
import MessageScanner from "./components/MessageScanner";
import UrlScanner from "./components/UrlScanner";
import ScreenshotScanner from "./components/ScreenshotScanner";
import EducatorPanel from "./components/EducatorPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState<"message" | "url" | "screenshot" | "educator">("message");

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 flex flex-col font-sans relative overflow-hidden" id="applet-root">
      {/* Absolute immersive backdrop ambient glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Header Navigation Panel */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 shadow-2xl" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
                <Shield className="w-5.5 h-5.5 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-lg font-light tracking-tight text-white flex items-center gap-2">
                  SCAMRADAR
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-6">
              {/* Desktop Tabs */}
              <nav className="hidden lg:flex space-x-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("message")}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === "message"
                      ? "bg-white/10 text-white border border-white/10 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                  id="tab-message"
                >
                  Message Scanner
                </button>
                <button
                  onClick={() => setActiveTab("url")}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === "url"
                      ? "bg-white/10 text-white border border-white/10 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                  id="tab-url"
                >
                  Phishing URLs
                </button>
                <button
                  onClick={() => setActiveTab("screenshot")}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === "screenshot"
                      ? "bg-white/10 text-white border border-white/10 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                  id="tab-screenshot"
                >
                  Screenshot OCR
                </button>
                <button
                  onClick={() => setActiveTab("educator")}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === "educator"
                      ? "bg-white/10 text-white border border-white/10 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                  id="tab-educator"
                >
                  Scam Handbook
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Stage Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" id="main-content">
        
        {/* Welcome Pitch Banner */}
        <div className="bg-gradient-to-br from-purple-900/15 to-blue-900/10 border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden mb-8 backdrop-blur-xl">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-12 -translate-y-6">
            <Shield className="w-80 h-80 fill-white stroke-none" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-[10.5px] font-mono tracking-[0.1em] uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full inline-block">
              Scam Detection Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white leading-tight">
              Detect threats and stay secure.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Safely analyze suspicious messages, phishing URLs, and screenshots in real-time. Protect yourself and others from digital fraud and deception.
            </p>
          </div>
        </div>

        {/* Medium and Mobile quick view tabs */}
        <div className="lg:hidden flex flex-wrap gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl mb-6 font-semibold shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab("message")}
            className={`flex-1 min-w-[120px] text-center py-2.5 px-3 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "message"
                ? "bg-white/10 text-white border border-white/10 shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Messages
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`flex-1 min-w-[120px] text-center py-2.5 px-3 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "url"
                ? "bg-white/10 text-white border border-white/10 shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            URLs
          </button>
          <button
            onClick={() => setActiveTab("screenshot")}
            className={`flex-1 min-w-[120px] text-center py-2.5 px-3 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "screenshot"
                ? "bg-white/10 text-white border border-white/10 shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            Screenshot
          </button>
          <button
            onClick={() => setActiveTab("educator")}
            className={`flex-1 min-w-[120px] text-center py-2.5 px-3 text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "educator"
                ? "bg-white/10 text-white border border-white/10 shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Handbook
          </button>
        </div>

        {/* Component Stage rendering */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl min-h-[400px]">
          {activeTab === "message" && <MessageScanner />}
          {activeTab === "url" && <UrlScanner />}
          {activeTab === "screenshot" && <ScreenshotScanner />}
          {activeTab === "educator" && <EducatorPanel />}
        </div>
      </main>

      {/* Elegant Footer branding */}
      <footer className="bg-black/40 border-t border-white/5 py-6 text-center text-[10px] font-mono uppercase tracking-wider text-slate-500 mt-auto select-none z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1">
            <span>ScamRadar // Powered by Gemini AI</span>
          </p>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline-block">Digital Threat Prevention</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
