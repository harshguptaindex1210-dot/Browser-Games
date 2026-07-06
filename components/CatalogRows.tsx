"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameCard } from "./GameCard";
import type { CatalogEntry } from "@/lib/catalog/types";
import {
  getFavorites,
  getRecentlyPlayed,
  useDeviceStore,
} from "@/lib/hooks/use-device-store";
import { AdSlot } from "./AdSlot";

interface CatalogRowsProps {
  featured: CatalogEntry[];
  allGames: CatalogEntry[];
  tags: string[];
}

export function CatalogRows({ featured, allGames, tags }: CatalogRowsProps) {
  const { ready, getStore } = useDeviceStore();
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (!ready) return;
    const store = getStore();
    if (!store) return;
    void getRecentlyPlayed(store).then(setRecentSlugs);
    void getFavorites(store).then(setFavoriteSlugs);
  }, [ready, getStore]);

  const recentGames = recentSlugs
    .map((s) => allGames.find((g) => g.slug === s))
    .filter(Boolean) as CatalogEntry[];

  const favoriteGames = favoriteSlugs
    .map((s) => allGames.find((g) => g.slug === s))
    .filter(Boolean) as CatalogEntry[];

  return (
    <div className="catalog-home">
      <header className="site-header">
        <h1>Browser Games</h1>
        <SearchBar />
      </header>

      <aside className="sidebar-ad">
        <AdSlot />
      </aside>

      <section className="tag-nav" data-testid="tag-nav">
        <h2>Browse by tag</h2>
        <div className="tag-chips">
          {tags.map((t) => (
            <Link key={t} href={`/tag/${encodeURIComponent(t)}`} className="tag-chip-link">
              {t}
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section data-testid="featured-row">
          <h2>Featured</h2>
          <div className="game-grid">
            {featured.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>
      )}

      {recentGames.length > 0 && (
        <section data-testid="recently-played-row">
          <h2>Recently Played</h2>
          <div className="game-grid">
            {recentGames.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>
      )}

      {favoriteGames.length > 0 && (
        <section data-testid="favorites-row">
          <h2>Favorites</h2>
          <div className="game-grid">
            {favoriteGames.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>
      )}

      <section data-testid="all-games-row">
        <h2>All Games</h2>
        <div className="game-grid">
          {allGames.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SearchBar() {
  const [q, setQ] = useState("");

  return (
    <form
      className="search-bar"
      action="/search"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = `/search?q=${encodeURIComponent(q)}`;
      }}
    >
      <input
        type="search"
        name="q"
        placeholder="Search games…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        data-testid="search-input"
      />
      <button type="submit">Search</button>
    </form>
  );
}
