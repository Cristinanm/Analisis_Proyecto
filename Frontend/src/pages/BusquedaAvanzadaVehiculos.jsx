import { useState } from "react";

export default function BusquedaAvanzadaVehiculos() {
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [propietario, setPropietario] = useState("");
  const [resultados, setResultados] = useState([]);

  const buscar = async () => {
    try {
      const params = new URLSearchParams();

      if (placa) params.append("placa", placa);
      if (marca) params.append("marca", marca);
      if (propietario) params.append("propietario", propietario);

      const res = await fetch(
        `http://127.0.0.1:8000/api/vehiculos/buscar?${params}`
      );

      const data = await res.json();
      setResultados(data);
    } catch (error) {
      console.error("Error al buscar:", error);
    }
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2 style={{ marginBottom: "20px" }}>
        🔍 Búsqueda Avanzada de Vehículos
      </h2>

      {/* 🔹 FILTROS */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          placeholder="Placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px" }}
        />

        <input
          placeholder="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px" }}
        />

        <input
          placeholder="Propietario"
          value={propietario}
          onChange={(e) => setPropietario(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px" }}
        />

        <button
          onClick={buscar}
          style={{
            backgroundColor: "#22c55e",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Buscar
        </button>
      </div>

      {/* 🔹 RESULTADOS */}
      {resultados.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No hay resultados</p>
      ) : (
        <table
          style={{
            marginTop: "20px",
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1f2937" }}>
              <th style={{ padding: "10px", border: "1px solid #444" }}>
                Placa
              </th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>
                Marca
              </th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>
                Propietario
              </th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((v) => (
              <tr key={v.id}>
                <td style={{ padding: "10px", border: "1px solid #444" }}>
                  {v.placa}
                </td>
                <td style={{ padding: "10px", border: "1px solid #444" }}>
                  {v.marca}
                </td>
                <td style={{ padding: "10px", border: "1px solid #444" }}>
                  {v.propietario}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}