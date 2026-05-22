import { describe, expect, it, vi, beforeEach } from "vitest";
import { loginUser, registerUser } from "./authApi";

describe("SIS-40 authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia login al endpoint correcto", async () => {
    const mockResponse = { access_token: "token123", token_type: "bearer" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const payload = { usuario_o_correo: "admin", contrasena: "Admin@123!" };
    const data = await loginUser(payload);

    expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    expect(data).toEqual(mockResponse);
  });

  it("retorna mensaje de error en registro cuando backend falla", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: "El correo electronico ya esta registrado." }),
    });

    const payload = {
      nombres: "Ana",
      apellidos: "Perez",
      nombre_usuario: "anauser",
      correo: "ana@test.com",
      contrasena: "Ana12345!",
    };

    await expect(registerUser(payload)).rejects.toThrow(
      "El correo electronico ya esta registrado.",
    );
  });
});
