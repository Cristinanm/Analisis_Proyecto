import { useState } from "react";

function BuscarVehiculo({ onBuscar, cargando }) {
  const [placa, setPlaca] = useState("");

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (!placa.trim()) {
      alert("Debe ingresar una placa");
      return;
    }

    onBuscar(placa.trim().toUpperCase());
  };

  return (
    <form onSubmit={manejarSubmit} style={styles.form}>
      <label style={styles.label}>Número de placa</label>
      <input
        type="text"
        value={placa}
        onChange={(e) => setPlaca(e.target.value)}
        placeholder="Ej. P123ABC"
        style={styles.input}
      />

      <button type="submit" style={styles.button} disabled={cargando}>
        {cargando ? "Buscando..." : "Buscar vehículo"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
    padding: "20px",
    backgroundColor: "#f4f6f8",
    borderRadius: "10px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
};

export default BuscarVehiculo;