import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/propietarios/";

export default function RegistroPropietario() {
  const [form, setForm] = useState({
    nombre: "",
    dpi: "",
    correo: "",
    telefono: "",
    direccion: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarValor = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      dpi: "",
      correo: "",
      telefono: "",
      direccion: "",
    });

    setMensaje("");
    setError("");
  };

  const registrarPropietario = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "No se pudo registrar el propietario."
        );
      }

      setMensaje("Propietario registrado correctamente.");

      setForm({
        nombre: "",
        dpi: "",
        correo: "",
        telefono: "",
        direccion: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#090b10] text-zinc-100">
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
            Módulo Personas
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Registro de Propietario
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Ingresa la información del propietario del vehículo.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl">
          {mensaje && (
            <div className="mb-5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-300">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={registrarPropietario} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Nombre completo
              </label>

              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={cambiarValor}
                placeholder="Ej. Juan Carlos Pérez López"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  DPI
                </label>

                <input
                  type="text"
                  name="dpi"
                  value={form.dpi}
                  onChange={cambiarValor}
                  placeholder="13 dígitos"
                  maxLength="13"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Teléfono
                </label>

                <input
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={cambiarValor}
                  placeholder="Ej. 55551234"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Correo electrónico
              </label>

              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={cambiarValor}
                placeholder="ejemplo@email.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Dirección
              </label>

              <textarea
                name="direccion"
                value={form.direccion}
                onChange={cambiarValor}
                placeholder="Ej. Zona 1, Ciudad de Guatemala"
                rows="3"
                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={cargando}
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando ? "Registrando..." : "Registrar propietario"}
              </button>

              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 font-bold text-zinc-200 transition hover:bg-zinc-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}