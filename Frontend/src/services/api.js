const API_URL = "http://127.0.0.1:8000";

export async function buscarVehiculoPorPlaca(placa) {
  const response = await fetch(`${API_URL}/api/vehiculos/placa/${placa}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "No se encontró el vehículo");
  }

  return data;
}

export async function registrarMulta(payload) {
  const response = await fetch(`${API_URL}/api/multas/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "No se pudo registrar la multa");
  }

  return data;
}

export async function crearPropietario(payload) {
  const response = await fetch(`${API_URL}/api/propietarios/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "No se pudo registrar el propietario");
  }

  return data;
}

export async function buscarPropietarios({ dpi, nombre }) {
  const params = new URLSearchParams();

  if (dpi) params.append("dpi", dpi);
  if (nombre) params.append("nombre", nombre);

  const response = await fetch(`${API_URL}/api/propietarios/buscar?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "No se pudieron consultar propietarios");
  }

  return data;
}

export async function actualizarPropietario(propietarioId, payload) {
  const response = await fetch(`${API_URL}/api/propietarios/${propietarioId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "No se pudo actualizar el propietario");
  }

  return data;
}
