"use client";

import { useEffect, useState } from "react";
import { createSearchEngine, type SearchResult } from "@/lib/search/engine";
import type { SearchIndexPayload } from "@/lib/search/build-index";
import { GameCard } from "./GameCard";
import type { CatalogEntry } from "@/lib/catalog/types";

interface SearchPageClientProps {
  query: string;
  games: CatalogEntry[];
}

export function SearchPageClient({ query, games }: SearchPageClientProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetch("/search-index.json")
      .then((r) => r.json())
      .then((payload: SearchIndexPayload) => {
        const engine = createSearchEngine(payload);
        setResults(engine.search(query));
        setLoaded(true);
      });
  }, [query]);

  const gameMap = new Map(games.map((g) => [g.slug, g]));
  const matched = results
    .map((r) => gameMap.get(r.slug))
    .filter(Boolean) as CatalogEntry[];

  if (!loaded) return <p>Searching…</p>;

  if (matched.length === 0 && query.trim()) {
    return (
      <div data-testid="search-empty">
        <p>No games found for &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="search-results" data-testid="search-results">
      <h2>
        {query.trim() ? `Results for "${query}"` : "All games"}
      </h2>
      <div className="game-grid">
        {matched.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
    </div>
  );
}
