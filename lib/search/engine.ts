import FlexSearch from "flexsearch";
import type { SearchDocument, SearchIndexPayload } from "./build-index";

export interface SearchResult {
  slug: string;
  title: string;
  score: number;
}

export function createSearchEngine(payload: SearchIndexPayload) {
  const index = new FlexSearch.Document<{ id: string; title: string; description: string; tags: string }>({
    document: {
      id: "id",
      index: ["title", "description", "tags"],
    },
  });

  const docMap = new Map<string, SearchDocument>();
  for (const doc of payload.documents) {
    docMap.set(doc.slug, doc);
    index.add({
      id: doc.slug,
      title: doc.title,
      description: doc.description,
      tags: doc.tags.join(" "),
    });
  }

  return {
    search(query: string): SearchResult[] {
      const trimmed = query.trim();
      if (!trimmed) {
        return payload.documents.map((d) => ({
          slug: d.slug,
          title: d.title,
          score: 0,
        }));
      }

      const results = index.search(trimmed, { enrich: true }) as Array<{
        field: string;
        result: string[];
      }>;

      const scores = new Map<string, number>();
      for (const group of results) {
        for (const id of group.result) {
          scores.set(id, (scores.get(id) ?? 0) + 1);
        }
      }

      return [...scores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([slug, score]) => ({
          slug,
          title: docMap.get(slug)?.title ?? slug,
          score,
        }));
    },
  };
}

export function measureSearchP95(
  searchFn: (q: string) => unknown,
  queries: string[],
  iterations = 100,
): number {
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const q = queries[i % queries.length];
    const start = performance.now();
    searchFn(q);
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const idx = Math.ceil(times.length * 0.95) - 1;
  return times[Math.max(0, idx)];
}
