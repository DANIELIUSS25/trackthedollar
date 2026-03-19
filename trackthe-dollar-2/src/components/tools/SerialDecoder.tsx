"use client";

import { useState } from "react";
import {
  Search,
  Star,
  Fingerprint,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { decodeSerial, FED_DISTRICTS } from "@/lib/tools/serial-decoder";
import type { DecodeResult, FancyType } from "@/lib/tools/serial-decoder";

const DISTRICT_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

const DENOMINATIONS = ["$1", "$2", "$5", "$10", "$20", "$50", "$100"] as const;

function getRarityBadgeClass(rarity: FancyType["rarity"]): string {
  switch (rarity) {
    case "Uncommon":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Scarce":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Rare":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "Very Rare":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Extremely Rare":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    default:
      return "bg-white/10 text-white/50 border-white/10";
  }
}

function getRarityBarColor(score: number): string {
  if (score <= 2) return "bg-white/30";
  if (score <= 4) return "bg-green-400";
  if (score <= 6) return "bg-yellow-400";
  if (score <= 8) return "bg-orange-400";
  return "bg-red-400";
}

export function SerialDecoder() {
  const [serial, setSerial] = useState("");
  const [denomination, setDenomination] = useState("$1");
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [hasDecoded, setHasDecoded] = useState(false);

  function handleDecode() {
    if (!serial.trim()) return;
    const r = decodeSerial(serial.trim(), denomination);
    setResult(r);
    setHasDecoded(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleDecode();
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Input Form */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#111] space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Fingerprint className="h-4 w-4 text-green-400" />
          <span className="text-sm font-semibold text-white">Serial Number Decoder</span>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="serial-input" className="block text-xs text-white/50 mb-1.5">
              Serial Number
            </label>
            <input
              id="serial-input"
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. B12345678A or B12345678★"
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 font-mono transition-colors"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="denomination-select" className="block text-xs text-white/50 mb-1.5">
              Denomination
            </label>
            <select
              id="denomination-select"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-colors appearance-none cursor-pointer"
            >
              {DENOMINATIONS.map((d) => (
                <option key={d} value={d} className="bg-[#0a0a0c]">
                  {d} Bill
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDecode}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:bg-green-600 text-black font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <Search className="h-4 w-4" />
            Decode Serial Number
          </button>

          <p className="text-xs text-white/30 text-center">
            Enter the serial number from any U.S. Federal Reserve Note
          </p>
        </div>
      </div>

      {/* Results */}
      {hasDecoded && result && (
        <div className="space-y-3">
          {/* Error state */}
          {!result.valid && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{result.error}</p>
            </div>
          )}

          {/* Valid result cards */}
          {result.valid && result.district && result.districtLetter && (
            <>
              {/* Federal Reserve Bank Card */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#111]">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-semibold text-white">Federal Reserve Bank</span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-400">{result.districtLetter}</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      Federal Reserve Bank of {result.district.city}
                    </p>
                    <p className="text-sm text-white/50">
                      District {result.district.district} &middot; {result.district.state} &middot; Est. {result.district.established}
                    </p>
                  </div>
                </div>

                {/* District letter pills */}
                <div className="flex flex-wrap gap-1.5">
                  {DISTRICT_LETTERS.map((letter) => {
                    const isActive = letter === result.districtLetter;
                    const d = FED_DISTRICTS[letter];
                    return (
                      <div
                        key={letter}
                        title={d ? `${letter} — ${d.city}` : letter}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border transition-colors ${
                          isActive
                            ? "bg-green-500/20 border-green-500/40 text-green-400"
                            : "bg-white/5 border-white/10 text-white/30"
                        }`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Star Note Card */}
              <div className={`p-5 rounded-xl border ${result.isStar ? "border-yellow-500/20 bg-yellow-500/5" : "border-white/10 bg-[#111]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${result.isStar ? "text-yellow-400 fill-yellow-400/30" : "text-white/30"}`} />
                    <span className="text-sm font-semibold text-white">Star Note</span>
                  </div>
                  {result.isStar ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
                      ★ Star Note Detected
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/40">
                      Not a Star Note
                    </span>
                  )}
                </div>

                {result.isStar && (
                  <p className="mt-3 text-sm text-white/60 leading-relaxed">
                    This is a <strong className="text-yellow-400">replacement note</strong>. Star notes are printed by the Bureau of Engraving and Printing when a regular bill is damaged during production. They carry a ★ instead of the final letter — and are significantly rarer than standard notes, making them prized by collectors.
                  </p>
                )}
                {!result.isStar && (
                  <p className="mt-2 text-xs text-white/30">
                    No ★ symbol detected. This is a standard Federal Reserve Note.
                  </p>
                )}
              </div>

              {/* Fancy Serial Card */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#111]">
                <div className="flex items-center gap-2 mb-4">
                  <Fingerprint className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-semibold text-white">Fancy Serial Analysis</span>
                </div>

                {result.fancyTypes && result.fancyTypes.length > 0 ? (
                  <div className="space-y-3">
                    {result.fancyTypes.map((fancy, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-white">{fancy.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getRarityBadgeClass(fancy.rarity)}`}>
                              {fancy.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed">{fancy.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                    <Info className="h-4 w-4 text-white/30 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white/60">Standard Serial</p>
                      <p className="text-xs text-white/30">No special patterns detected.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rarity Meter */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#111]">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-semibold text-white">Collector Rarity Score</span>
                </div>

                <div className="flex items-end justify-between gap-2 mb-2">
                  <span className="text-3xl font-bold text-white tabular-nums">{result.overallRarity}<span className="text-lg text-white/30">/10</span></span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${
                    (result.overallRarity ?? 1) <= 2
                      ? "bg-white/5 border-white/10 text-white/40"
                      : (result.overallRarity ?? 1) <= 4
                      ? "bg-green-500/15 border-green-500/25 text-green-400"
                      : (result.overallRarity ?? 1) <= 6
                      ? "bg-yellow-500/15 border-yellow-500/25 text-yellow-400"
                      : (result.overallRarity ?? 1) <= 8
                      ? "bg-orange-500/15 border-orange-500/25 text-orange-400"
                      : "bg-red-500/15 border-red-500/25 text-red-400"
                  }`}>
                    {result.rarityLabel}
                  </span>
                </div>

                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getRarityBarColor(result.overallRarity ?? 1)}`}
                    style={{ width: `${((result.overallRarity ?? 1) / 10) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/20 mt-1.5">
                  <span>Common</span>
                  <span>Extremely Rare</span>
                </div>
              </div>

              {/* How to Read Card */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#111]">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-4 w-4 text-white/40" />
                  <span className="text-sm font-semibold text-white">Serial Number Breakdown</span>
                </div>

                {/* Visual breakdown */}
                <div className="flex items-stretch gap-1 mb-4 font-mono text-sm justify-center">
                  <div className="flex flex-col items-center">
                    <div className="px-3 py-2 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 font-bold text-lg min-w-[2.5rem] text-center">
                      {result.districtLetter}
                    </div>
                    <span className="text-xs text-white/30 mt-1.5 text-center">District</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-lg">
                      {result.digits}
                    </div>
                    <span className="text-xs text-white/30 mt-1.5 text-center">Serial Digits</span>
                  </div>
                  {result.checkLetter && (
                    <div className="flex flex-col items-center">
                      <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-bold text-lg min-w-[2.5rem] text-center">
                        {result.checkLetter}
                      </div>
                      <span className="text-xs text-white/30 mt-1.5 text-center">Check Letter</span>
                    </div>
                  )}
                  {result.isStar && (
                    <div className="flex flex-col items-center">
                      <div className="px-3 py-2 rounded-lg bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 font-bold text-lg min-w-[2.5rem] text-center">
                        ★
                      </div>
                      <span className="text-xs text-white/30 mt-1.5 text-center">Star Note</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-white/40 leading-relaxed">
                  The first letter identifies the Federal Reserve Bank that issued the note. The 8 digits are the sequential production number. The final letter (or ★) is the check letter indicating the printing block — star notes use ★ as a replacement indicator.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
