import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ReporteMultasPagadas() {
  const [multas, setMultas] = useState([]);
  const [totalRecaudado, setTotalRecaudado] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [placa, setPlaca] = useState("");
  const [fecha, setFecha] = useState("");

  const obtenerMultas = async (filtros = {}) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filtros.placa) params.append("placa", filtros.placa);
      if (filtros.fecha) params.append("fecha", filtros.fecha);

      const response = await fetch(
        `http://127.0.0.1:8000/reportes/multas-pagadas?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("No se pudo obtener el reporte de multas pagadas.");
      }

      const data = await response.json();
      setMultas(data.multas || []);
      setTotalRecaudado(Number(data.total_recaudado || 0));
      setCantidad(Number(data.cantidad || 0));
    } catch (err) {
      setError(err.message || "Ocurrio un error al obtener el reporte.");
      setMultas([]);
      setTotalRecaudado(0);
      setCantidad(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerMultas();
  }, []);

  const aplicarFiltros = () => {
    obtenerMultas({ placa, fecha });
  };

  const limpiarFiltros = () => {
    setPlaca("");
    setFecha("");
    obtenerMultas();
  };

  const exportarPDF = () => {
    if (multas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Multas Pagadas", 14, 15);

    doc.setFontSize(10);
    doc.text(`Fecha de generacion: ${new Date().toLocaleDateString()}`, 14, 22);

    let cursorY = 28;
    if (placa || fecha) {
      let textoFiltros = "Filtros aplicados:";
      if (placa) textoFiltros += ` Placa = ${placa}`;
      if (fecha) textoFiltros += ` Fecha = ${fecha}`;
      doc.text(textoFiltros, 14, cursorY);
      cursorY += 6;
    }

    doc.setFontSize(11);
    doc.text(
      `Total recaudado: Q ${totalRecaudado.toFixed(2)}  |  Cantidad: ${cantidad}`,
      14,
      cursorY
    );
    cursorY += 4;

    const filas = multas.map((m) => [
      m.placa,
      m.fecha,
      m.tipo_infraccion,
      `Q ${Number(m.monto_base).toFixed(2)}`,
      m.estado,
    ]);

    autoTable(doc, {
      startY: cursorY + 2,
      head: [["Placa", "Fecha", "Tipo", "Monto Pagado", "Estado"]],
      body: filas,
      foot: [[
        { content: "TOTAL RECAUDADO", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
        { content: `Q ${totalRecaudado.toFixed(2)}`, styles: { fontStyle: "bold" } },
        "",
      ]],
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [22, 101, 52],
        textColor: [255, 255, 255],
      },
      footStyles: {
        fillColor: [220, 252, 231],
        textColor: [22, 101, 52],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20 },
    });

    doc.save("reporte_multas_pagadas.pdf");
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Reporte de Multas Pagadas</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Consulta, filtra y exporta las multas que ya han sido pagadas, junto con el total recaudado.
          </p>
        </div>

        <button
          onClick={exportarPDF}
          className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Exportar PDF
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">
            Total recaudado
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-200">
            Q {totalRecaudado.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-emerald-200/70">
            Suma del monto base de todas las multas pagadas listadas.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Cantidad de multas pagadas
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-100">{cantidad}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Coincidencias con los filtros actuales.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Placa</label>
          <input
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            placeholder="Ej. P123ABC"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-300">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end gap-2 md:col-span-2">
          <button
            onClick={aplicarFiltros}
            className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
          >
            Filtrar
          </button>

          <button
            onClick={limpiarFiltros}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-zinc-400">Cargando reporte...</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-zinc-950/70">
              <tr className="text-left text-zinc-400">
                <th className="px-3 py-2">Placa</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Monto Pagado</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {multas.length > 0 ? (
                multas.map((multa) => (
                  <tr key={multa.id} className="border-t border-zinc-900">
                    <td className="px-3 py-3">{multa.placa}</td>
                    <td className="px-3 py-3">{multa.fecha}</td>
                    <td className="px-3 py-3">{multa.tipo_infraccion}</td>
                    <td className="px-3 py-3 font-semibold">
                      Q {Number(multa.monto_base).toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-200">
                        {multa.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-zinc-400">
                    No hay multas pagadas para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
            {multas.length > 0 && (
              <tfoot className="bg-emerald-500/10">
                <tr>
                  <td colSpan="3" className="px-3 py-3 text-right font-semibold text-emerald-200">
                    TOTAL RECAUDADO
                  </td>
                  <td className="px-3 py-3 font-semibold text-emerald-200">
                    Q {totalRecaudado.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </section>
  );
}

export default ReporteMultasPagadas;