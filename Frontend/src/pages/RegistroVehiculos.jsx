import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/vehiculos/";

export default function RegistroVehiculos({ token }) {
  const [formData, setFormData] = useState({
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    propietario: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-zinc-100 placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  const labelClass = "mb-1 block font-semibold text-zinc-200";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setFormData({
      placa: "",
      marca: "",
      modelo: "",
      anio: "",
      propietario: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");
    setCargando(true);

    const datosVehiculo = {
      placa: formData.placa.toUpperCase().trim(),
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      anio: Number(formData.anio),
      propietario: formData.propietario.trim(),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(datosVehiculo),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "No se pudo registrar el vehículo");
      }

      setMensaje("Vehículo registrado correctamente");
      limpiarFormulario();
    } catch (err) {
      setError(err.message || "Error al registrar vehículo");
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-zinc-100">
          Registro de Vehículos
        </h2>
        <p className="mt-2 text-zinc-400">
          Ingresa los datos del vehículo para agregarlo al sistema.
        </p>
      </div>

      {mensaje && (
        <div className="mb-5 rounded-xl border border-green-700 bg-green-900/40 p-4 font-medium text-green-300">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-700 bg-red-900/40 p-4 font-medium text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Placa</label>
          <input
            type="text"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            placeholder="Ejemplo: P123ABC"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Marca</label>
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            placeholder="Ejemplo: Toyota"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Modelo</label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            placeholder="Ejemplo: Corolla"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Año</label>
          <input
            type="number"
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            placeholder="Ejemplo: 2020"
            className={inputClass}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Propietario</label>
          <input
            type="text"
            name="propietario"
            value={formData.propietario}
            onChange={handleChange}
            placeholder="Nombre del propietario"
            className={inputClass}
            required
          />
        </div>

        <div className="flex gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={cargando}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-blue-700 hover:to-indigo-700 disabled:scale-100 disabled:from-zinc-600 disabled:to-zinc-700"
          >
            {cargando ? "Guardando..." : "Registrar Vehículo"}
          </button>

        </div>
      </form>
    </section>
  );
}