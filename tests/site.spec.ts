import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/ai-fundamentals",
  "/ai-fundamentals/from-turing-to-agentic-ai",
  "/research",
  "/about",
];
for (const width of [1440, 1200, 1024, 768, 430, 390]) {
  test(`Pages render without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      if (route !== "/ai-fundamentals/from-turing-to-agentic-ai") {
        await expect(page.locator("main h1")).toHaveCount(1);
        await expect(page.locator("main h1")).toBeVisible();
        expect(
          await page.locator(".site-header .wordmark img").evaluate(
            (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
          ),
        ).toBe(true);
      } else {
        await expect(page.locator(".lesson-shell")).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://crotone.academy${route === "/" ? "/" : route}`,
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        "https://crotone.academy/img/brand/social-preview.png",
      );
      if (width === 1440 || width === 390)
        await page.screenshot({
          path: `test-results/${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${width}.png`,
          fullPage: true,
        });
    }
    expect(errors).toEqual([]);
  });
}
test("Desktop links and course content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore our work" }).click();
  await expect(page).toHaveURL(/#current-work$/);
  await page
    .getByRole("link", { name: "AI Fundamentals", exact: true })
    .click();
  await expect(page.locator(".learning-journey li")).toHaveCount(12);
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText(
    "AI Fundamentals",
  );
  await page.getByRole("link", { name: "Research", exact: true }).click();
  await expect(
    page.getByText("not a claimed solution", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Curiosity is our starting point." }),
  ).toBeVisible();
});
test("Interactive lesson navigation and learning activities", async ({ page }) => {
  await page.goto("/ai-fundamentals/from-turing-to-agentic-ai");
  await expect(page.locator(".lesson-stage")).toBeInViewport();
  await expect(page.getByRole("heading", { name: /A conversation from 1950/ }))
    .toBeVisible();

  await page.getByRole("button", { name: "Next slide" }).click();
  await expect(page.getByRole("heading", { name: "Turing changes the question." }))
    .toBeVisible();
  await page.getByRole("button", { name: "Read the deeper context" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Turing changed the question." }))
    .toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Agentic AI", exact: true }).click();
  await expect(page.getByRole("heading", { name: /The model gets connected/ }))
    .toBeVisible();
  await page.getByRole("button", { name: "Next slide" }).click();
  await page.getByRole("button", { name: /Advance example|Replay one cycle/ }).click();
  await expect(page.locator(".agent-loop-example")).toBeVisible();

  await page.getByRole("button", { name: "Enter presentation" }).click();
  await expect(page.locator(".lesson-shell")).toHaveClass(/is-presenting/);
  await expect(page.locator(".lesson-rail")).toBeVisible();
  await page.getByRole("button", { name: "Exit presentation" }).click();
  await expect(page.locator(".lesson-shell")).not.toHaveClass(/is-presenting/);
});
test("Every lecture scene stays readable without horizontal overflow", async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ai-fundamentals/from-turing-to-agentic-ai#lesson");
    await page.getByRole("button", { name: "The question" }).click();
    const next = page.getByRole("button", { name: "Next slide" });
    for (let scene = 0; scene < 16; scene += 1) {
      await expect(page.locator(".lecture-heading h2")).toBeVisible();
      await expect(page.locator(".lecture-notes")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (scene < 15) await next.click();
    }
  }
});
test("Mobile menu, keyboard dismissal, and navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu +" });
  await toggle.click();
  await expect(page.locator("#main-navigation")).toBeVisible();
  await page.getByRole("link", { name: "Research", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page.getByRole("link", { name: "Research", exact: true }).click();
  await expect(page).toHaveURL("/research");
  await expect(page.getByRole("button", { name: "Menu +" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
test("Local links and deployment assets exist", async ({ page, request }) => {
  const urls = new Set<string>();
  for (const route of routes) {
    await page.goto(route);
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")!)))
      urls.add(href);
  }
  for (const url of [
    ...urls,
    "/sitemap.xml",
    "/robots.txt",
    "/CNAME",
    "/img/brand/crotone-logo.png",
    "/img/brand/social-preview.png",
    "/img/lessons/agentic-convergence-cinematic.jpg",
  ]) {
    expect((await request.get(url)).status(), url).toBe(200);
  }
});
