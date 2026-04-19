const API_URL = "http://localhost:8000";

export async function buscarVehiculoPorPlaca(placa) {
  const response = await fetch(`${API_URL}/api/vehiculos/placa/${placa}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "No se encontró el vehículo");
  }

  return data;
}

export async function registrarMulta(payload) {
  const response = await fetch(`${API_URL}/api/multas`, {
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