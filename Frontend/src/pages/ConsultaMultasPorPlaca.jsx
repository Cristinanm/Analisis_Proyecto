import { useState } from "react";
import { pagarMulta } from "../services/api";

const API_URL = "http://127.0.0.1:8000";

export default function ConsultaMultasPorPlaca() {
  const [placa, setPlaca] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fechasPago, setFechasPago] = useState({});
  const [resultadoPago, setResultadoPago] = useState(null);
  const [errorPago, setErrorPago] = useState("");
  const [pagandoId, setPagandoId] = useState(null);

  
  const consultar = async (e) => {
    e.preventDefault();
    setError("");
    setResultado(null);

    if (!placa.trim()) {
      setError("Debe ingresar una placa.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/consultas/multas-por-placa/${placa.trim().toUpperCase()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "No se pudo consultar la placa.");
      }

      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const cambiarFechaPago = (multaId, fecha) => {
  setFechasPago((prev) => ({
    ...prev,
    [multaId]: fecha,
  }));
};

const manejarPagarMulta = async (multaId) => {
  const fechaPago = fechasPago[multaId];

  if (!fechaPago) {
    setErrorPago("Debe seleccionar una fecha de pago.");
    return;
  }

  setErrorPago("");
  setResultadoPago(null);
  setPagandoId(multaId);

  try {
    const data = await pagarMulta(multaId, fechaPago);
    setResultadoPago(data);

    await consultar({
      preventDefault: () => {},
    });
  } catch (err) {
    setErrorPago(err.message);
  } finally {
    setPagandoId(null);
  }
};

return (
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
    <h2 className="text-2xl font-bold">
      Consulta detallada de multas por placa
    </h2>

    <p className="mt-2 text-sm text-zinc-400">
      Ingrese una placa para consultar el historial de multas pendientes y pagadas.
    </p>

    <form onSubmit={consultar} className="mt-5 flex flex-col gap-3 md:flex-row">
      <input
        value={placa}
        onChange={(e) => setPlaca(e.target.value)}
        placeholder="Ingrese número de placa"
        className="w-full rounded-xl border border-zinc-700 bg-white px-4 py-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400 md:max-w-sm"
      />

      <button
        type="submit"
        className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black hover:bg-amber-300"
      >
        {loading ? "Consultando..." : "Consultar"}
      </button>
    </form>

    {error && (
      <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-300">
        {error}
      </div>
    )}

    {resultado && (
      <div className="mt-6 space-y-5">
        <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">
          <h3 className="mb-3 text-xl font-bold text-amber-300">
            Datos del vehículo
          </h3>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <p><strong>Placa:</strong> {resultado.vehiculo.placa}</p>
            <p><strong>Marca:</strong> {resultado.vehiculo.marca}</p>
            <p><strong>Modelo:</strong> {resultado.vehiculo.modelo}</p>
            <p><strong>Año:</strong> {resultado.vehiculo.anio}</p>
            <p className="md:col-span-2">
              <strong>Propietario:</strong>{" "}
              {resultado.vehiculo.propietario || "No registrado"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold">Historial de multas</h3>

            <div className="rounded-lg bg-red-500/10 px-4 py-2 font-semibold text-red-300">
              Total adeudado: Q {Number(resultado.total_adeudado).toFixed(2)}
            </div>
          </div>

          {resultado.multas.length === 0 ? (
            <p className="rounded-lg border border-zinc-700 p-4 text-center text-zinc-300">
              El vehículo no presenta multas registradas
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-zinc-700">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 text-zinc-200">
                    <tr>
                      <th className="p-3 text-left">Fecha</th>
                      <th className="p-3 text-left">Descripción</th>
                      <th className="p-3 text-left">Monto base</th>
                      <th className="p-3 text-left">Estado</th>
                      <th className="p-3 text-left">Mora/Descuento</th>
                      <th className="p-3 text-left">Monto actualizado</th>
                      <th className="p-3 text-left">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resultado.multas.map((multa) => (
                      <tr key={multa.id} className="border-t border-zinc-800">
                        <td className="p-3">{multa.fecha}</td>
                        <td className="p-3">{multa.descripcion}</td>
                        <td className="p-3">
                          Q {Number(multa.monto_base).toFixed(2)}
                        </td>

                        <td className="p-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              multa.estado === "pendiente"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {multa.estado}
                          </span>
                        </td>

                        <td className="p-3">
                          Q {Number(multa.descuento_mora || 0).toFixed(2)}
                        </td>

                        <td className="p-3 font-semibold text-emerald-300">
                          Q {Number(multa.monto_actualizado || multa.monto_base).toFixed(2)}
                        </td>

                        <td className="p-3">
                          {multa.estado === "pendiente" ? (
                            <div className="flex min-w-[170px] flex-col gap-2">
                              <input
                                type="date"
                                value={fechasPago[multa.id] || ""}
                                onChange={(e) =>
                                  cambiarFechaPago(multa.id, e.target.value)
                                }
                                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                              />

                              <button
                                type="button"
                                onClick={() => manejarPagarMulta(multa.id)}
                                disabled={pagandoId === multa.id}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                              >
                                {pagandoId === multa.id
                                  ? "Procesando..."
                                  : "Pagar multa"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-zinc-400">Pagada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {errorPago && (
                <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-300">
                  {errorPago}
                </div>
              )}

              {resultadoPago && (
                <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-100">
                  <h4 className="mb-2 font-bold">{resultadoPago.mensaje}</h4>

                  <p>
                    Monto original: Q{" "}
                    {Number(resultadoPago.monto_original).toFixed(2)}
                  </p>
                  <p>Días de retraso: {resultadoPago.dias_retraso}</p>
                  <p>
                    Mora aplicada: Q{" "}
                    {Number(resultadoPago.monto_mora_aplicado).toFixed(2)}
                  </p>
                  <p>
                    Descuento aplicado: Q{" "}
                    {Number(resultadoPago.descuento_aplicado).toFixed(2)}
                  </p>

                  <p className="mt-2 text-lg font-bold">
                    Total a pagar: Q{" "}
                    {Number(resultadoPago.monto_total_a_pagar).toFixed(2)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )}
  </section>
);
}