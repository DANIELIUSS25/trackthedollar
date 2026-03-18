"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

const PRESET_QUESTIONS = [
  "How does today's national debt affect homeowners?",
  "How does this affect everyday taxpayers?",
  "What does rising inflation mean for retirees?",
  "How does the Fed rate affect small business owners?",
  "What's the biggest fiscal risk facing Americans right now?",
  "How does a weak dollar affect consumers at the grocery store?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export function TDAgentWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current && messages.length > 0) {
      inputRef.current.focus();
    }
  }, [open, messages.length]);

  async function ask(question: string) {
    if (loading || limitReached || !question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === "limit_reached") {
        setLimitReached(true);
        setRemaining(0);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "You've used all 5 free questions for today. Upgrade to Pro for unlimited access.",
        }]);
        return;
      }

      if (data.error) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.message ?? "TD Intelligence couldn't generate a response. Try again.",
        }]);
        return;
      }

      setRemaining(data.remainingQuestions ?? 0);
      if (data.upgradePrompt) setLimitReached(true);

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="flex w-[360px] flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden max-h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">TD Intelligence</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wide">Beta</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages / Presets */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Ask how today's U.S. fiscal data affects you:</p>
                {PRESET_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    disabled={loading || limitReached}
                    className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-left text-xs text-foreground hover:border-primary/40 hover:bg-surface-2 transition-colors disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-surface-1 text-foreground border border-border"
                  )}>
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-1">
                      {msg.sources.map((s) => (
                        <span key={s} className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-start">
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-1 px-3 py-2">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Analyzing live data…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Upgrade banner */}
          {limitReached && (
            <div className="border-t border-primary/20 bg-primary/5 px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Upgrade for unlimited questions</span>
              <Link
                href="/upgrade"
                className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Go Pro <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Input */}
          {!limitReached && (
            <div className="border-t border-border px-3 py-2 flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask(input)}
                placeholder="Ask a question…"
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
              />
              <button
                onClick={() => ask(input)}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border bg-surface-1 px-4 py-1.5 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Grounded in live U.S. government data
            </span>
            {!limitReached && (
              <span className="text-[10px] text-muted-foreground">
                {remaining}/{5} free questions
              </span>
            )}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium shadow-lg transition-all",
          open
            ? "bg-card text-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
        )}
      >
        <Sparkles className="h-4 w-4" />
        {open ? "Close" : "Ask TD Intelligence"}
      </button>
    </div>
  );
}
