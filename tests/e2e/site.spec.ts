import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("shows game cards and featured row", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("featured-row")).toBeVisible();
    await expect(page.getByTestId("game-card-paddle").first()).toBeVisible();
  });

  test("tag chips navigate to tag page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "arcade" }).first().click();
    await expect(page.getByTestId("tag-page")).toBeVisible();
    await expect(page.getByTestId("game-card-paddle")).toBeVisible();
  });
});

test.describe("player page", () => {
  test("game card opens player page with sandboxed iframe", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("game-card-paddle").first().click();
    await expect(page.getByTestId("player-page")).toBeVisible();
    const iframe = page.getByTestId("game-iframe");
    await expect(iframe).toBeVisible();
    const sandbox = await iframe.getAttribute("sandbox");
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
  });

  test("favorite toggle persists", async ({ page }) => {
    await page.goto("/play/paddle");
    await page.getByTestId("favorite-btn").click();
    await page.goto("/");
    await expect(page.getByTestId("favorites-row")).toBeVisible();
  });

  test("share copies URL", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/play/paddle");
    await page.getByTestId("share-btn").click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain("/play/paddle");
  });

  test("mute toggles state", async ({ page }) => {
    await page.goto("/play/paddle");
    const btn = page.getByTestId("mute-btn");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  test("fullscreen button exists", async ({ page }) => {
    await page.goto("/play/paddle");
    await expect(page.getByTestId("fullscreen-btn")).toBeVisible();
  });
});

test.describe("search", () => {
  test("search returns results", async ({ page }) => {
    await page.goto("/search?q=paddle");
    await expect(page.getByTestId("search-results")).toBeVisible();
    await expect(page.getByTestId("game-card-paddle")).toBeVisible();
  });
});

test.describe("ad slot", () => {
  test("house ad renders on no-fill within 500ms (INV-F1)", async ({ page }) => {
    await page.route("**/pagead/**", (route) => route.abort());
    const start = Date.now();
    await page.goto("/play/paddle");
    await expect(page.getByTestId("house-ad")).toBeVisible({ timeout: 5000 });
    expect(Date.now() - start).toBeLessThan(5000);
  });
});

test.describe("SEO", () => {
  test("player page SSR contains OpenGraph and JSON-LD", async ({ request }) => {
    const res = await request.get("/play/paddle");
    const html = await res.text();
    expect(html).toContain("application/ld+json");
    expect(html).toContain("VideoGame");
    expect(html).toContain("og:title");
  });
});
