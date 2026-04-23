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

  const [formKey, setFormKey] = useState(0); // 🔥 clave para reiniciar formulario

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

      setFormKey(prev => prev + 1);

    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoRegistro(false);
    }
  };

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Operacion</p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-100">Registro de Multas</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Consulta por placa y registra infracciones con trazabilidad para el vehiculo seleccionado.
        </p>
      </header>

      <BuscarVehiculo onBuscar={manejarBusqueda} cargando={cargandoBusqueda} />

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {vehiculo && (
        <div className="space-y-4">
          <DatosVehiculo vehiculo={vehiculo} />

          <FormularioMulta
            key={formKey}
            placa={vehiculo.placa}
            onRegistrar={manejarRegistro}
            cargando={cargandoRegistro}
          />

          {mensaje && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {mensaje}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default RegistroMultas;
