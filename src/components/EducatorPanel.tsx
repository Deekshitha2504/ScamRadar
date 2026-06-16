import React from "react";
import { BookOpen, Award, CheckCircle, AlertOctagon, Cpu } from "lucide-react";

export default function EducatorPanel() {
  const commonScams = [
    {
      title: "Bank Account Suspension",
      hook: "Create sudden urgency regarding money",
      advise: "Never click links from SMS to log into your account. Call your official bank number directly.",
      indicator: "Generic greetings, high urgency elements, non-official secure domains."
    },
    {
      title: "Stuck Delivery parcels (USPS/DHL)",
      hook: "Request a minute fee for address amendment",
      advise: "Check package track codes directly on the official postal carriers' index page. Avoid unexpected re-delivery fee prompts.",
      indicator: "Obscured redirect links, non-standard country top level domains, typo-squatting URL strings."
    },
    {
      title: "Fake Job / Commision Tasks",
      hook: "Offer easy, high-commission rewards",
      advise: "If it's too good to be true, it is. Official companies never contact you on WhatsApp/Telegram out of nowhere to pay cash for hitting likes.",
      indicator: "Unsolicited, high-paying task platforms, lack of physical corporate headquarters."
    },
    {
      title: "Threats & Blackmail Extortion",
      hook: "Claim hacker compromised webcams",
      advise: "These are mass-email bluffs using old leaked passwords. Do not reply, do not pay. Run standard antivirus checks and reset compromised passkeys.",
      indicator: "Hostile threats, Bitcoin transfer demands, lack of personal visual proofs."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-light text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Anti-Scam Handbook & Guidelines
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Browse security guidelines and learn to identify common scam vectors, warning indicators, and safety measures.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonScams.map((scam, i) => (
            <div key={i} className="bg-white/[0.01] border border-white/5 p-5 rounded-xl hover:bg-white/[0.03] transition duration-200 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{scam.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">Common hook: {scam.hook}</p>
                </div>
              </div>

              <div className="text-xs bg-black/30 p-2.5 rounded border border-white/5 space-y-1 text-slate-400">
                <p className="font-semibold text-slate-300">Visual Tell-tales:</p>
                <p>{scam.indicator}</p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg text-xs flex gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300 font-medium">
                  <strong className="text-emerald-400 font-semibold font-mono text-[10.5px] uppercase mr-1">Safety Tip:</strong>
                  {scam.advise}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-purple-950/15 border border-purple-500/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 select-none">
            <h4 className="text-sm font-light text-purple-300 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400 animate-bounce" />
              Empowering Security & Cyber Defense Teams
            </h4>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              ScamRadar utilizes state-of-the-art server-side Gemini models to detect cyber phishing threats, keeping sensitive transaction assets secure from digital actors.
            </p>
          </div>
          <div className="bg-black/30 px-4 py-2 rounded-lg border border-white/10 shrink-0 self-start md:self-auto text-xs text-purple-400 font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Cpu className="w-4 h-4" />
            Powered by @google/genai
          </div>
        </div>
      </div>
    </div>
  );
}
