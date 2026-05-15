import { useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/reportes/ingresos-recaudados";

const OPCIONES_AGRUPACION = [
  { value: "dia", label: "Por día" },
  { value: "mes", label: "Por mes" },
  { value: "anio", label: "Por año" },
];

function IngresosRecaudados() {
  const [agrupacion, setAgrupacion] = useState("dia");
  const [datos, setDatos] = useState({
    agrupacion: "dia",
    total_general: 0,
    items: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState("");

  const totalMultas = useMemo(() => {
    return datos.items.reduce(
      (total, item) => total + Number(item.cantidad_multas || 0),
      0
    );
  }, [datos.items]);

  const obtenerIngresos = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}?agrupacion=${agrupacion}`);

      if (!response.ok) {
        throw new Error("No se pudieron obtener los ingresos recaudados.");
      }

      const data = await response.json();

      setDatos({
        agrupacion: data.agrupacion || agrupacion,
        total_general: data.total_general || 0,
        items: Array.isArray(data.items) ? data.items : [],
      });

      setUltimaActualizacion(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Ocurrió un error al cargar los ingresos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerIngresos();
  }, [agrupacion]);

  const textoAgrupacion =
    agrupacion === "dia" ? "Día" : agrupacion === "mes" ? "Mes" : "Año";

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-zinc-100 shadow-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            RF-64
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Ingresos Recaudados
          </h2>

          <p className="mt-2 text-zinc-400">
            Consulta el total recaudado por día, mes o año.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={agrupacion}
            onChange={(e) => setAgrupacion(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100"
          >
            {OPCIONES_AGRUPACION.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={obtenerIngresos}
            className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-700 bg-red-900/40 p-4 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
            Total recaudado
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">
            Q {Number(datos.total_general || 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
            Multas pagadas
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-300">
            {totalMultas}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
            Agrupación
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-300">
            {textoAgrupacion}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-400">Cargando ingresos...</p>
      ) : datos.items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 text-zinc-400">
          No hay ingresos registrados todavía. Esto puede pasar si aún no existen multas pagadas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-zinc-950/80">
              <tr className="text-left text-zinc-400">
                <th className="px-4 py-3">Periodo</th>
                <th className="px-4 py-3">Cantidad de multas</th>
                <th className="px-4 py-3">Total recaudado</th>
              </tr>
            </thead>

            <tbody>
              {datos.items.map((item) => (
                <tr
                  key={item.periodo}
                  className="border-t border-zinc-800 text-zinc-200"
                >
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
                      {item.periodo}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {item.cantidad_multas}
                  </td>

                  <td className="px-4 py-3 font-semibold text-emerald-300">
                    Q {Number(item.total_recaudado || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ultimaActualizacion && (
        <p className="mt-4 text-xs text-zinc-500">
          Última actualización: {ultimaActualizacion}
        </p>
      )}
    </section>
  );
}

export default IngresosRecaudados;