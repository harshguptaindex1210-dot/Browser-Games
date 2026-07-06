export const AD_SLOT_SANDBOX = "allow-scripts allow-popups allow-popups-to-escape-sandbox";
export const ADSENSE_ORIGIN = "https://pagead2.googlesyndication.com";
export const HOUSE_AD_FALLBACK_MS = 500;

export const HOUSE_AD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="728" height="90" viewBox="0 0 728 90" role="img" aria-label="Browser Games">
  <rect width="728" height="90" fill="#1a1a2e"/>
  <text x="364" y="50" text-anchor="middle" fill="#eee" font-family="sans-serif" font-size="20">Play more games at Browser Games</text>
</svg>`;

export function adSlotHasCorrectSandbox(sandbox: string): boolean {
  const tokens = sandbox.split(/\s+/).filter(Boolean);
  return tokens.includes("allow-scripts") && !tokens.includes("allow-same-origin");
}
