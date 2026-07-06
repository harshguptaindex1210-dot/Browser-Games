import fs from "fs";
import path from "path";
import {
  type CatalogEntry,
  type CatalogIndex,
  type GameManifest,
  REQUIRED_MANIFEST_FIELDS,
  VALID_GENRES,
} from "./types";

const ENTRY_RE = /^[A-Za-z0-9._-]+\.html?$/i;
const VALID_CONTROLS = ["mouse", "keyboard", "both"];
const EMBED_URL_RE = /^https?:\/\/.+/i;

export function validateManifest(
  raw: unknown,
  filePath: string,
): GameManifest {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid manifest at ${filePath}: expected an object`);
  }

  const manifest = raw as Record<string, unknown>;

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (manifest[field] === undefined || manifest[field] === null) {
      throw new Error(
        `Invalid manifest at ${filePath}: missing required field "${field}"`,
      );
    }
  }

  if (typeof manifest.slug !== "string" || manifest.slug.length === 0) {
    throw new Error(`Invalid manifest at ${filePath}: "slug" must be a non-empty string`);
  }
  if (typeof manifest.title !== "string" || manifest.title.length === 0) {
    throw new Error(`Invalid manifest at ${filePath}: "title" must be a non-empty string`);
  }
  if (typeof manifest.description !== "string") {
    throw new Error(`Invalid manifest at ${filePath}: "description" must be a string`);
  }
  if (!Array.isArray(manifest.tags) || !manifest.tags.every((t) => typeof t === "string")) {
    throw new Error(`Invalid manifest at ${filePath}: "tags" must be an array of strings`);
  }
  if (typeof manifest.controls !== "string" || !VALID_CONTROLS.includes(manifest.controls)) {
    throw new Error(`Invalid manifest at ${filePath}: "controls" must be one of ${VALID_CONTROLS.join(", ")}`);
  }
  if (typeof manifest.entry !== "string" || !ENTRY_RE.test(manifest.entry)) {
    throw new Error(`Invalid manifest at ${filePath}: "entry" must be a safe HTML filename matching ${ENTRY_RE}`);
  }
  if (typeof manifest.thumbnail !== "string" || manifest.thumbnail.length === 0) {
    throw new Error(`Invalid manifest at ${filePath}: "thumbnail" must be a non-empty string`);
  }

  const source = manifest.source as string | undefined;
  if (source !== undefined && source !== "local" && source !== "external") {
    throw new Error(`Invalid manifest at ${filePath}: "source" must be "local" or "external"`);
  }

  const isExternal = source === "external";

  if (isExternal) {
    if (typeof manifest.embedUrl !== "string" || !EMBED_URL_RE.test(manifest.embedUrl)) {
      throw new Error(`Invalid manifest at ${filePath}: external games require a valid "embedUrl" (must be an http(s) URL)`);
    }
  }

  if (manifest.genre !== undefined) {
    if (typeof manifest.genre !== "string" || !VALID_GENRES.includes(manifest.genre as any)) {
      throw new Error(`Invalid manifest at ${filePath}: "genre" must be one of ${VALID_GENRES.join(", ")}`);
    }
  }

  return manifest as unknown as GameManifest;
}

export function loadCatalogFromGamesDir(gamesDir: string): CatalogIndex {
  if (!fs.existsSync(gamesDir)) {
    return { generatedAt: new Date().toISOString(), games: [], tags: [] };
  }

  const entries: CatalogEntry[] = [];
  const tagSet = new Set<string>();

  for (const slug of fs.readdirSync(gamesDir)) {
    const gameDir = path.join(gamesDir, slug);
    if (!fs.statSync(gameDir).isDirectory()) continue;

    const manifestPath = path.join(gameDir, "game.json");
    if (!fs.existsSync(manifestPath)) continue;

    const raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const manifest = validateManifest(raw, manifestPath);

    if (manifest.slug !== slug) {
      throw new Error(
        `Invalid manifest at ${manifestPath}: slug "${manifest.slug}" does not match folder "${slug}"`,
      );
    }

    for (const tag of manifest.tags) {
      tagSet.add(tag);
    }

    entries.push({
      ...manifest,
      source: manifest.source ?? "local",
      gamePath: isExternalGame(manifest)
        ? manifest.embedUrl!
        : `/games/${slug}/${manifest.entry}`,
    });
  }

  entries.sort((a, b) => a.title.localeCompare(b.title));

  return {
    generatedAt: new Date().toISOString(),
    games: entries,
    tags: [...tagSet].sort(),
  };
}

function isExternalGame(manifest: GameManifest): boolean {
  return manifest.source === "external";
}

export function getGameBySlug(
  catalog: CatalogIndex,
  slug: string,
): CatalogEntry | undefined {
  return catalog.games.find((g) => g.slug === slug);
}

export function getGamesByTag(
  catalog: CatalogIndex,
  tag: string,
): CatalogEntry[] {
  return catalog.games.filter((g) => g.tags.includes(tag));
}

export function getFeaturedGames(catalog: CatalogIndex): CatalogEntry[] {
  return catalog.games.filter((g) => g.featured);
}
