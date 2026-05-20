const API_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "Ocurrió un error con vehículos.");
  }

  return data;
}

export function listarVehiculos() {
  return request("/api/vehiculos/");
}

export function crearVehiculo(payload, token) {
  return request("/api/vehiculos/", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

export function editarVehiculo(vehiculo_id, payload) {
    return request(`/api/vehiculos/${vehiculo_id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function eliminarVehiculo(vehiculo_id) {
    return request(`/api/vehiculos/${vehiculo_id}`, {
        method: "DELETE",
    });
}