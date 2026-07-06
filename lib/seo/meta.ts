import type { CatalogEntry } from "../catalog/types";

export function buildVideoGameJsonLd(game: CatalogEntry, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description,
    genre: game.tags,
    url: `${siteUrl}/play/${game.slug}`,
    gamePlatform: "Web browser",
  };
}

export function buildOpenGraphMeta(game: CatalogEntry, siteUrl: string) {
  return {
    title: `${game.title} — Browser Games`,
    description: game.description,
    url: `${siteUrl}/play/${game.slug}`,
    type: "website",
    image: `${siteUrl}${game.thumbnail}`,
  };
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
