import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ReporteMultasPagadas() {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [totalIngresos, setTotalIngresos] = useState(0);

  const obtenerReporte = async () => {
    setLoading(true);
    setError("");

    try {
      if (!fechaInicio || !fechaFin) {
        throw new Error("Debes seleccionar fecha inicio y fecha fin.");
      }

      const response = await fetch(
        `http://127.0.0.1:8001/reportes/multas-pagadas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "No se pudo obtener el reporte.");
      }

      const data = await response.json();
      setMultas(data.items || []);
      setTotalIngresos(data.total_ingresos || 0);
    } catch (err) {
      setError(err.message || "Ocurrio un error al obtener el reporte.");
      setMultas([]);
      setTotalIngresos(0);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setMultas([]);
    setTotalIngresos(0);
    setError("");
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
    doc.text(`Rango: ${fechaInicio} a ${fechaFin}`, 14, 28);

    const filas = multas.map((m) => [
      m.placa,
      m.id_factura || "",
      m.fecha_pago || "",
      `Q ${Number(m.monto_base).toFixed(2)}`,
      `Q ${Number(m.descuento_mora).toFixed(2)}`,
      `Q ${Number(m.monto_final).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 34,
      head: [[
        "Placa",
        "ID Factura",
        "Fecha Pago",
        "Monto Base",
        "Descuento / Mora",
        "Monto Final",
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
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20 },
    });

    const finalY = doc.lastAutoTable.finalY || 40;
    doc.setFontSize(12);
    doc.text(`Total de ingresos: Q ${Number(totalIngresos).toFixed(2)}`, 14, finalY + 10);

    doc.save("reporte_multas_pagadas.pdf");
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Reporte de Multas Pagadas</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Consulta multas pagadas por rango de fechas y exporta el resultado.
          </p>
        </div>

        <button
          onClick={exportarPDF}
          className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Exportar PDF
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Fecha inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-300">Fecha fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end gap-2 md:col-span-2">
          <button
            onClick={obtenerReporte}
            className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
          >
            Generar reporte
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
        <>
          <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-zinc-950/70">
                <tr className="text-left text-zinc-400">
                  <th className="px-3 py-2">Placa</th>
                  <th className="px-3 py-2">ID Factura</th>
                  <th className="px-3 py-2">Fecha Pago</th>
                  <th className="px-3 py-2">Monto Base</th>
                  <th className="px-3 py-2">Descuento / Mora</th>
                  <th className="px-3 py-2">Monto Final</th>
                </tr>
              </thead>
              <tbody>
                {multas.length > 0 ? (
                  multas.map((multa) => (
                    <tr key={multa.id} className="border-t border-zinc-900">
                      <td className="px-3 py-3">{multa.placa}</td>
                      <td className="px-3 py-3">{multa.id_factura}</td>
                      <td className="px-3 py-3">{multa.fecha_pago}</td>
                      <td className="px-3 py-3">Q {Number(multa.monto_base).toFixed(2)}</td>
                      <td className="px-3 py-3">Q {Number(multa.descuento_mora).toFixed(2)}</td>
                      <td className="px-3 py-3 font-semibold text-emerald-300">
                        Q {Number(multa.monto_final).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-4 text-center text-zinc-400">
                      No hay multas pagadas en ese rango.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              Total de ingresos: Q {Number(totalIngresos).toFixed(2)}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default ReporteMultasPagadas;