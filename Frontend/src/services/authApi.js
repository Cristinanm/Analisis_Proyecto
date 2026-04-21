const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

export function listUsers(token) {
  return request("/auth/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateUserRole(token, userId, rol) {
  return request(`/auth/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rol }),
  });
}

export function updateUserStatus(token, userId, activo) {
  return request(`/auth/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ activo }),
  });
}

export function createUserByAdmin(token, payload) {
  return request("/auth/admin/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateUserByAdmin(token, userId, payload) {
  return request(`/auth/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteUserByAdmin(token, userId) {
  return request(`/auth/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
