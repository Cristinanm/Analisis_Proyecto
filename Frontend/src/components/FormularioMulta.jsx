import { useState } from "react";

function FormularioMulta({ placa, onRegistrar, cargando }) {
  const [formData, setFormData] = useState({
    fecha: "",
    tipo_infraccion: "",
    descripcion: "",
    monto_base: "",
  });

  const [errores, setErrores] = useState({});

  const validar = () => {
    const nuevosErrores = {};

    if (!formData.fecha) nuevosErrores.fecha = "La fecha es obligatoria";
    if (!formData.tipo_infraccion.trim()) {
      nuevosErrores.tipo_infraccion = "El tipo de infraccion es obligatorio";
    }
    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripcion es obligatoria";
    }
    if (!formData.monto_base || Number(formData.monto_base) <= 0) {
      nuevosErrores.monto_base = "El monto base debe ser mayor que 0";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (!validar()) return;

    onRegistrar({
      placa,
      fecha: formData.fecha,
      tipo_infraccion: formData.tipo_infraccion,
      descripcion: formData.descripcion,
      monto_base: Number(formData.monto_base),
    });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400";

  return (
    <form
      onSubmit={manejarSubmit}
      className="space-y-4 rounded-2xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-xl"
    >
      <h3 className="text-base font-semibold uppercase tracking-[0.15em] text-cyan-300">
        Registrar multa para {placa}
      </h3>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.15em] text-slate-400">Fecha</label>
        <input type="date" name="fecha" value={formData.fecha} onChange={manejarCambio} className={inputClass} />
        {errores.fecha && <span className="mt-1 block text-xs text-rose-300">{errores.fecha}</span>}
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.15em] text-slate-400">Tipo de infraccion</label>
        <input
          type="text"
          name="tipo_infraccion"
          value={formData.tipo_infraccion}
          onChange={manejarCambio}
          className={inputClass}
          placeholder="Ej. Exceso de velocidad"
        />
        {errores.tipo_infraccion && (
          <span className="mt-1 block text-xs text-rose-300">{errores.tipo_infraccion}</span>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.15em] text-slate-400">Descripcion</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={manejarCambio}
          className={`${inputClass} min-h-28 resize-y`}
          placeholder="Detalle de la infraccion"
        />
        {errores.descripcion && (
          <span className="mt-1 block text-xs text-rose-300">{errores.descripcion}</span>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.15em] text-slate-400">Monto base</label>
        <input
          type="number"
          name="monto_base"
          value={formData.monto_base}
          onChange={manejarCambio}
          className={inputClass}
          placeholder="Ej. 500"
        />
        {errores.monto_base && (
          <span className="mt-1 block text-xs text-rose-300">{errores.monto_base}</span>
        )}
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
        Estado inicial: pendiente
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {cargando ? "Registrando..." : "Registrar multa"}
      </button>
    </form>
  );
}

export default FormularioMulta;
