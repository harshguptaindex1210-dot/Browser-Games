import { describe, it, expect } from "vitest";
import {
  generateDeviceId,
  isValidDeviceId,
  parseDeviceCookie,
  buildDeviceCookie,
} from "@/lib/device/device-id";

describe("device identity", () => {
  it("generates UUIDv4 device ids (INV-S4)", () => {
    const id = generateDeviceId();
    expect(isValidDeviceId(id)).toBe(true);
  });

  it("sets cookie with SameSite=Lax and 1-year max-age", () => {
    const id = generateDeviceId();
    const cookie = buildDeviceCookie(id);
    expect(cookie).toContain("__bg_did=");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Max-Age=31536000");
  });

  it("parses valid device cookie", () => {
    const id = generateDeviceId();
    const parsed = parseDeviceCookie(`__bg_did=${encodeURIComponent(id)}`);
    expect(parsed).toBe(id);
  });

  it("rejects invalid cookie values", () => {
    expect(parseDeviceCookie("__bg_did=not-a-uuid")).toBeNull();
  });
});
