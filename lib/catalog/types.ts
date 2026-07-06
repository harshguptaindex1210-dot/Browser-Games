export type GameSource = "local" | "external";

export type GameGenre =
  | "racing"
  | "fighting"
  | "clicker"
  | "simulator"
  | "arcade"
  | "action"
  | "puzzle"
  | "strategy";

export interface GameManifest {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  controls: "mouse" | "keyboard" | "both";
  entry: string;
  thumbnail: string;
  featured?: boolean;
  multiplayer?: boolean;
  partykitRoom?: string;
  source?: GameSource;
  embedUrl?: string;
  license?: string;
  genre?: GameGenre;
}

export interface CatalogEntry extends GameManifest {
  gamePath: string;
}

export interface CatalogIndex {
  generatedAt: string;
  games: CatalogEntry[];
  tags: string[];
}

export const REQUIRED_MANIFEST_FIELDS: (keyof GameManifest)[] = [
  "slug",
  "title",
  "description",
  "tags",
  "controls",
  "entry",
  "thumbnail",
];

export const VALID_GENRES: GameGenre[] = [
  "racing",
  "fighting",
  "clicker",
  "simulator",
  "arcade",
  "action",
  "puzzle",
  "strategy",
];
