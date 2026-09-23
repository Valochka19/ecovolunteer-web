import { expect, test } from "@playwright/test";
import {
  SUPABASE_PASSWORD_GRANT,
  demoCredentials,
  hasDemoCredentials,
  mockLoginFailure,
} from "./helpers";

test.describe("Login form", () => {
  test("empty submit is blocked by required fields and sends no request", async ({ page }) => {
    let authRequests = 0;
    await page.route(/\/auth\/v1\//, (route) => {
      authRequests += 1;
      return route.continue();
    });

    await page.goto("/login");
    await page.getByRole("button", { name: "Войти" }).click();

    // Native validation keeps us on the page and never calls the backend.
    await expect(page).toHaveURL(/\/login$/);
    const emailInvalid = await page
      .getByLabel("Email")
      .evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(emailInvalid).toBe(true);
    expect(authRequests).toBe(0);
  });

  test("wrong credentials show an inline error and keep the user on /login", async ({ page }) => {
    await mockLoginFailure(page);

    await page.goto("/login");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Пароль").fill("definitely-wrong");
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page.getByText("Неверный email или пароль")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("submit button is disabled while the request is in flight", async ({ page }) => {
    // Hold the auth response so the intermediate UI state is observable and not timing-dependent.
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(SUPABASE_PASSWORD_GRANT, async (route) => {
      await gate;
      await route.fulfill({ status: 400, contentType: "application/json", body: "{}" });
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Пароль").fill("whatever");
    const submit = page.getByRole("button", { name: "Войти" });
    await submit.click();

    await expect(submit).toBeDisabled();
    release();
    await expect(submit).toBeEnabled();
  });

  test("valid account reaches the dashboard", async ({ page }) => {
    test.skip(
      !hasDemoCredentials,
      "Set E2E_EMAIL and E2E_PASSWORD to run against a real Supabase account"
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill(demoCredentials.email!);
    await page.getByLabel("Пароль").fill(demoCredentials.password!);
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });
});
