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
}

test("E2E - consultar multa", async ({ page }) => {
  await login(page);

  await page.click("text=Control de Infracciones");

  await page.fill(
    'input[placeholder*="placa"]',
    "P123ABC"
  );

  await page.click("text=Consultar");

  await expect(
    page.getByText("P123ABC")
  ).toBeVisible();
});