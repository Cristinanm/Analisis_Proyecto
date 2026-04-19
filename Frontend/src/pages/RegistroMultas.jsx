import { useState } from "react";
import BuscarVehiculo from "../components/BuscarVehiculo";
import DatosVehiculo from "../components/DatosVehiculo";
import FormularioMulta from "../components/FormularioMulta";
import { buscarVehiculoPorPlaca, registrarMulta } from "../services/api";

function RegistroMultas() {
  const [vehiculo, setVehiculo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);

  const manejarBusqueda = async (placa) => {
    setMensaje("");
    setError("");
    setVehiculo(null);
    setCargandoBusqueda(true);

    try {
      const data = await buscarVehiculoPorPlaca(placa);
      setVehiculo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoBusqueda(false);
    }
  };

  const manejarRegistro = async (datosMulta) => {
    setMensaje("");
    setError("");
    setCargandoRegistro(true);

    try {
      const response = await registrarMulta(datosMulta);
      setMensaje(response.mensaje || "Multa registrada correctamente");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoRegistro(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Registro de Multas</h1>

      <BuscarVehiculo
        onBuscar={manejarBusqueda}
        cargando={cargandoBusqueda}
      />

      {error && <div style={styles.errorBox}>{error}</div>}
      {mensaje && <div style={styles.successBox}>{mensaje}</div>}

      {vehiculo && (
        <>
          <DatosVehiculo vehiculo={vehiculo} />
          <FormularioMulta
            placa={vehiculo.placa}
            onRegistrar={manejarRegistro}
            cargando={cargandoRegistro}
          />
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
};

export default RegistroMultas;