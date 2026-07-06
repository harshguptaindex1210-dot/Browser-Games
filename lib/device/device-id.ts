import { v4 as uuidv4, validate as validateUuid } from "uuid";

export const DEVICE_COOKIE_NAME = "__bg_did";
export const DEVICE_STORAGE_KEY = "__bg_did";
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function generateDeviceId(): string {
  return uuidv4();
}

export function isValidDeviceId(id: string): boolean {
  return validateUuid(id);
}

export function parseDeviceCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${DEVICE_COOKIE_NAME}=([^;]+)`),
  );
  if (!match) return null;
  const id = decodeURIComponent(match[1]);
  return isValidDeviceId(id) ? id : null;
}

export function buildDeviceCookie(id: string): string {
  return `${DEVICE_COOKIE_NAME}=${encodeURIComponent(id)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax; HttpOnly`;
}
