"use client";

import { useEffect, useRef, useState } from "react";

const usdFull = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface LiveDebtCounterProps {
  /** Total debt in millions of dollars (as returned by Treasury API) */
  totalDebtMillions: number;
  /** Daily change in millions of dollars */
  dailyChangeMillions: number;
  /** ISO date string of the last data point (e.g. "2026-03-15") */
  lastDate: string;
  className?: string;
}

export function LiveDebtCounter({
  totalDebtMillions,
  dailyChangeMillions,
  lastDate,
  className = "",
}: LiveDebtCounterProps) {
  const baseUSD = totalDebtMillions * 1_000_000;
  const perSecondUSD = (dailyChangeMillions * 1_000_000) / 86_400;

  // Anchor to the start of the last recorded day
  const baseTime = useRef(new Date(lastDate).getTime()).current;

  const [display, setDisplay] = useState(baseUSD);

  useEffect(() => {
    if (perSecondUSD <= 0) return;
    setDisplay(baseUSD + perSecondUSD * ((Date.now() - baseTime) / 1000));
    const id = setInterval(() => {
      setDisplay(baseUSD + perSecondUSD * ((Date.now() - baseTime) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [baseUSD, perSecondUSD, baseTime]);

  return (
    <div className={`font-mono tabular-nums ${className}`}>
      {usdFull.format(display)}
    </div>
  );
}
