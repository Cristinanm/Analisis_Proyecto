import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("/");

  await page.fill('input[placeholder="Usuario o correo"]', "admin@demo.com");
  await page.fill('input[placeholder="Contraseña"]', "Admin@123!");

  await page.click("text=Ingresar a TransitHub");

  await expect(
    page.getByRole("heading", { name: "TransitHub" })
  ).toBeVisible();
}

test("E2E - registrar multa", async ({ page }) => {
  await login(page);

  await page.click("text=Registro de Multas");

  // 1. Buscar vehículo por placa
  await page.locator("input").first().fill("P123ABC");

 await page.getByRole("button", { name: "Buscar vehiculo" }).click();

  // 2. Esperar a que aparezca el formulario de multa
  await expect(
  page.getByRole("heading", { name: /Registrar multa para/i })
  ).toBeVisible();

  // 3. Llenar formulario de multa
  await page.locator("input").nth(1).fill("2026-05-25");
  await page.locator("input").nth(2).fill("Exceso de velocidad");
  await page.locator("textarea").fill("Vehículo excedió el límite permitido");
  await page.locator("input").nth(3).fill("500");

  // 4. Registrar
  await page.getByRole("button", { name: /registrar/i }).click();

  // 5. Validar que no haya error
  await page.waitForTimeout(1000);

  await expect(
    page.getByText(/error|no se encontró|inválido|obligatorio/i)
  ).not.toBeVisible();
});