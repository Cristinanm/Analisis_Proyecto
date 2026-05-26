import { useState } from "react";
import { buscarRecibos } from "../services/reciboService";

export default function BusquedaRecibos() {
  const [termino, setTermino] = useState("");
  const [recibos, setRecibos] = useState([]);
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setBuscando(true);
    const data = await buscarRecibos(termino);
    setRecibos(data);
    setBuscando(false);
  };

  const imprimirRecibo = () => {
    window.print();
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl print:bg-white print:shadow-none print:border-none print:p-0">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            .print-area,
            .print-area * {
              visibility: visible;
            }

            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 24px;
              box-shadow: none !important;
              border: none !important;
            }

            @page {
              margin: 12mm;
            }
          }
        `}
      </style>

      <div className="print:hidden">
        <h2 className="text-2xl font-semibold mb-4">Búsqueda de Recibos Emitidos</h2>

        <form onSubmit={handleBuscar} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por No. de Factura o Nombre del Propietario..."
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            className="flex-1 p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition"
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </form>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="p-3">No. Factura</th>
                <th className="p-3">Propietario</th>
                <th className="p-3">Placa</th>
                <th className="p-3">Total Pagado</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>

            <tbody>
              {recibos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-zinc-400">
                    No se encontraron recibos.
                  </td>
                </tr>
              ) : (
                recibos.map((recibo) => (
                  <tr
                    key={recibo.id_factura}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <td className="p-3">{recibo.id_factura}</td>
                    <td className="p-3">{recibo.propietario_nombre}</td>
                    <td className="p-3">{recibo.placa_vehiculo}</td>
                    <td className="p-3 text-green-400 font-bold">
                      Q {Number(recibo.total_pagado || 0).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setReciboSeleccionado(recibo)}
                        className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-sm"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reciboSeleccionado && (
        <div className="print-area bg-white text-black p-8 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-200 print:max-w-none">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">COMPROBANTE DE PAGO</h1>
              <p className="text-sm text-gray-500">Municipalidad de San Pedro Pinula</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-red-600 text-xl">
                NO. {reciboSeleccionado.id_factura}
              </p>
              <p className="text-sm">Fecha: {reciboSeleccionado.fecha_pago}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 uppercase text-xs font-bold">Propietario</p>
              <p className="font-medium text-lg">
                {reciboSeleccionado.propietario_nombre}
              </p>
            </div>

            <div>
              <p className="text-gray-500 uppercase text-xs font-bold">
                Vehículo (Placa)
              </p>
              <p className="font-medium text-lg">
                {reciboSeleccionado.placa_vehiculo}
              </p>
            </div>
          </div>

          <table className="w-full text-left mb-6 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border-b">Infracción</th>
                <th className="p-2 border-b">Descripción</th>
                <th className="p-2 border-b text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {reciboSeleccionado.multas?.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="p-2">{m.tipo_infraccion}</td>
                  <td className="p-2 text-xs">{m.descripcion}</td>
                  <td className="p-2 text-right">
                    Q {Number(m.monto_final || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="2" className="p-2 text-right font-bold text-lg">
                  TOTAL COBRADO:
                </td>
                <td className="p-2 text-right font-bold text-lg text-green-700">
                  Q {Number(reciboSeleccionado.total_pagado || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="text-center mt-8 print:hidden">
            <button
              onClick={imprimirRecibo}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded inline-flex items-center gap-2"
            >
              🖨️ Reimprimir Comprobante
            </button>

            <button
              onClick={() => setReciboSeleccionado(null)}
              className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
