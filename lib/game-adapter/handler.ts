import {
  type GameAdapterMessage,
  isAllowedGameMessage,
  saveSlotKey,
} from "./types";

export interface SaveSlotStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

const SLOT_NAME_RE = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_SAVE_DATA_BYTES = 1_000_000;

function isValidSlot(slot: unknown): slot is string {
  return typeof slot === "string" && SLOT_NAME_RE.test(slot);
}

function isValidSaveData(data: unknown): data is string {
  return typeof data === "string" && data.length <= MAX_SAVE_DATA_BYTES;
}

export interface GameAdapterHandlers {
  onReady?: () => void;
  onHeartbeat?: () => void;
  onSaveWrite?: (slot: string, data: string) => Promise<void>;
  onSaveReadResponse?: (slot: string, data: string | null) => void;
  onGameOver?: (payload: unknown) => void;
  onScore?: (score: number) => void;
  onRequestFullscreen?: () => void;
  onAudioMute?: (muted: boolean) => void;
}

export interface GameAdapterContext {
  gameSlug: string;
  gameOrigin: string;
  expectedSource?: Window;
  store: SaveSlotStore;
  handlers: GameAdapterHandlers;
  log?: (msg: string) => void;
}

export function handleGameMessage(
  ctx: GameAdapterContext,
  event: { origin: string; source?: unknown; data: unknown },
): boolean {
  if (ctx.expectedSource !== undefined) {
    if (event.source !== ctx.expectedSource) {
      ctx.log?.("Dropped message from unexpected source");
      return false;
    }
  } else if (event.origin !== ctx.gameOrigin) {
    ctx.log?.(`Dropped message from unexpected origin: ${event.origin}`);
    return false;
  }

  const msg = event.data as GameAdapterMessage;
  if (!msg || typeof msg !== "object" || typeof msg.type !== "string") {
    ctx.log?.("Dropped malformed message");
    return false;
  }

  if (!isAllowedGameMessage(msg.type)) {
    ctx.log?.(`Dropped unknown message type: ${msg.type}`);
    return false;
  }

  switch (msg.type) {
    case "READY":
      ctx.handlers.onReady?.();
      break;
    case "HEARTBEAT":
      ctx.handlers.onHeartbeat?.();
      break;
    case "SAVE_WRITE": {
      const payload = msg.payload as { slot?: string; data?: string };
      if (!isValidSlot(payload?.slot) || payload.data === undefined) {
        ctx.log?.("Dropped SAVE_WRITE: invalid slot or data");
        return false;
      }
      if (!isValidSaveData(payload.data)) {
        ctx.log?.("Dropped SAVE_WRITE: data too large");
        return false;
      }
      void ctx.handlers.onSaveWrite?.(payload.slot, payload.data);
      break;
    }
    case "SAVE_READ_RESPONSE": {
      const payload = msg.payload as { slot?: string; data?: string | null };
      if (!isValidSlot(payload?.slot)) {
        ctx.log?.("Dropped SAVE_READ_RESPONSE: invalid slot");
        return false;
      }
      ctx.handlers.onSaveReadResponse?.(payload.slot, payload.data ?? null);
      break;
    }
    case "GAME_OVER":
      ctx.handlers.onGameOver?.(msg.payload);
      break;
    case "SCORE": {
      const payload = msg.payload as { score?: number };
      if (typeof payload?.score !== "number") {
        ctx.log?.("Dropped SCORE: invalid score");
        return false;
      }
      ctx.handlers.onScore?.(payload.score);
      break;
    }
    case "REQUEST_FULLSCREEN":
      ctx.handlers.onRequestFullscreen?.();
      break;
    case "AUDIO_MUTE": {
      const payload = msg.payload as { muted?: boolean };
      if (typeof payload?.muted !== "boolean") {
        ctx.log?.("Dropped AUDIO_MUTE: invalid muted");
        return false;
      }
      ctx.handlers.onAudioMute?.(payload.muted);
      break;
    }
  }

  return true;
}

export function buildSaveWriteKey(slug: string, slot: string): string {
  return saveSlotKey(slug, slot);
}

export function createSiteMessage(
  type: string,
  payload?: unknown,
  requestId?: string,
): GameAdapterMessage {
  return { type, payload, requestId };
}
