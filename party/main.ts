import type * as Party from "partykit/server";
import { randomBytes } from "crypto";

const ROOM_TTL_MS = 30 * 60 * 1000;

interface RoomMeta {
  createdAt: number;
}

function generateRoomCode(): string {
  return randomBytes(9).toString("base64url");
}

function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9_-]{10,16}$/.test(code);
}

export default class MultiplayerRoom implements Party.Server {
  state: string = "waiting";
  meta: RoomMeta = { createdAt: Date.now() };

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const code = this.room.id;
    if (!isValidCode(code)) {
      conn.close(4000, "Invalid room code");
      return;
    }

    if (Date.now() - this.meta.createdAt > ROOM_TTL_MS) {
      conn.close(4001, "Room expired");
      return;
    }

    conn.send(JSON.stringify({ state: this.state }));
  }

  onMessage(message: string, sender: Party.Connection) {
    if (message === "turn") {
      this.state = this.state === "waiting" ? "player-turn" : "waiting";
      this.room.broadcast(JSON.stringify({ state: this.state }));
    }
  }

  static onRequest(req: Party.Request, lobby: Party.Lobby) {
    if (req.method === "POST" && new URL(req.url).pathname.endsWith("/_create")) {
      const code = generateRoomCode();
      return new Response(JSON.stringify({ code }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Not found", { status: 404 });
  }
}
