import { expect, test } from "@playwright/test";

test("home page renders the primary funeral-planning content", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Last Planner Julz/i);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test("home page has no horizontal overflow on a narrow mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test("backend readiness endpoint is reachable from the browser", async ({
  request,
}) => {
  const response = await request.get("http://127.0.0.1:5000/api/health/ready");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({
    status: "ready",
  });
});

test("cookie preference can be saved and changed later", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Essential only" }).click();
  await page.getByRole("button", { name: "Change cookie preferences" }).click();
  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toBeVisible();
});

test("chat widget sends a question and renders a site link", async ({
  page,
}) => {
  await page.route("**/api/chat/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ available: true }),
    });
  });
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        reply: "You can request a consultation at /plan.",
      }),
    });
  });

  await page.goto("/");
  const essentialConsent = page.getByRole("button", {
    name: "Essential only",
  });
  if (await essentialConsent.isVisible()) {
    await essentialConsent.click();
  }
  await page.getByRole("button", { name: "Open Julz Assistant chat" }).click();
  const input = page.getByRole("textbox", {
    name: "Ask about packages, products, or planning",
  });
  await input.fill("How do I request a consultation?");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("link", { name: "/plan" })).toHaveAttribute(
    "href",
    "/plan",
  );
});

test("public routes receive route-specific metadata", async ({ page }) => {
  for (const [path, title] of [
    ["/plan", /Plan Ahead with Confidence/i],
    ["/packages", /Funeral Planning Packages/i],
    ["/catalog", /Funeral Products and Services/i],
  ]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${new URL(page.url()).origin}${path}`,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index,follow",
    );
  }
});
