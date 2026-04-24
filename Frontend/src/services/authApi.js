const API_URL = "http://127.0.0.1:8000";

function extractErrorMessage(data) {
  if (!data) return "Ocurrio un error en autenticacion.";

  if (typeof data.detail === "string") return data.detail;
  if (typeof data.mensaje === "string") return data.mensaje;

  if (Array.isArray(data.detail)) {
    const messages = data.detail
      .map((item) => {
        if (!item || typeof item !== "object") return String(item || "");
        const field = Array.isArray(item.loc) ? item.loc.join(".") : "campo";
        const msg = item.msg || "valor invalido";
        return `${field}: ${msg}`;
      })
      .filter(Boolean);

    if (messages.length > 0) return messages.join(" | ");
  }

  if (typeof data.detail === "object") {
    try {
      return JSON.stringify(data.detail);
    } catch {
      return "Ocurrio un error en autenticacion.";
    }
  }

  return "Ocurrio un error en autenticacion.";
}

async function request(path, options = {}) {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
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
