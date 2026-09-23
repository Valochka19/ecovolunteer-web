import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows the product name and both entry points", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "EcoVolunteer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Войти" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Регистрация" })).toBeVisible();
  });

  test("login button navigates to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Войти" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();
  });
});
