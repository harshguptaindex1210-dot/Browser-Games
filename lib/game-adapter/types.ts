/** Game → Site message types */
export const GAME_TO_SITE_TYPES = [
  "READY",
  "HEARTBEAT",
  "SAVE_WRITE",
  "SAVE_READ_RESPONSE",
  "GAME_OVER",
  "SCORE",
  "REQUEST_FULLSCREEN",
  "AUDIO_MUTE",
] as const;

/** Site → Game message types */
export const SITE_TO_GAME_TYPES = [
  "SAVE_READ",
  "FOCUS",
  "AUDIO_MUTE_CHANGED",
] as const;

export type GameToSiteType = (typeof GAME_TO_SITE_TYPES)[number];
export type SiteToGameType = (typeof SITE_TO_GAME_TYPES)[number];

export interface GameAdapterMessage {
  type: string;
  payload?: unknown;
  requestId?: string;
}

export function isAllowedGameMessage(
  type: string,
): type is GameToSiteType {
  return (GAME_TO_SITE_TYPES as readonly string[]).includes(type);
}

export function isAllowedSiteMessage(
  type: string,
): type is SiteToGameType {
  return (SITE_TO_GAME_TYPES as readonly string[]).includes(type);
}

export const IFRAME_SANDBOX = "allow-scripts allow-pointer-lock";

export function iframeHasCorrectSandbox(sandbox: string): boolean {
  const tokens = sandbox.split(/\s+/).filter(Boolean);
  return (
    tokens.includes("allow-scripts") &&
    tokens.includes("allow-pointer-lock") &&
    !tokens.includes("allow-same-origin")
  );
}

export function saveSlotKey(slug: string, slot: string): string {
  return `games/${slug}/saves/${slot}`;
}

export const FAVORITES_KEY = "games/_meta/favorites";
export const RECENTLY_PLAYED_KEY = "games/_meta/recently-played";
export const MUTE_PREF_KEY = "games/_meta/audio-muted";
