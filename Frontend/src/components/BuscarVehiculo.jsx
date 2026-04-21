import { useState } from "react";

function BuscarVehiculo({ onBuscar, cargando }) {
  const [placa, setPlaca] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (!placa.trim()) {
      setErrorLocal("Debes ingresar una placa para continuar.");
      return;
    }

    setErrorLocal("");
    onBuscar(placa.trim().toUpperCase());
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-xl"
    >
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Numero de placa
      </label>
      <input
        type="text"
        value={placa}
        onChange={(e) => setPlaca(e.target.value)}
        placeholder="Ej. P123ABC"
        className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
      />
      {errorLocal && (
        <p className="mt-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errorLocal}
        </p>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {cargando ? "Buscando..." : "Buscar vehiculo"}
      </button>
    </form>
  );
}

export default BuscarVehiculo;
