import { useState } from "react";

export default function BusquedaAvanzadaVehiculos() {
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [propietario, setPropietario] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscado, setBuscado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const buscar = async () => {
    if (!placa && !marca && !propietario) {
      setBuscado(true);
      setResultados([]);
      return;
    }

    try {
      setCargando(true);
      setBuscado(true);

      const params = new URLSearchParams();

      if (placa) params.append("placa", placa);
      if (marca) params.append("marca", marca);
      if (propietario) params.append("propietario", propietario);

      const res = await fetch(`${API_URL}/api/vehiculos/buscar?${params}`);

      if (!res.ok) {
        throw new Error("Error en la búsqueda");
      }

      const data = await res.json();
      setResultados(data);
    } catch (error) {
      console.error("Error al buscar:", error);
      setResultados([]);
    } finally {
      setCargando(false);
    }
  };

  const limpiar = () => {
    setPlaca("");
    setMarca("");
    setPropietario("");
    setResultados([]);
    setBuscado(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-zinc-100">
          Búsqueda Avanzada de Vehículos
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Busca vehículos por placa, marca o propietario desde el panel principal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <input
          placeholder="Placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-500"
        />

        <input
          placeholder="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-500"
        />

        <input
          placeholder="Propietario"
          value={propietario}
          onChange={(e) => setPropietario(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-500"
        />

        <div className="flex gap-2">
          <button
            onClick={buscar}
            disabled={cargando}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? "Buscando..." : "Buscar"}
          </button>

          <button
            onClick={limpiar}
            className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold text-zinc-300 transition hover:bg-zinc-800"
          >
            Limpiar
          </button>
        </div>
      </div>

      {buscado && !cargando && resultados.length === 0 && (
        <p className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-400">
          No hay resultados para la búsqueda realizada.
        </p>
      )}

      {resultados.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-800 text-zinc-300">
              <tr>
                <th className="px-4 py-3">Placa</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Propietario</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800 bg-zinc-950/40">
              {resultados.map((v) => (
                <tr key={v.id} className="text-zinc-300 hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-semibold text-blue-300">
                    {v.placa}
                  </td>
                  <td className="px-4 py-3">{v.marca || "Sin marca"}</td>
                  <td className="px-4 py-3">
                    {v.propietario?.nombre || "Sin propietario"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}