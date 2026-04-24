import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function RegistroPropietario() {
  const [form, setForm] = useState({
    dpi: "",
    nombre: "",
    correo: "",
    direccion: "",
    telefono: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [propietarioGuardado, setPropietarioGuardado] = useState(null);

  const inputClass =
    "w-full border border-zinc-300 bg-white p-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({
      dpi: "",
      nombre: "",
      correo: "",
      direccion: "",
      telefono: "",
    });
    setError("");
    setSuccess("");
  };

  const validar = () => {
    if (!form.dpi || !form.nombre || !form.correo || !form.direccion || !form.telefono) {
      return "Todos los campos son obligatorios";
    }

    if (form.dpi.length !== 13) {
      return "El DPI debe tener 13 dígitos";
    }

    if (!form.correo.includes("@")) {
      return "Correo inválido";
    }

    if (form.telefono.length < 6) {
      return "El teléfono debe tener al menos 6 dígitos";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      setSuccess("");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/propietarios/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error al registrar propietario");
      }

      setPropietarioGuardado(data);
      setSuccess("Propietario registrado correctamente");
      setError("");

      setForm({
        dpi: "",
        nombre: "",
        correo: "",
        direccion: "",
        telefono: "",
      });
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
      <h2 className="mb-4 text-2xl font-bold">
        Registro de Propietario de Vehículo
      </h2>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-3 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-green-300">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nombre"
          placeholder="Nombre completo *"
          value={form.nombre}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          name="dpi"
          placeholder="DPI (13 dígitos) *"
          value={form.dpi}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          name="correo"
          placeholder="Correo electrónico *"
          value={form.correo}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          name="telefono"
          placeholder="Teléfono *"
          value={form.telefono}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          name="direccion"
          placeholder="Dirección *"
          value={form.direccion}
          onChange={handleChange}
          className={inputClass}
        />

        <div className="flex gap-3">
          <button className="rounded-lg bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600">
            Registrar
          </button>

          <button
            type="button"
            onClick={limpiarFormulario}
            className="rounded-lg bg-gray-500 px-5 py-3 font-semibold text-white hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>

      {propietarioGuardado && (
        <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-950 p-5">
          <h3 className="mb-4 text-xl font-bold text-green-300">
            Datos del propietario registrado
          </h3>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <p>
              <strong>Nombre:</strong> {propietarioGuardado.nombre}
            </p>
            <p>
              <strong>DPI:</strong> {propietarioGuardado.dpi}
            </p>
            <p>
              <strong>Correo:</strong> {propietarioGuardado.correo}
            </p>
            <p>
              <strong>Teléfono:</strong> {propietarioGuardado.telefono}
            </p>
            <p className="md:col-span-2">
              <strong>Dirección:</strong> {propietarioGuardado.direccion}
            </p>
          </div>

          <h3 className="mt-6 mb-3 text-lg font-bold">
            Vehículos asociados
          </h3>

          <div className="overflow-x-auto rounded-lg border border-zinc-700">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800 text-zinc-200">
                <tr>
                  <th className="p-3 text-left">Placa</th>
                  <th className="p-3 text-left">Marca</th>
                  <th className="p-3 text-left">Modelo</th>
                  <th className="p-3 text-left">Año</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="4" className="p-4 text-center text-zinc-400">
                    Sin vehículos asociados
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="mt-5 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black hover:bg-amber-300"
          >
            Editar persona
          </button>
        </div>
      )}
    </div>
  );
}