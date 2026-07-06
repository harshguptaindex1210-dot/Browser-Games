import { CatalogRows } from "@/components/CatalogRows";
import { getCatalog } from "@/lib/catalog";
import { getFeaturedGames } from "@/lib/catalog/generate";

export default function HomePage() {
  const catalog = getCatalog();
  const featured = getFeaturedGames(catalog);

  return (
    <main>
      <CatalogRows
        featured={featured}
        allGames={catalog.games}
        tags={catalog.tags}
      />
    </main>
  );
}
