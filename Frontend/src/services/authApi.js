const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.mensaje || "Ocurrio un error en autenticacion.");
  }
  return data;
}

export function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyProfile(token) {
  return request("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function forgotPassword(correo) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ correo }),
  });
}

export function resetPassword(token, nuevaContrasena) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, nueva_contrasena: nuevaContrasena }),
  });
}
