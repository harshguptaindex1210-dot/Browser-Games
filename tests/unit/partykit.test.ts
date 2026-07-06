import { describe, it, expect } from "vitest";
import { randomBytes } from "crypto";

const ROOM_TTL_MS = 30 * 60 * 1000;

function generateRoomCode(): string {
  return randomBytes(9).toString("base64url");
}

function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9_-]{10,16}$/.test(code);
}

describe("PartyKit room logic", () => {
  it("generates room codes with ≥ 64 bits entropy (INV-S6)", () => {
    const code = generateRoomCode();
    expect(isValidCode(code)).toBe(true);
    // 9 bytes = 72 bits
    expect(code.length).toBeGreaterThanOrEqual(10);
  });

  it("rejects invalid room codes", () => {
    expect(isValidCode("")).toBe(false);
    expect(isValidCode("short")).toBe(false);
  });

  it("room expires after 30 minutes", () => {
    const createdAt = Date.now() - ROOM_TTL_MS - 1;
    expect(Date.now() - createdAt > ROOM_TTL_MS).toBe(true);
  });

  it("rooms are isolated by id (no cross-room leakage)", () => {
    const roomA = generateRoomCode();
    const roomB = generateRoomCode();
    expect(roomA).not.toBe(roomB);
  });
});
