import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ReporteMultasPendientes() {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [placa, setPlaca] = useState("");
  const [fecha, setFecha] = useState("");

  const obtenerMultas = async (filtros = {}) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("estado", "pendiente");

      if (filtros.placa) params.append("placa", filtros.placa);
      if (filtros.fecha) params.append("fecha", filtros.fecha);

      const response = await fetch(
       `http://127.0.0.1:8000/reportes/multas?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("No se pudo obtener el reporte de multas.");
      }

      const data = await response.json();
      setMultas(data);
    } catch (err) {
      setError(err.message || "Ocurrio un error al obtener el reporte.");
      setMultas([]);
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
    doc.text("Reporte de Multas Pendientes", 14, 15);

    doc.setFontSize(10);
    doc.text(`Fecha de generacion: ${new Date().toLocaleDateString()}`, 14, 22);

    if (placa || fecha) {
      let textoFiltros = "Filtros aplicados:";
      if (placa) textoFiltros += ` Placa = ${placa}`;
      if (fecha) textoFiltros += ` Fecha = ${fecha}`;
      doc.text(textoFiltros, 14, 28);
    }

    const filas = multas.map((m) => [
      m.placa,
      m.fecha,
      m.tipo_infraccion,
      `Q ${Number(m.monto_base).toFixed(2)}`,
      `Q ${Number(m.descuento_o_mora).toFixed(2)}`,
      `Q ${Number(m.total_actual).toFixed(2)}`,
      m.estado,
    ]);

    autoTable(doc, {
      startY: placa || fecha ? 34 : 28,
      head: [[
        "Placa",
        "Fecha",
        "Tipo",
        "Monto Base",
        "Descuento / Mora",
        "Total Actual",
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
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20 },
    });

    doc.save("reporte_multas_pendientes.pdf");
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Reporte de Multas Pendientes</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Consulta, filtra y exporta las multas pendientes.
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
                <th className="px-3 py-2">Monto Base</th>
                <th className="px-3 py-2">Descuento / Mora</th>
                <th className="px-3 py-2">Total Actual</th>
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
                    <td className="px-3 py-3">Q {Number(multa.monto_base).toFixed(2)}</td>
                    <td className="px-3 py-3">Q {Number(multa.descuento_o_mora).toFixed(2)}</td>
                    <td className="px-3 py-3 font-semibold">
                      Q {Number(multa.total_actual).toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-200">
                        {multa.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-3 py-4 text-center text-zinc-400">
                    No hay multas pendientes para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ReporteMultasPendientes;