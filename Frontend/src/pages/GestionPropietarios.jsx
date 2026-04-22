import { useState } from "react";
import {
  actualizarPropietario,
  buscarPropietarios,
  crearPropietario,
} from "../services/api";

const EMPTY_FORM = {
  dpi: "",
  nombre: "",
  direccion: "",
  telefono: "",
};

function GestionPropietarios() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [busqueda, setBusqueda] = useState({ dpi: "", nombre: "" });
  const [resultados, setResultados] = useState([]);
  const [propietarioEditando, setPropietarioEditando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const limpiarFormulario = () => {
    setForm(EMPTY_FORM);
    setPropietarioEditando(null);
  };

  const cargarEnFormulario = (propietario) => {
    setForm({
      dpi: propietario.dpi ?? "",
      nombre: propietario.nombre ?? "",
      direccion: propietario.direccion ?? "",
      telefono: propietario.telefono ?? "",
    });
    setPropietarioEditando(propietario);
    setMensaje("");
    setError("");
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      if (propietarioEditando) {
        const actualizado = await actualizarPropietario(propietarioEditando.id, form);
        setResultados((prev) =>
          prev.map((item) => (item.id === actualizado.id ? actualizado : item))
        );
        setMensaje("Datos del propietario actualizados exitosamente.");
      } else {
        await crearPropietario(form);
        setMensaje("Propietario registrado exitosamente.");
      }
      limpiarFormulario();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarBusqueda = async (e) => {
    e.preventDefault();
    setBuscando(true);
    setError("");
    setMensaje("");

    try {
      const data = await buscarPropietarios({
        dpi: busqueda.dpi.trim(),
        nombre: busqueda.nombre.trim(),
      });
      setResultados(data);
      if (data.length === 0) {
        setMensaje("No se encontraron propietarios con ese criterio.");
      }
    } catch (err) {
      setResultados([]);
      setError(err.message);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
      <h2 className="text-2xl font-semibold">Gestion de Propietarios</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Registra, busca y modifica propietarios para mantener actualizado el padron.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
      {mensaje && (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {mensaje}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <form onSubmit={enviarFormulario} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <h3 className="text-lg font-semibold">
            {propietarioEditando ? `Editar propietario #${propietarioEditando.id}` : "Nuevo propietario"}
          </h3>
          <div className="mt-3 grid gap-3">
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="DPI"
              value={form.dpi}
              onChange={(e) => setForm({ ...form, dpi: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="Direccion"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="Telefono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              required
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200 disabled:opacity-60"
            >
              {guardando
                ? "Guardando..."
                : propietarioEditando
                  ? "Guardar cambios"
                  : "Registrar propietario"}
            </button>
            <button
              type="button"
              onClick={limpiarFormulario}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Limpiar
            </button>
          </div>
        </form>

        <form onSubmit={ejecutarBusqueda} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <h3 className="text-lg font-semibold">Buscar propietario</h3>
          <p className="mt-1 text-xs text-zinc-400">Busca por DPI exacto o por nombre parcial.</p>
          <div className="mt-3 grid gap-3">
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="DPI"
              value={busqueda.dpi}
              onChange={(e) => setBusqueda({ ...busqueda, dpi: e.target.value })}
            />
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="Nombre"
              value={busqueda.nombre}
              onChange={(e) => setBusqueda({ ...busqueda, nombre: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={buscando}
            className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-zinc-950/70">
            <tr className="text-left text-zinc-400">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">DPI</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Direccion</th>
              <th className="px-3 py-2">Telefono</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((propietario) => (
              <tr key={propietario.id} className="border-t border-zinc-900">
                <td className="px-3 py-3 text-zinc-500">{propietario.id}</td>
                <td className="px-3 py-3">{propietario.dpi}</td>
                <td className="px-3 py-3">{propietario.nombre}</td>
                <td className="px-3 py-3 text-zinc-300">{propietario.direccion}</td>
                <td className="px-3 py-3 text-zinc-300">{propietario.telefono}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
                    onClick={() => cargarEnFormulario(propietario)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {resultados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-zinc-500">
                  Sin resultados para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default GestionPropietarios;
