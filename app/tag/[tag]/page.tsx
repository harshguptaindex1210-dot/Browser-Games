import { notFound } from "next/navigation";
import { GameCard } from "@/components/GameCard";
import { getCatalog } from "@/lib/catalog";
import { getGamesByTag } from "@/lib/catalog/generate";

interface Props {
  params: Promise<{ tag: string }>;
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const catalog = getCatalog();
  const decoded = decodeURIComponent(tag);

  if (!catalog.tags.includes(decoded)) notFound();

  const games = getGamesByTag(catalog, decoded);

  return (
    <main className="tag-page" data-testid="tag-page">
      <h1>Tag: {decoded}</h1>
      <div className="game-grid">
        {games.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
    </main>
  );
}
