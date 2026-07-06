import { describe, it, expect } from "vitest";
import { adSlotHasCorrectSandbox, AD_SLOT_SANDBOX } from "@/lib/ads/ad-slot";

describe("Ad Slot", () => {
  it("iframe has no allow-same-origin (INV-S3)", () => {
    expect(adSlotHasCorrectSandbox(AD_SLOT_SANDBOX)).toBe(true);
    expect(
      adSlotHasCorrectSandbox("allow-scripts allow-same-origin"),
    ).toBe(false);
  });
});
