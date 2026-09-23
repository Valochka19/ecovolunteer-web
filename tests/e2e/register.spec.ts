import { expect, test } from "@playwright/test";

test.describe("Registration form", () => {
  test("password shorter than 6 characters is rejected client-side", async ({ page }) => {
    let requests = 0;
    await page.route(/\/auth\/v1\//, (route) => {
      requests += 1;
      return route.continue();
    });

    await page.goto("/register");
    await page.getByLabel("Имя / Название").fill("Тест");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Пароль").fill("123");
    await page.getByRole("button", { name: "Создать аккаунт" }).click();

    const tooShort = await page
      .getByLabel("Пароль")
      .evaluate((el: HTMLInputElement) => el.validity.tooShort);
    expect(tooShort).toBe(true);
    await expect(page).toHaveURL(/\/register$/);
    expect(requests).toBe(0);
  });

  test("role selector defaults to volunteer and can switch to organization", async ({ page }) => {
    await page.goto("/register");

    const volunteer = page.getByRole("radio", { name: "Волонтёр" });
    const organization = page.getByRole("radio", { name: "Организация" });

    await expect(volunteer).toBeChecked();
    await expect(organization).not.toBeChecked();

    await page.getByText("Организация", { exact: true }).click();

    await expect(organization).toBeChecked();
    await expect(volunteer).not.toBeChecked();
  });
});
