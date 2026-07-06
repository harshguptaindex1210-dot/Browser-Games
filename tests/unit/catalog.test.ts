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

  it("rejects external manifest missing embedUrl (INV-F5)", () => {
    expect(() =>
      validateManifest(
        { slug: "ext1", title: "Ext", description: "d", tags: [], controls: "mouse", entry: "index.html", thumbnail: "/x.png", source: "external" },
        "games/ext1/game.json",
      ),
    ).toThrow(/external games require a valid "embedUrl"/);
  });

  it("accepts valid external manifest with embedUrl", () => {
    const m = validateManifest(
      { slug: "ext1", title: "Ext", description: "d", tags: ["racing"], controls: "mouse", entry: "index.html", thumbnail: "/x.png", source: "external", embedUrl: "https://html5.gamedistribution.com/abc123/" },
      "games/ext1/game.json",
    );
    expect(m.source).toBe("external");
    expect(m.embedUrl).toBe("https://html5.gamedistribution.com/abc123/");
  });

  it("rejects invalid embedUrl (not a URL)", () => {
    expect(() =>
      validateManifest(
        { slug: "ext1", title: "Ext", description: "d", tags: [], controls: "mouse", entry: "index.html", thumbnail: "/x.png", source: "external", embedUrl: "not-a-url" },
        "games/ext1/game.json",
      ),
    ).toThrow(/external games require a valid "embedUrl"/);
  });

  it("rejects invalid genre", () => {
    expect(() =>
      validateManifest(
        { slug: "g1", title: "G", description: "d", tags: [], controls: "mouse", entry: "index.html", thumbnail: "/x.png", genre: "invalid-genre" },
        "games/g1/game.json",
      ),
    ).toThrow(/"genre" must be one of/);
  });

  it("accepts valid genre", () => {
    const m = validateManifest(
      { slug: "g1", title: "G", description: "d", tags: [], controls: "mouse", entry: "index.html", thumbnail: "/x.png", genre: "racing" },
      "games/g1/game.json",
    );
    expect(m.genre).toBe("racing");
  });

  it("loads catalog with mixed local + external games", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bg-mixed-"));
    const localDir = path.join(tmp, "local1");
    fs.mkdirSync(localDir);
    fs.writeFileSync(
      path.join(localDir, "game.json"),
      JSON.stringify({ slug: "local1", title: "Local", description: "d", tags: ["arcade"], controls: "mouse", entry: "index.html", thumbnail: "/x.png" }),
    );
    const extDir = path.join(tmp, "ext1");
    fs.mkdirSync(extDir);
    fs.writeFileSync(
      path.join(extDir, "game.json"),
      JSON.stringify({ slug: "ext1", title: "External", description: "d", tags: ["racing"], controls: "mouse", entry: "index.html", thumbnail: "/x.png", source: "external", embedUrl: "https://html5.gamedistribution.com/abc123/" }),
    );
    const catalog = loadCatalogFromGamesDir(tmp);
    expect(catalog.games.length).toBe(2);
    const local = catalog.games.find((g) => g.slug === "local1");
    const ext = catalog.games.find((g) => g.slug === "ext1");
    expect(local?.source).toBe("local");
    expect(ext?.source).toBe("external");
    expect(ext?.embedUrl).toBe("https://html5.gamedistribution.com/abc123/");
    expect(local?.gamePath).toBe("/games/local1/index.html");
    expect(ext?.gamePath).toBe("https://html5.gamedistribution.com/abc123/");
  });
});
