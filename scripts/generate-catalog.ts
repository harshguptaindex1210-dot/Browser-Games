import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadCatalogFromGamesDir } from "../lib/catalog/generate";
import { buildSearchIndex } from "../lib/search/build-index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const gamesDir = path.join(root, "games");
const outDir = path.join(root, "lib", "catalog");
const publicDir = path.join(root, "public");

const catalog = loadCatalogFromGamesDir(gamesDir);

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

function copyGamesToPublic() {
  const publicGames = path.join(publicDir, "games");
  if (fs.existsSync(publicGames)) {
    fs.rmSync(publicGames, { recursive: true });
  }
  fs.cpSync(gamesDir, publicGames, { recursive: true });
}

copyGamesToPublic();

fs.writeFileSync(
  path.join(outDir, "catalog.json"),
  JSON.stringify(catalog, null, 2),
);

const searchIndex = buildSearchIndex(catalog);
fs.writeFileSync(
  path.join(publicDir, "search-index.json"),
  JSON.stringify(searchIndex),
);

// sitemap + robots (S7)
const baseUrl = process.env.SITE_URL ?? "https://browser-games.example.com";
const urls = [
  baseUrl,
  ...catalog.games.map((g) => `${baseUrl}/play/${g.slug}`),
  ...catalog.tags.map((t) => `${baseUrl}/tag/${encodeURIComponent(t)}`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
fs.writeFileSync(
  path.join(publicDir, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`,
);

console.log(`Catalog generated: ${catalog.games.length} games, ${catalog.tags.length} tags`);
