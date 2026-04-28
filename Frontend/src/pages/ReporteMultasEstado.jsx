import { useEffect, useState } from "react";

function ReporteMultasEstado() {
  const [resumen, setResumen] = useState({
    total_pagadas: 0,
    total_pendientes: 0,
    total_multas: 0,
    items: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState("");

  const obtenerConteoMultas = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/reportes/multas-estado");

      if (!response.ok) {
        throw new Error("No se pudo obtener el conteo de multas por estado.");
      }

      const data = await response.json();
      setResumen(data);
      setUltimaActualizacion(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Ocurrio un error al obtener la informacion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerConteoMultas();

    const intervalo = setInterval(() => {
      obtenerConteoMultas();
    }, 10000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Reportes
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Conteo de Multas por Estado
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Resumen del total de multas pagadas y pendientes.
          </p>
        </div>

        <button
          onClick={obtenerConteoMultas}
          className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading && (
        <p className="mt-4 text-sm text-zinc-400">
          Actualizando datos...
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-sm text-emerald-200">Total de multas pagadas</p>
          <p className="mt-2 text-4xl font-bold text-emerald-300">
            {resumen.total_pagadas}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <p className="text-sm text-amber-200">Total de multas pendientes</p>
          <p className="mt-2 text-4xl font-bold text-amber-300">
            {resumen.total_pendientes}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-300">Total de multas registradas</p>
          <p className="mt-2 text-4xl font-bold text-zinc-100">
            {resumen.total_multas}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-zinc-950/70">
            <tr className="text-left text-zinc-400">
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2">Visualizacion</th>
            </tr>
          </thead>

          <tbody>
            {(resumen.items || []).map((item) => (
              <tr key={item.estado} className="border-t border-zinc-900">
                <td className="px-3 py-3">{item.estado}</td>
                <td className="px-3 py-3 font-semibold">{item.total}</td>
                <td className="px-3 py-3">
                  <span
                    className={
                      item.estado === "Pagadas"
                        ? "rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200"
                        : "rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200"
                    }
                  >
                    {item.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ultimaActualizacion && (
        <p className="mt-4 text-xs text-zinc-500">
          Ultima actualizacion: {ultimaActualizacion}
        </p>
      )}
    </section>
  );
}

export default ReporteMultasEstado;