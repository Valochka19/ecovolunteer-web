import type { Page } from "@playwright/test";

/**
 * Supabase auth endpoint used by the login form. We intercept it in tests that must be
 * deterministic regardless of network / project state: the free Supabase project pauses
 * when idle, which would otherwise make "wrong password" tests flaky.
 */
export const SUPABASE_PASSWORD_GRANT = /\/auth\/v1\/token\?grant_type=password/;

export async function mockLoginFailure(page: Page) {
  await page.route(SUPABASE_PASSWORD_GRANT, (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        error: "invalid_grant",
        error_description: "Invalid login credentials",
      }),
    })
  );
}

export const demoCredentials = {
  email: process.env.E2E_EMAIL,
  password: process.env.E2E_PASSWORD,
};

export const hasDemoCredentials = Boolean(
  demoCredentials.email && demoCredentials.password
);
