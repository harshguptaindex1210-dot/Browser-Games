import { describe, it, expect } from "vitest";
import { buildSearchIndex } from "@/lib/search/build-index";
import { createSearchEngine, measureSearchP95 } from "@/lib/search/engine";
import type { CatalogIndex } from "@/lib/catalog/types";

function makeFixture(count: number): CatalogIndex {
  const games = Array.from({ length: count }, (_, i) => ({
    slug: `game-${i}`,
    title: `Game ${i}`,
    description: `Description for game ${i} with tag puzzle`,
    tags: i % 2 === 0 ? ["puzzle"] : ["action"],
    controls: "both" as const,
    entry: "index.html",
    thumbnail: `/games/game-${i}/thumb.svg`,
    gamePath: `/games/game-${i}/index.html`,
  }));
  return {
    generatedAt: new Date().toISOString(),
    games,
    tags: ["puzzle", "action"],
  };
}

describe("search engine", () => {
  it("ranks title matches ahead of non-matches", () => {
    const catalog = makeFixture(10);
    catalog.games.push({
      slug: "paddle",
      title: "Paddle Master",
      description: "Arcade fun",
      tags: ["arcade"],
      controls: "both",
      entry: "index.html",
      thumbnail: "/games/paddle/thumb.svg",
      gamePath: "/games/paddle/index.html",
    });
    const engine = createSearchEngine(buildSearchIndex(catalog));
    const results = engine.search("Paddle");
    expect(results[0]?.slug).toBe("paddle");
  });

  it("returns all games for empty query", () => {
    const catalog = makeFixture(5);
    const engine = createSearchEngine(buildSearchIndex(catalog));
    expect(engine.search("").length).toBe(5);
  });

  it("search returns ≤ 50ms p95 for 500-game fixture (INV-P3)", () => {
    const catalog = makeFixture(500);
    const engine = createSearchEngine(buildSearchIndex(catalog));
    const queries = ["puzzle", "action", "game", "Game 42", "xyz"];
    const p95 = measureSearchP95((q) => engine.search(q), queries, 200);
    expect(p95).toBeLessThanOrEqual(50);
  });
});
