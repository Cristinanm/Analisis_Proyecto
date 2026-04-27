import { useState } from "react";

const FORMATO_PLACA = /^[A-Z]{1}[0-9]{3}[A-Z]{3}$/;

function BuscarVehiculo({ onBuscar, cargando }) {
  const [placa, setPlaca] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  const validarPlaca = (valor) => {
    const placaLimpia = valor.trim().toUpperCase();

    if (!placaLimpia) {
      return "Debes ingresar una placa para continuar.";
    }

    if (!FORMATO_PLACA.test(placaLimpia)) {
      return "Formato de placa invalido. Ejemplo: P123ABC";
    }

    return "";
  };

  const manejarCambio = (e) => {
    const valor = e.target.value.toUpperCase();
    setPlaca(valor);

    const error = validarPlaca(valor);
    setErrorLocal(error);
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    const error = validarPlaca(placa);

    if (error) {
      setErrorLocal(error);
      return;
    }

    setErrorLocal("");
    onBuscar(placa.trim().toUpperCase());
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl"
    >
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Numero de placa
      </label>

      <input
        type="text"
        value={placa}
        onChange={manejarCambio}
        placeholder="Ej. P123ABC"
        maxLength="7"
        className={`w-full rounded-xl border bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 outline-none transition ${
          errorLocal
            ? "border-rose-500 focus:border-rose-400"
            : "border-zinc-700 focus:border-amber-300/60"
        }`}
      />

      {errorLocal && (
        <p className="mt-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errorLocal}
        </p>
      )}

      <p className="mt-2 text-xs text-zinc-500">
        Formato permitido: 1 letra, 3 numeros y 3 letras. Ejemplo: P123ABC
      </p>

      <button
        type="submit"
        disabled={cargando || errorLocal !== "" || placa.trim() === ""}
        className="mt-4 w-full rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {cargando ? "Buscando..." : "Buscar vehiculo"}
      </button>
    </form>
  );
}

export default BuscarVehiculo;