import { generateDeviceId, isValidDeviceId } from "@/lib/device/device-id";
import {
  FAVORITES_KEY,
  MUTE_PREF_KEY,
  RECENTLY_PLAYED_KEY,
} from "@/lib/game-adapter/types";
import {
  createSaveStore,
  getJsonStore,
  openSaveDb,
  setJsonStore,
  shouldShowIdbToast,
} from "@/lib/saves/save-slots";
import { useCallback, useEffect, useRef, useState } from "react";

const DEVICE_KEY = "__bg_did";

function ensureDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id || !isValidDeviceId(id)) {
    id = generateDeviceId();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function useDeviceStore() {
  const [ready, setReady] = useState(false);
  const [idbDisabled, setIdbDisabled] = useState(false);
  const storeRef = useRef<Awaited<ReturnType<typeof createSaveStore>> | null>(
    null,
  );

  useEffect(() => {
    ensureDeviceId();
    void (async () => {
      const db = await openSaveDb();
      if (!db) {
        setIdbDisabled(true);
        if (shouldShowIdbToast()) {
          console.warn("[SaveSlot] IndexedDB unavailable");
        }
      }
      storeRef.current = createSaveStore(db);
      setReady(true);
    })();
  }, []);

  const getStore = useCallback(() => storeRef.current, []);

  return { ready, idbDisabled, getStore };
}

export async function addRecentlyPlayed(
  store: ReturnType<typeof createSaveStore>,
  slug: string,
): Promise<void> {
  const list = await getJsonStore<string[]>(store, RECENTLY_PLAYED_KEY, []);
  const next = [slug, ...list.filter((s) => s !== slug)].slice(0, 12);
  await setJsonStore(store, RECENTLY_PLAYED_KEY, next);
}

export async function getRecentlyPlayed(
  store: ReturnType<typeof createSaveStore>,
): Promise<string[]> {
  return getJsonStore<string[]>(store, RECENTLY_PLAYED_KEY, []);
}

export async function getFavorites(
  store: ReturnType<typeof createSaveStore>,
): Promise<string[]> {
  return getJsonStore<string[]>(store, FAVORITES_KEY, []);
}

export async function toggleFavorite(
  store: ReturnType<typeof createSaveStore>,
  slug: string,
): Promise<boolean> {
  const list = await getFavorites(store);
  const has = list.includes(slug);
  const next = has ? list.filter((s) => s !== slug) : [...list, slug];
  await setJsonStore(store, FAVORITES_KEY, next);
  return !has;
}

export async function getMutePref(
  store: ReturnType<typeof createSaveStore>,
): Promise<boolean> {
  return getJsonStore<boolean>(store, MUTE_PREF_KEY, false);
}

export async function setMutePref(
  store: ReturnType<typeof createSaveStore>,
  muted: boolean,
): Promise<void> {
  await setJsonStore(store, MUTE_PREF_KEY, muted);
}

export { shouldShowIdbToast };
