import { useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/propietarios";

export default function HistorialPropietarios() {
  const [propietarios, setPropietarios] = useState([]);
  const [historial, setHistorial] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarPropietarios = async () => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/`);

      if (!response.ok) {
        throw new Error("Error al cargar propietarios");
      }

      const data = await response.json();
      setPropietarios(data);
    } catch (error) {
      setError("No se pudieron cargar los propietarios.");
    }
  };

  const consultarHistorial = async (id) => {
    setCargando(true);
    setError("");
    setHistorial(null);

    try {
      const response = await fetch(`${API_URL}/${id}/historial`);

      if (!response.ok) {
        throw new Error("No se pudo consultar el historial.");
      }

      const data = await response.json();
      setHistorial(data);
    } catch (error) {
      setError("No se pudo consultar el historial del propietario.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const propietariosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return propietarios.filter((propietario) => {
      return (
        propietario.nombre?.toLowerCase().includes(texto) ||
        propietario.dpi?.toLowerCase().includes(texto) ||
        propietario.correo?.toLowerCase().includes(texto)
      );
    });
  }, [propietarios, busqueda]);

  return (
    <section className="min-h-screen bg-[#090b10] text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
  <div>
    <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
        Módulo de Historial de Propietarios
    </p>

    <h1 className="mt-2 text-3xl font-bold text-white">
      Historial por Propietarios
    </h1>

    <p className="mt-2 text-sm text-zinc-400">
      Consulta los propietarios registrados y visualiza su historial asociado.
    </p>
  </div>

  <button
    onClick={cargarPropietarios}
    className="rounded-xl border border-blue-500 px-5 py-3 text-sm font-semibold text-blue-400 transition hover:bg-blue-600 hover:text-white"
  >
    Actualizar
  </button>
</header>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl">
          <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 p-5 md:flex-row md:items-center">
            <h2 className="text-lg font-bold text-blue-400">
              Propietarios registrados ({propietariosFiltrados.length})
            </h2>

            <input
              type="text"
              placeholder="Buscar propietario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 md:w-80"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/70 text-zinc-300">
                <tr>
                  <th className="px-5 py-4">Nombre</th>
                  <th className="px-5 py-4">DPI</th>
                  <th className="px-5 py-4">Correo</th>
                  <th className="px-5 py-4">Dirección</th>
                  <th className="px-5 py-4">Teléfono</th>
                  <th className="px-5 py-4 text-center">Acción</th>
                </tr>
              </thead>

              <tbody>
                {propietariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-zinc-500">
                      No hay propietarios registrados.
                    </td>
                  </tr>
                ) : (
                  propietariosFiltrados.map((propietario) => (
                    <tr
                      key={propietario.id}
                      className="border-t border-zinc-800 transition hover:bg-zinc-800/60"
                    >
                      <td className="px-5 py-4 font-semibold text-white">
                        {propietario.nombre}
                      </td>
                      <td className="px-5 py-4 text-zinc-300">{propietario.dpi}</td>
                      <td className="px-5 py-4 text-zinc-300">{propietario.correo}</td>
                      <td className="px-5 py-4 text-zinc-300">{propietario.direccion}</td>
                      <td className="px-5 py-4 text-zinc-300">{propietario.telefono}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => consultarHistorial(propietario.id)}
                          className="rounded-lg border border-blue-500 px-4 py-2 text-xs font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white"
                        >
                          👁 Ver historial
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {cargando && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-300">
            Cargando historial...
          </div>
        )}

        {historial && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl">
            <div className="border-b border-zinc-800 p-5">
              <h2 className="text-xl font-bold text-white">
                Historial de:{" "}
                <span className="text-blue-400">
                  {historial.propietario.nombre}
                </span>
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                DPI: {historial.propietario.dpi} | Teléfono:{" "}
                {historial.propietario.telefono}
              </p>
            </div>

            <div className="space-y-6 p-5">
              <div>
                <h3 className="mb-3 text-lg font-bold text-blue-400">
                  🚗 Vehículos asociados ({historial.vehiculos.length})
                </h3>

                {historial.vehiculos.length === 0 ? (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-500">
                    No tiene vehículos asociados.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-950 text-zinc-300">
                        <tr>
                          <th className="px-5 py-3">Placa</th>
                          <th className="px-5 py-3">Marca</th>
                          <th className="px-5 py-3">Modelo</th>
                          <th className="px-5 py-3">Año</th>
                        </tr>
                      </thead>

                      <tbody>
                        {historial.vehiculos.map((vehiculo) => (
                          <tr key={vehiculo.id} className="border-t border-zinc-800">
                            <td className="px-5 py-3 font-semibold text-white">
                              {vehiculo.placa}
                            </td>
                            <td className="px-5 py-3 text-zinc-300">
                              {vehiculo.marca}
                            </td>
                            <td className="px-5 py-3 text-zinc-300">
                              {vehiculo.modelo}
                            </td>
                            <td className="px-5 py-3 text-zinc-300">
                              {vehiculo.anio}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-lg font-bold text-blue-400">
                  🎫 Multas registradas ({historial.multas.length})
                </h3>

                {historial.multas.length === 0 ? (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-500">
                    No tiene multas registradas.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-950 text-zinc-300">
                        <tr>
                          <th className="px-5 py-3">Fecha</th>
                          <th className="px-5 py-3">Placa</th>
                          <th className="px-5 py-3">Infracción</th>
                          <th className="px-5 py-3">Descripción</th>
                          <th className="px-5 py-3">Monto</th>
                          <th className="px-5 py-3">Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        {historial.multas.map((multa) => (
                          <tr key={multa.id} className="border-t border-zinc-800">
                            <td className="px-5 py-3 text-zinc-300">
                              {multa.fecha}
                            </td>
                            <td className="px-5 py-3 text-zinc-300">
                              {multa.placa || "N/A"}
                            </td>
                            <td className="px-5 py-3 font-semibold text-white">
                              {multa.tipo_infraccion}
                            </td>
                            <td className="px-5 py-3 text-zinc-300">
                              {multa.descripcion}
                            </td>
                            <td className="px-5 py-3 font-bold text-white">
                              Q{multa.monto_base}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  multa.estado?.toLowerCase() === "pagada"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-yellow-500/20 text-yellow-300"
                                }`}
                              >
                                {multa.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}