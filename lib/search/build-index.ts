import type { CatalogIndex } from "../catalog/types";

export interface SearchDocument {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

export interface SearchIndexPayload {
  documents: SearchDocument[];
}

export function buildSearchIndex(catalog: CatalogIndex): SearchIndexPayload {
  return {
    documents: catalog.games.map((g) => ({
      id: g.slug,
      slug: g.slug,
      title: g.title,
      description: g.description,
      tags: g.tags,
    })),
  };
}
