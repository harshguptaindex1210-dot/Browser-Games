export const DB_NAME = "bg_saves";
export const STORE_NAME = "bg_saves";
export const DB_VERSION = 1;

export interface SaveStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  listKeys(prefix: string): Promise<string[]>;
}

let toastShown = false;

export function resetToastFlag(): void {
  toastShown = false;
}

export function shouldShowIdbToast(): boolean {
  if (toastShown) return false;
  toastShown = true;
  return true;
}export async function openSaveDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return null;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => resolve(null);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
    } catch {
      resolve(null);
    }
  });
}

export function createSaveStore(db: IDBDatabase | null): SaveStore {
  return {
    async get(key: string): Promise<string | null> {
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve((req.result as string) ?? null);
        req.onerror = () => resolve(null);
      });
    },
    async set(key: string, value: string): Promise<void> {
      if (!db) {
        console.warn("[SaveSlot] IndexedDB unavailable — write skipped");
        return;
      }
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const req = tx.objectStore(STORE_NAME).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    },
    async delete(key: string): Promise<void> {
      if (!db) return;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
      });
    },
    async listKeys(prefix: string): Promise<string[]> {
      if (!db) return [];
      return new Promise((resolve) => {
        const keys: string[] = [];
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            const k = cursor.key as string;
            if (k.startsWith(prefix)) keys.push(k);
            cursor.continue();
          } else {
            resolve(keys);
          }
        };
        req.onerror = () => resolve([]);
      });
    },
  };
}

export async function getJsonStore<T>(
  store: SaveStore,
  key: string,
  fallback: T,
): Promise<T> {
  const raw = await store.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJsonStore<T>(
  store: SaveStore,
  key: string,
  value: T,
): Promise<void> {
  await store.set(key, JSON.stringify(value));
}
