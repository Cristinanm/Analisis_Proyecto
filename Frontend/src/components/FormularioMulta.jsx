import { useState } from "react";

function FormularioMulta({ placa, onRegistrar, cargando }) {
  const [formData, setFormData] = useState({
    fecha: "",
    tipo_infraccion: "",
    descripcion: "",
    monto_base: "",
  });

  const [errores, setErrores] = useState({});

  const validar = () => {
    const nuevosErrores = {};

    if (!formData.fecha) nuevosErrores.fecha = "La fecha es obligatoria";
    if (!formData.tipo_infraccion.trim()) {
      nuevosErrores.tipo_infraccion = "El tipo de infracción es obligatorio";
    }
    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    }
    if (!formData.monto_base || Number(formData.monto_base) <= 0) {
      nuevosErrores.monto_base = "El monto base debe ser mayor que 0";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (!validar()) return;

    onRegistrar({
      placa,
      fecha: formData.fecha,
      tipo_infraccion: formData.tipo_infraccion,
      descripcion: formData.descripcion,
      monto_base: Number(formData.monto_base),
    });
  };

  return (
    <form onSubmit={manejarSubmit} style={styles.form}>
      <h3>Registrar multa</h3>

      <div style={styles.group}>
        <label>Fecha</label>
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={manejarCambio}
          style={styles.input}
        />
        {errores.fecha && <span style={styles.error}>{errores.fecha}</span>}
      </div>

      <div style={styles.group}>
        <label>Tipo de infracción</label>
        <input
          type="text"
          name="tipo_infraccion"
          value={formData.tipo_infraccion}
          onChange={manejarCambio}
          style={styles.input}
          placeholder="Ej. Exceso de velocidad"
        />
        {errores.tipo_infraccion && (
          <span style={styles.error}>{errores.tipo_infraccion}</span>
        )}
      </div>

      <div style={styles.group}>
        <label>Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={manejarCambio}
          style={styles.textarea}
          placeholder="Detalle de la infracción"
        />
        {errores.descripcion && (
          <span style={styles.error}>{errores.descripcion}</span>
        )}
      </div>

      <div style={styles.group}>
        <label>Monto base</label>
        <input
          type="number"
          name="monto_base"
          value={formData.monto_base}
          onChange={manejarCambio}
          style={styles.input}
          placeholder="Ej. 500"
        />
        {errores.monto_base && (
          <span style={styles.error}>{errores.monto_base}</span>
        )}
      </div>

      <div style={styles.estado}>
        <strong>Estado inicial:</strong> pendiente
      </div>

      <button type="submit" style={styles.button} disabled={cargando}>
        {cargando ? "Registrando..." : "Registrar multa"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    minHeight: "90px",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#16a34a",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  estado: {
    backgroundColor: "#fef3c7",
    padding: "10px",
    borderRadius: "8px",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
};

export default FormularioMulta;