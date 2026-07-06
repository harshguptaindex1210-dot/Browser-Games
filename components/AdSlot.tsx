"use client";

import { useEffect, useRef, useState } from "react";
import {
  ADSENSE_ORIGIN,
  AD_SLOT_SANDBOX,
  HOUSE_AD_FALLBACK_MS,
  HOUSE_AD_SVG,
} from "@/lib/ads/ad-slot";

interface AdSlotProps {
  slotId?: string;
  className?: string;
}

export function AdSlot({ slotId = "ad-slot", className = "" }: AdSlotProps) {
  const [showHouse, setShowHouse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // v1: default-on ads with cookie opt-out
    const optedOut =
      typeof document !== "undefined" &&
      document.cookie.includes("__bg_ads_optout=1");
    if (optedOut) {
      setShowHouse(true);
      return;
    }

    timerRef.current = setTimeout(() => {
      setShowHouse(true);
    }, HOUSE_AD_FALLBACK_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleIframeError = () => {
    setShowHouse(true);
  };

  if (showHouse) {
    return (
      <div
        ref={containerRef}
        className={`ad-slot ad-slot-house ${className}`}
        data-testid="house-ad"
        dangerouslySetInnerHTML={{ __html: HOUSE_AD_SVG }}
        style={{ minHeight: 90, minWidth: 728, maxWidth: "100%" }}
      />
    );
  }

  return (
    <div ref={containerRef} className={`ad-slot ${className}`} data-testid="ad-slot">
      <iframe
        title="Advertisement"
        sandbox={AD_SLOT_SANDBOX}
        src={`${ADSENSE_ORIGIN}/pagead/ads?client=ca-pub-placeholder`}
        width={728}
        height={90}
        data-testid="adsense-iframe"
        onError={handleIframeError}
        style={{ border: 0, minHeight: 90 }}
      />
    </div>
  );
}
