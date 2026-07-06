import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  loadCatalogFromGamesDir,
  validateManifest,
} from "@/lib/catalog/generate";

describe("catalog generation", () => {
  it("loads valid manifests from games dir", () => {
    const gamesDir = path.resolve(__dirname, "../../games");
    const catalog = loadCatalogFromGamesDir(gamesDir);
    expect(catalog.games.length).toBeGreaterThanOrEqual(1);
    expect(catalog.games.some((g) => g.slug === "paddle")).toBe(true);
  });

  it("fails build with precise error for missing required field (INV-F5)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bg-test-"));
    const gameDir = path.join(tmp, "badgame");
    fs.mkdirSync(gameDir);
    fs.writeFileSync(
      path.join(gameDir, "game.json"),
      JSON.stringify({ slug: "badgame", title: "Bad" }),
    );
    expect(() => loadCatalogFromGamesDir(tmp)).toThrow(
      /Invalid manifest at .*badgame.*game\.json.*missing required field "description"/,
    );
  });

  it("rejects malformed manifest object", () => {
    expect(() => validateManifest(null, "games/x/game.json")).toThrow(
      /Invalid manifest at games\/x\/game\.json/,
    );
  });

  it("rejects empty title (M1)", () => {
    expect(() =>
      validateManifest(
        { slug: "x", title: "", description: "d", tags: [], controls: "mouse", entry: "index.html", thumbnail: "/x.png" },
        "games/x/game.json",
      ),
    ).toThrow(/"title" must be a non-empty string/);
  });

  it("rejects invalid controls enum (M1)", () => {
    expect(() =>
      validateManifest(
        { slug: "x", title: "X", description: "d", tags: [], controls: "gamepad", entry: "index.html", thumbnail: "/x.png" },
        "games/x/game.json",
      ),
    ).toThrow(/"controls" must be one of/);
  });

  it("rejects path traversal in entry (M2)", () => {
    expect(() =>
      validateManifest(
        { slug: "x", title: "X", description: "d", tags: [], controls: "mouse", entry: "../../etc/passwd", thumbnail: "/x.png" },
        "games/x/game.json",
      ),
    ).toThrow(/"entry" must be a safe HTML filename/);
  });

  it("rejects non-string tags (M1)", () => {
    expect(() =>
      validateManifest(
        { slug: "x", title: "X", description: "d", tags: [123], controls: "mouse", entry: "index.html", thumbnail: "/x.png" },
        "games/x/game.json",
      ),
    ).toThrow(/"tags" must be an array of strings/);
  });
});
