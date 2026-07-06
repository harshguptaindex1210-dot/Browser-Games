"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  handleGameMessage,
  createSiteMessage,
  buildSaveWriteKey,
} from "@/lib/game-adapter/handler";
import {
  IFRAME_SANDBOX,
  isAllowedSiteMessage,
} from "@/lib/game-adapter/types";
import type { CatalogEntry } from "@/lib/catalog/types";
import {
  addRecentlyPlayed,
  getMutePref,
  setMutePref,
  toggleFavorite,
  useDeviceStore,
  shouldShowIdbToast,
} from "@/lib/hooks/use-device-store";
import { AdSlot } from "./AdSlot";

const INITIAL_TIMEOUT_MS = 5000;
const HEARTBEAT_TIMEOUT_MS = 10000;

interface GamePlayerProps {
  game: CatalogEntry;
}

export function GamePlayer({ game }: GamePlayerProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ready, idbDisabled, getStore } = useDeviceStore();
  const [notResponding, setNotResponding] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [muted, setMuted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const lastMessageRef = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const resetTimeout = useCallback(() => {
    lastMessageRef.current = Date.now();
    setNotResponding(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (Date.now() - lastMessageRef.current >= HEARTBEAT_TIMEOUT_MS) {
        setNotResponding(true);
      }
    }, HEARTBEAT_TIMEOUT_MS);
  }, []);

  const postToGame = useCallback(
    (type: string, payload?: unknown) => {
      if (!isAllowedSiteMessage(type)) return;
      iframeRef.current?.contentWindow?.postMessage(
        createSiteMessage(type, payload),
        gameOrigin,
      );
    },
    [gameOrigin],
  );

  useEffect(() => {
    if (!ready) return;
    const store = getStore();
    if (!store) return;
    void addRecentlyPlayed(store, game.slug);
    void getMutePref(store).then(setMuted);
  }, [ready, getStore, game.slug]);

  useEffect(() => {
    if (idbDisabled && shouldShowIdbToast()) {
      setToast("Saves disabled in this mode");
    }
  }, [idbDisabled]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setNotResponding(true);
    }, INITIAL_TIMEOUT_MS);

    const onMessage = (event: MessageEvent) => {
      const store = getStore();

      handleGameMessage(
        {
          gameSlug: game.slug,
          gameOrigin,
          expectedSource: iframeRef.current?.contentWindow ?? undefined,
          store: store ?? {
            get: async () => null,
            set: async () => {},
          },
          handlers: {
            onReady: resetTimeout,
            onHeartbeat: resetTimeout,
            onSaveWrite: async (slot, data) => {
              if (!store) return;
              try {
                await store.set(buildSaveWriteKey(game.slug, slot), data);
              } catch (err) {
                console.warn("[SaveSlot] write failed:", err);
              }
            },
            onScore: (s) => setScore(s),
            onRequestFullscreen: () => {
              void wrapperRef.current?.requestFullscreen?.();
            },
          },
          log: (msg) => console.warn(`[GameAdapter] ${msg}`),
        },
        event,
      );
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [game.slug, gameOrigin, getStore, resetTimeout]);

  useEffect(() => {
    if (ready && muted) {
      postToGame("AUDIO_MUTE_CHANGED", { muted: true });
    }
  }, [ready, muted, postToGame]);

  const handleReload = () => {
    setNotResponding(false);
    router.refresh();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: game.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setToast("Link copied!");
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleFavorite = async () => {
    const store = getStore();
    if (!store) return;
    const added = await toggleFavorite(store, game.slug);
    setIsFavorite(added);
  };

  const handleMute = async () => {
    const next = !muted;
    setMuted(next);
    postToGame("AUDIO_MUTE_CHANGED", { muted: next });
    const store = getStore();
    if (store) await setMutePref(store, next);
  };

  const handleFullscreen = () => {
    void wrapperRef.current?.requestFullscreen?.();
  };

  return (
    <div className="player-page" data-testid="player-page">
      <nav className="player-toolbar">
        <Link href="/">← Back</Link>
        <h1>{game.title}</h1>
        <div className="toolbar-actions">
          <button type="button" onClick={handleFavorite} data-testid="favorite-btn" aria-pressed={isFavorite}>
            {isFavorite ? "★ Favorited" : "☆ Favorite"}
          </button>
          <button type="button" onClick={handleShare} data-testid="share-btn">
            Share
          </button>
          <button type="button" onClick={handleMute} data-testid="mute-btn" aria-pressed={muted}>
            {muted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
          <button type="button" onClick={handleFullscreen} data-testid="fullscreen-btn">
            Fullscreen
          </button>
        </div>
      </nav>

      <AdSlot className="player-ad" />

      {score !== null && (
        <p className="score-display" data-testid="score-display">
          Score: {score}
        </p>
      )}

      <div ref={wrapperRef} className="iframe-wrapper" data-testid="iframe-wrapper">
        <iframe
          ref={iframeRef}
          src={game.gamePath}
          title={game.title}
          sandbox={IFRAME_SANDBOX}
          data-testid="game-iframe"
          className="game-iframe"
          allow="pointer-lock"
        />
      </div>

      {notResponding && (
        <div className="not-responding" data-testid="not-responding">
          <p>Game not responding — reload</p>
          <button type="button" onClick={handleReload}>
            Reload
          </button>
        </div>
      )}

      {toast && (
        <div className="toast" data-testid="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
