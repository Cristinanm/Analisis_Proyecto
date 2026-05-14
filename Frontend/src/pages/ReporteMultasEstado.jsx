import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://127.0.0.1:8000";

function ReporteMultasEstado() {
  const [resumen, setResumen] = useState({
    total_pagadas: 0,
    total_pendientes: 0,
    total_multas: 0,
    items: [],
  });

  const [multas, setMultas] = useState([]);
  const [estado, setEstado] = useState("todas");
  const [placa, setPlaca] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [totalIngresos, setTotalIngresos] = useState(0);

  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState("");

  const obtenerResumen = async () => {
    setLoadingResumen(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/reportes/multas-estado`);

      if (!response.ok) {
        throw new Error("No se pudo obtener el resumen de multas.");
      }

      const data = await response.json();
      setResumen(data);
      setUltimaActualizacion(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Ocurrió un error al obtener el resumen.");
    } finally {
      setLoadingResumen(false);
    }
  };

  const obtenerDetalle = async () => {
    setLoadingDetalle(true);
    setError("");
    setTotalIngresos(0);

    try {
      const params = new URLSearchParams();

      if (estado !== "todas") {
        params.append("estado", estado);
      }

      if (placa.trim()) {
        params.append("placa", placa.trim());
      }

      if (fechaInicio) {
        params.append("fecha_inicio", fechaInicio);
      }

      if (fechaFin) {
        params.append("fecha_fin", fechaFin);
      }

      const response = await fetch(
        `${API_BASE}/api/reportes/multas?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("No se pudo obtener el detalle de multas.");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setMultas(data);
      } else {
        setMultas(data.items || []);
        setTotalIngresos(data.total_ingresos || 0);
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error al obtener el reporte.");
      setMultas([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  useEffect(() => {
    obtenerResumen();
    obtenerDetalle();
  }, []);

  const aplicarFiltros = () => {
    obtenerDetalle();
  };

  const limpiarFiltros = () => {
    setEstado("todas");
    setPlaca("");
    setFechaInicio("");
    setFechaFin("");
    setTotalIngresos(0);

    setTimeout(() => {
      obtenerDetalle();
    }, 0);
  };

  const exportarPDF = () => {
    if (multas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte Unificado de Multas", 14, 15);

    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Estado: ${estado}`, 14, 28);

    const filas = multas.map((m) => [
      m.placa || "N/A",
      m.fecha || m.fecha_pago || "N/A",
      m.tipo_infraccion || "N/A",
      `Q ${Number(m.monto_base || 0).toFixed(2)}`,
      `Q ${Number(m.descuento_o_mora || m.descuento_mora || 0).toFixed(2)}`,
      `Q ${Number(m.total_actual || m.monto_final || m.monto_base || 0).toFixed(2)}`,
      m.estado || estado,
    ]);

    autoTable(doc, {
      startY: 34,
      head: [[
        "Placa",
        "Fecha",
        "Tipo",
        "Monto Base",
        "Desc. / Mora",
        "Total",
        "Estado",
      ]],
      body: filas,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [39, 39, 42],
        textColor: [255, 255, 255],
      },
      margin: { top: 20 },
    });

    doc.save("reporte_unificado_multas.pdf");
  };

  return (
    <section className="min-h-screen bg-[#090b10] text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
              Reportes
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              Control Unificado de Multas
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Consulta multas pagadas y pendientes desde una sola pantalla.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={obtenerResumen}
              className="rounded-xl border border-blue-500 px-5 py-3 text-sm font-semibold text-blue-400 transition hover:bg-blue-600 hover:text-white"
            >
              Actualizar
            </button>

            <button
              onClick={exportarPDF}
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
            >
              Exportar PDF
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm text-emerald-200">Multas pagadas</p>
            <p className="mt-2 text-4xl font-bold text-emerald-300">
              {resumen.total_pagadas}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <p className="text-sm text-amber-200">Multas pendientes</p>
            <p className="mt-2 text-4xl font-bold text-amber-300">
              {resumen.total_pendientes}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-5">
            <p className="text-sm text-zinc-300">Total registradas</p>
            <p className="mt-2 text-4xl font-bold text-white">
              {resumen.total_multas}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl">
          <h2 className="text-lg font-bold text-blue-400">
            Filtros del reporte
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="pagada">Pagadas</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Placa</label>
              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="Ej. P123ABC"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Fecha inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Fecha fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={aplicarFiltros}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Filtrar
              </button>

              <button
                onClick={limpiarFiltros}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl">
          <div className="flex flex-col justify-between gap-3 border-b border-zinc-800 p-5 md:flex-row md:items-center">
            <h2 className="text-lg font-bold text-blue-400">
              Detalle de multas ({multas.length})
            </h2>

            {ultimaActualizacion && (
              <p className="text-xs text-zinc-500">
                Última actualización: {ultimaActualizacion}
              </p>
            )}
          </div>

          {loadingResumen || loadingDetalle ? (
            <p className="p-5 text-sm text-zinc-400">Cargando reporte...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950/70 text-zinc-300">
                  <tr>
                    <th className="px-5 py-4">Placa</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Tipo</th>
                    <th className="px-5 py-4">Monto Base</th>
                    <th className="px-5 py-4">Desc. / Mora</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {multas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-5 py-8 text-center text-zinc-500">
                        No hay multas para mostrar.
                      </td>
                    </tr>
                  ) : (
                    multas.map((multa) => {
                      const estadoMulta = multa.estado || estado;

                      return (
                        <tr
                          key={multa.id}
                          className="border-t border-zinc-800 transition hover:bg-zinc-800/60"
                        >
                          <td className="px-5 py-4 font-semibold text-white">
                            {multa.placa || "N/A"}
                          </td>
                          <td className="px-5 py-4 text-zinc-300">
                            {multa.fecha || multa.fecha_pago || "N/A"}
                          </td>
                          <td className="px-5 py-4 text-zinc-300">
                            {multa.tipo_infraccion || "N/A"}
                          </td>
                          <td className="px-5 py-4 text-zinc-300">
                            Q {Number(multa.monto_base || 0).toFixed(2)}
                          </td>
                          <td className="px-5 py-4 text-zinc-300">
                            Q{" "}
                            {Number(
                              multa.descuento_o_mora || multa.descuento_mora || 0
                            ).toFixed(2)}
                          </td>
                          <td className="px-5 py-4 font-bold text-white">
                            Q{" "}
                            {Number(
                              multa.total_actual ||
                                multa.monto_final ||
                                multa.monto_base ||
                                0
                            ).toFixed(2)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                estadoMulta?.toLowerCase() === "pagada" ||
                                estadoMulta?.toLowerCase() === "pagadas"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                              }`}
                            >
                              {estadoMulta}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalIngresos > 0 && (
            <div className="flex justify-end border-t border-zinc-800 p-5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                Total de ingresos: Q {Number(totalIngresos).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ReporteMultasEstado;