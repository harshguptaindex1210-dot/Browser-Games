import { describe, it, expect } from "vitest";
import {
  adSlotHasCorrectSandbox,
  AD_SLOT_SANDBOX,
  HOUSE_AD_FALLBACK_MS,
} from "@/lib/ads/ad-slot";

describe("Ad Slot", () => {
  it("iframe has no allow-same-origin (INV-S3)", () => {
    expect(adSlotHasCorrectSandbox(AD_SLOT_SANDBOX)).toBe(true);
    expect(
      adSlotHasCorrectSandbox("allow-scripts allow-same-origin"),
    ).toBe(false);
  });

  it("house ad fallback fires within 500ms (INV-F1)", () => {
    expect(HOUSE_AD_FALLBACK_MS).toBeLessThanOrEqual(500);
  });
});
