"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogEntry } from "@/lib/catalog/types";

const BACKOFF_MS = [1000, 2000, 5000, 10000];

interface MultiplayerPlayerProps {
  game: CatalogEntry;
  partyHost: string;
}

export function MultiplayerPlayer({ game, partyHost }: MultiplayerPlayerProps) {
  const [roomCode, setRoomCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);
  const [localState, setLocalState] = useState<string>("waiting");
  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(
    (code: string) => {
      const ws = new WebSocket(`${partyHost}/parties/main/${code}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setReconnecting(false);
        attemptRef.current = 0;
      };

      ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data as string);
        if (data.state) setLocalState(data.state);
      };

      ws.onclose = () => {
        setConnected(false);
        if (attemptRef.current < BACKOFF_MS.length) {
          setReconnecting(true);
          const delay = BACKOFF_MS[attemptRef.current];
          attemptRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => connect(code), delay);
        } else {
          setReconnecting(false);
          setMatchEnded(true);
        }
      };
    },
    [partyHost],
  );

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  const createRoom = async () => {
    const res = await fetch(`${partyHost}/parties/main/_create`, {
      method: "POST",
    });
    const { code } = (await res.json()) as { code: string };
    setRoomCode(code);
    connect(code);
  };

  const joinRoom = () => {
    if (roomCode) connect(roomCode);
  };

  return (
    <div className="multiplayer-player" data-testid="multiplayer-player">
      <h2>{game.title} — Multiplayer</h2>
      <p data-testid="local-state">State: {localState}</p>

      {!connected && !reconnecting && !matchEnded && (
        <div className="room-controls">
          <button type="button" onClick={createRoom} data-testid="create-room">
            Create Room
          </button>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Room code"
            data-testid="room-code-input"
          />
          <button type="button" onClick={joinRoom} data-testid="join-room">
            Join
          </button>
        </div>
      )}

      {reconnecting && (
        <div className="reconnect-banner" data-testid="reconnect-banner">
          Reconnecting…
        </div>
      )}

      {matchEnded && (
        <div className="match-ended" data-testid="match-ended">
          Match ended
        </div>
      )}

      <iframe
        src={game.gamePath}
        title={game.title}
        sandbox="allow-scripts allow-pointer-lock"
        data-testid="mp-game-iframe"
        className="game-iframe"
      />
    </div>
  );
}
