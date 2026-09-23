import { expect, test } from "@playwright/test";

test.describe("Route protection (middleware)", () => {
  test("anonymous visit to /dashboard is redirected to /login", async ({ page }) => {
    const response = await page.goto("/dashboard");

    // Middleware issues a redirect; the final document is the login page.
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("public pages stay reachable without a session", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/register");
    await expect(page).toHaveURL(/\/register$/);
  });
});
