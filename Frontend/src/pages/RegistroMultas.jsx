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
  const [formKey, setFormKey] = useState(0);

  const manejarBusqueda = async (placa) => {
    setMensaje("");
    setError("");
    setVehiculo(null);
    setCargandoBusqueda(true);

    try {
      const data = await buscarVehiculoPorPlaca(placa);
      setVehiculo(data);
    } catch (err) {
      setError(err.message || "No se encontró el vehículo");
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
      setMensaje(response.mensaje || "Multa registrada correctamente ✅");
      setFormKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Error al registrar la multa");
    } finally {
      setCargandoRegistro(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
              Gestión de infracciones
            </span>

            <h2 className="mt-4 text-3xl font-bold text-zinc-100">
              Registro de Multas
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Consulta un vehículo por placa y registra infracciones de forma
              ordenada, clara y trazable.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4 text-right shadow-lg">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Estado del módulo
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-300">
              Activo
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-zinc-100">
            Buscar vehículo
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Ingresa la placa para cargar los datos del vehículo antes de
            registrar la multa.
          </p>
        </div>

        <BuscarVehiculo
          onBuscar={manejarBusqueda}
          cargando={cargandoBusqueda}
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-sm font-medium text-rose-200 shadow-lg">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-200 shadow-lg">
          {mensaje}
        </div>
      )}

      {vehiculo ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-zinc-100">
                Datos del vehículo
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Información asociada a la placa consultada.
              </p>
            </div>

            <DatosVehiculo vehiculo={vehiculo} />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-zinc-100">
                Nueva multa
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Completa los datos de la infracción para registrarla.
              </p>
            </div>

            <FormularioMulta
              key={formKey}
              placa={vehiculo.placa}
              onRegistrar={manejarRegistro}
              cargando={cargandoRegistro}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-8 text-center shadow-xl">
          <p className="text-sm text-zinc-400">
            Busca una placa para mostrar los datos del vehículo y habilitar el
            formulario de multa.
          </p>
        </div>
      )}
    </section>
  );
}

export default RegistroMultas;