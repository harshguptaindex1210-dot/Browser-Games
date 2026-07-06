import { SearchPageClient } from "@/components/SearchPageClient";
import { getCatalog } from "@/lib/catalog";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const catalog = getCatalog();

  return (
    <main className="search-page" data-testid="search-page">
      <SearchPageClient query={q} games={catalog.games} />
    </main>
  );
}
