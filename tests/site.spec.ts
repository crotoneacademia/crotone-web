import { test, expect } from "@playwright/test";
const routes = ["/", "/ai-fundamentals", "/research", "/about"];
for (const width of [1440, 1200, 1024, 768, 430, 390]) {
  test(`Pages render without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main h1")).toBeVisible();
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
          path: `test-results/${route === "/" ? "home" : route.slice(1)}-${width}.png`,
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
  ]) {
    expect((await request.get(url)).status(), url).toBe(200);
  }
});
