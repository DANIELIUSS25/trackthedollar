"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Link, Camera, X, Check } from "lucide-react";

interface SharePopoverProps {
  /** Element to screenshot — defaults to document.body if omitted */
  screenshotTarget?: string; // CSS selector
}

export function SharePopover({ screenshotTarget }: SharePopoverProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [url, setUrl] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(window.location.href);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const downloadScreenshot = useCallback(async () => {
    setCapturing(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const target = screenshotTarget
        ? (document.querySelector(screenshotTarget) as HTMLElement)
        : document.body;
      if (!target) return;

      const canvas = await html2canvas(target, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        logging: false,
        ignoreElements: (el) =>
          el.getAttribute("aria-label") === "Share" ||
          el.classList.contains("share-popover-ignore"),
      });

      const link = document.createElement("a");
      link.download = `trackthedollar-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Screenshot failed", e);
    } finally {
      setCapturing(false);
    }
  }, [screenshotTarget]);

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: "TrackTheDollar — U.S. National Debt Live Tracker",
        text: "Track the U.S. national debt, Federal Reserve data, and key economic indicators in real time.",
        url,
      });
    } catch {}
  }, [url]);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="relative share-popover-ignore" ref={popoverRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Share"
        title="Share"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-white/10 bg-[#111] shadow-2xl p-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white">Share</span>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/80">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4 p-3 bg-white rounded-lg">
            <QRCodeSVG
              value={url}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>

          {/* URL preview */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[11px] text-white/50 truncate flex-1">{url}</span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm font-medium text-white"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Link className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>

            <button
              onClick={downloadScreenshot}
              disabled={capturing}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm font-medium text-white disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {capturing ? "Capturing…" : "Screenshot"}
            </button>

            {canNativeShare && (
              <button
                onClick={nativeShare}
                className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 transition-colors text-sm font-medium text-white"
              >
                <Share2 className="h-4 w-4" />
                Share via…
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-[10px] text-white/25">
            Scan QR to open on any device
          </p>
        </div>
      )}
    </div>
  );
}
