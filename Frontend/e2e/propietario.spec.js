import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("/");

  await page.fill(
    'input[placeholder="Usuario o correo"]',
    "admin@demo.com"
  );

  await page.fill(
    'input[placeholder="Contraseña"]',
    "Admin@123!"
  );

  await page.click("text=Ingresar a TransitHub");

  await expect(
    page.getByRole("heading", { name: "TransitHub" })
  ).toBeVisible();
}

test("E2E - registrar propietario", async ({ page }) => {
  await login(page);

  await page.getByText("Registro Propietarios").click();

  await page.locator("input").nth(0).fill("1234567890101");
  await page.locator("input").nth(1).fill("Pedro E2E");
  await page.locator("input").nth(2).fill("pedro.e2e@test.com");
  await page.locator("input").nth(3).fill("55555555");
  await page.locator("textarea").fill("Guatemala");

  await page.getByRole("button", { name: /registrar propietario/i }).click();

  await page.waitForTimeout(1000);

  await expect(
    page.getByText(/error|duplicado|incorrecto|obligatorio/i)
  ).not.toBeVisible();
});