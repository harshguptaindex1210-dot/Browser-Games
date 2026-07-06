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
