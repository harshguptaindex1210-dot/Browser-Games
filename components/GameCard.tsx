import Link from "next/link";
import type { CatalogEntry } from "@/lib/catalog/types";

interface GameCardProps {
  game: CatalogEntry;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/play/${game.slug}`} className="game-card" data-testid={`game-card-${game.slug}`}>
      <div className="game-card-thumb">
        <img src={game.thumbnail} alt={game.title} width={160} height={120} />
      </div>
      <div className="game-card-body">
        <h3>{game.title}</h3>
        <div className="game-card-tags">
          {game.tags.map((t) => (
            <span key={t} className="tag-chip">
              {t}
            </span>
          ))}
        </div>
        <span className="controls-badge" data-testid="controls-badge">
          {game.controls}
        </span>
        <span className="play-btn">Play</span>
      </div>
    </Link>
  );
}
