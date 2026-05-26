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

test("E2E - registrar vehículo", async ({ page }) => {
  await login(page);

  await page.click("text=Registro Vehículos");

  await page.locator('input').first().fill("P123ABC");
  await page.locator('input').nth(1).fill("Toyota");
  await page.locator('input').nth(2).fill("Corolla");
  await page.locator('input').nth(3).fill("2022");

  await page.click("text=Registrar");

  await expect(
    page.getByText(/registrado|exitosamente/i)
  ).toBeVisible();
});