import { describe, it, expect, vi } from "vitest";
import { handleGameMessage } from "@/lib/game-adapter/handler";
import {
  GAME_TO_SITE_TYPES,
  IFRAME_SANDBOX,
  iframeHasCorrectSandbox,
  saveSlotKey,
} from "@/lib/game-adapter/types";

const ORIGIN = "http://localhost:3000";
const SLUG = "paddle";

function makeStore() {
  const data = new Map<string, string>();
  return {
    get: async (k: string) => data.get(k) ?? null,
    set: async (k: string, v: string) => {
      data.set(k, v);
    },
  };
}

function ctx(handlers: Record<string, unknown> = {}, opts: { expectedSource?: Window } = {}) {
  return {
    gameSlug: SLUG,
    gameOrigin: ORIGIN,
    expectedSource: opts.expectedSource,
    store: makeStore(),
    handlers,
    log: vi.fn(),
  };
}

describe("Game Adapter handler", () => {
  for (const type of GAME_TO_SITE_TYPES) {
    it(`accepts allowlisted message type: ${type}`, () => {
      const handlers: Record<string, ReturnType<typeof vi.fn>> = {};
      if (type === "READY") handlers.onReady = vi.fn();
      if (type === "HEARTBEAT") handlers.onHeartbeat = vi.fn();
      if (type === "SAVE_WRITE") handlers.onSaveWrite = vi.fn();
      if (type === "SAVE_READ_RESPONSE") handlers.onSaveReadResponse = vi.fn();
      if (type === "GAME_OVER") handlers.onGameOver = vi.fn();
      if (type === "SCORE") handlers.onScore = vi.fn();
      if (type === "REQUEST_FULLSCREEN") handlers.onRequestFullscreen = vi.fn();
      if (type === "AUDIO_MUTE") handlers.onAudioMute = vi.fn();

      const c = ctx(handlers);
      const payload =
        type === "SAVE_WRITE"
          ? { slot: "progress", data: "{}" }
          : type === "SAVE_READ_RESPONSE"
            ? { slot: "progress", data: null }
            : type === "SCORE"
              ? { score: 42 }
              : type === "AUDIO_MUTE"
                ? { muted: true }
                : undefined;

      const accepted = handleGameMessage(c, {
        origin: ORIGIN,
        data: { type, payload },
      });
      expect(accepted).toBe(true);
    });
  }

  it("drops unknown message types (INV-S2)", () => {
    const c = ctx();
    const accepted = handleGameMessage(c, {
      origin: ORIGIN,
      data: { type: "EVIL_EXFIL" },
    });
    expect(accepted).toBe(false);
    expect(c.log).toHaveBeenCalledWith(
      expect.stringContaining("EVIL_EXFIL"),
    );
  });

  it("drops messages from wrong origin (no expectedSource)", () => {
    const c = ctx();
    const accepted = handleGameMessage(c, {
      origin: "http://evil.com",
      data: { type: "READY" },
    });
    expect(accepted).toBe(false);
  });

  it("drops messages from wrong source when expectedSource is set", () => {
    const fakeWindow = {} as Window;
    const c = ctx({}, { expectedSource: fakeWindow });
    const accepted = handleGameMessage(c, {
      origin: "null",
      source: {} as Window,
      data: { type: "READY" },
    });
    expect(accepted).toBe(false);
  });

  it("accepts messages from correct source regardless of origin (sandboxed iframe)", () => {
    const fakeWindow = {} as Window;
    const c = ctx(
      { onReady: vi.fn() },
      { expectedSource: fakeWindow },
    );
    const accepted = handleGameMessage(c, {
      origin: "null",
      source: fakeWindow,
      data: { type: "READY" },
    });
    expect(accepted).toBe(true);
  });

  it("drops SAVE_WRITE with invalid slot name (path traversal)", () => {
    const c = ctx({ onSaveWrite: vi.fn() });
    const accepted = handleGameMessage(c, {
      origin: ORIGIN,
      data: { type: "SAVE_WRITE", payload: { slot: "../../_meta", data: "x" } },
    });
    expect(accepted).toBe(false);
  });

  it("drops SAVE_WRITE with oversized data", () => {
    const c = ctx({ onSaveWrite: vi.fn() });
    const big = "x".repeat(1_000_001);
    const accepted = handleGameMessage(c, {
      origin: ORIGIN,
      data: { type: "SAVE_WRITE", payload: { slot: "progress", data: big } },
    });
    expect(accepted).toBe(false);
  });

  it("namespaces save keys per game (INV-S5)", () => {
    expect(saveSlotKey("paddle", "progress")).toBe(
      "games/paddle/saves/progress",
    );
    expect(saveSlotKey("snake", "progress")).toBe(
      "games/snake/saves/progress",
    );
  });

  it("iframe sandbox has allow-scripts but not allow-same-origin (INV-S1)", () => {
    expect(iframeHasCorrectSandbox(IFRAME_SANDBOX)).toBe(true);
    expect(
      iframeHasCorrectSandbox("allow-scripts allow-same-origin allow-pointer-lock"),
    ).toBe(false);
  });
});
