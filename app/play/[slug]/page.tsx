import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/GamePlayer";
import { MultiplayerPlayer } from "@/components/MultiplayerPlayer";
import { getCatalog } from "@/lib/catalog";
import { getGameBySlug } from "@/lib/catalog/generate";
import {
  buildOpenGraphMeta,
  buildVideoGameJsonLd,
  getSiteUrl,
} from "@/lib/seo/meta";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const game = getGameBySlug(getCatalog(), slug);
  if (!game) return {};
  const og = buildOpenGraphMeta(game, getSiteUrl());
  return {
    title: og.title,
    description: og.description,
    openGraph: og,
    twitter: { card: "summary_large_image", ...og },
  };
}

export default async function PlayPage({ params }: Props) {
  const { slug } = await params;
  const game = getGameBySlug(getCatalog(), slug);
  if (!game) notFound();

  const jsonLd = buildVideoGameJsonLd(game, getSiteUrl());

  if (game.multiplayer) {
    const partyHost =
      process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "ws://localhost:1999";
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MultiplayerPlayer game={game} partyHost={partyHost} />
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GamePlayer game={game} />
    </>
  );
}
