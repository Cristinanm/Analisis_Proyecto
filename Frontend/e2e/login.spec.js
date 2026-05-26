import { test, expect } from "@playwright/test";

test("login en TransitHub", async ({ page }) => {
  await page.goto("/");

  await page.fill('input[placeholder="Usuario o correo"]', "admin@demo.com");
  await page.fill('input[placeholder="Contraseña"]', "Admin@123!");

  await page.click("text=Ingresar a TransitHub");

  await expect(
  page.getByRole("heading", { name: "TransitHub" })
).toBeVisible();
});
