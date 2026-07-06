import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSaveStore,
  openSaveDb,
  shouldShowIdbToast,
  resetToastFlag,
} from "@/lib/saves/save-slots";

describe("Save Slots fail-soft (INV-F4)", () => {
  beforeEach(() => {
    resetToastFlag();
  });

  it("openSaveDb returns null when indexedDB is undefined", async () => {
    const original = (globalThis as Record<string, unknown>).indexedDB;
    (globalThis as Record<string, unknown>).indexedDB = undefined;
    const db = await openSaveDb();
    expect(db).toBeNull();
    (globalThis as Record<string, unknown>).indexedDB = original;
  });

  it("openSaveDb returns null when indexedDB.open throws", async () => {
    const original = (globalThis as Record<string, unknown>).indexedDB;
    (globalThis as Record<string, unknown>).indexedDB = {
      open: () => {
        throw new Error("blocked");
      },
    };
    const db = await openSaveDb();
    expect(db).toBeNull();
    (globalThis as Record<string, unknown>).indexedDB = original;
  });

  it("store with null db does not throw on write (INV-F4)", async () => {
    const store = createSaveStore(null);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(store.set("key", "value")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("store with null db returns null on read", async () => {
    const store = createSaveStore(null);
    const result = await store.get("key");
    expect(result).toBeNull();
  });

  it("shouldShowIdbToast returns true once then false (B1 fix)", () => {
    expect(shouldShowIdbToast()).toBe(true);
    expect(shouldShowIdbToast()).toBe(false);
    resetToastFlag();
    expect(shouldShowIdbToast()).toBe(true);
  });
});
