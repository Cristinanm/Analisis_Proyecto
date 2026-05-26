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

test("E2E - pagar multa desde control de infracciones", async ({ page }) => {
  await login(page);

  // Ir al módulo
  await page.getByText("Control de Infracciones").click();

  // Buscar placa
  await page.locator("input").first().fill("P123ABC");

  await page.getByRole("button", { name: /buscar|consultar/i }).click();

  // Esperar tabla
  await expect(
    page.getByText(/Historial de multas/i)
  ).toBeVisible();

  // Colocar fecha de pago
  await page.locator('input[type="date"]').last().fill("2026-05-25");

  // Click en pagar multa
  await page.getByRole("button", { name: /Pagar multa/i }).last().click();

  // Esperar actualización
  await page.waitForTimeout(2000);

  // Validar estado pagada
  await expect(
    page.getByText(/pagada/i).last()
  ).toBeVisible();
});