import { useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/vehiculos/";

export default function RegistroVehiculos({ token }) {
  const [formData, setFormData] = useState({
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    propietario_id: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // NUEVO: estados para listar vehículos existentes
  const [vehiculos, setVehiculos] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [cargandoPropietarios, setCargandoPropietarios] = useState(false);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(false);

  const totalVehiculos = useMemo(() => vehiculos.length, [vehiculos]);

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-zinc-100 placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  const labelClass = "mb-1 block font-semibold text-zinc-200";

  // NUEVO: función para cargar todos los vehículos
  const cargarVehiculos = async () => {
    setCargandoVehiculos(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "No se pudieron cargar los vehículos");
      }

      const data = await response.json();
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar vehículos");
    } finally {
      setCargandoVehiculos(false);
    }
  };

  const cargarPropietarios = async () => {
  setCargandoPropietarios(true);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/propietarios/"
    );

    if (!response.ok) {
      throw new Error("No se pudieron cargar los propietarios");
    }

    const data = await response.json();

    setPropietarios(Array.isArray(data) ? data : []);
  } catch (err) {
    setError(err.message || "Error al cargar propietarios");
  } finally {
    setCargandoPropietarios(false);
  }
};

  // NUEVO: cargar vehículos al abrir la pantalla
    useEffect(() => {
    cargarVehiculos();
    cargarPropietarios();
  }, []);

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
      propietario_id: "",
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
      propietario_id: Number(formData.propietario_id),
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

      // NUEVO: recargar la lista después de registrar
      await cargarVehiculos();
    } catch (err) {
      setError(err.message || "Error al registrar vehículo");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
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
            <select
              name="propietario_id"
              value={formData.propietario_id}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">
                {cargandoPropietarios
                  ? "Cargando propietarios..."
                  : "Seleccione un propietario"}
              </option>

              {propietarios.map((propietario) => (
                <option key={propietario.id} value={propietario.id}>
                  {propietario.nombre} - DPI: {propietario.dpi}
                </option>
              ))}
        </select>
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

      {/* NUEVO: panel para listar todos los vehículos existentes */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Panel de vehículos
            </p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-100">
              Vehículos Existentes
            </h2>
            <p className="mt-2 text-zinc-400">
              Listado general de todos los vehículos registrados en el sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarVehiculos}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
          >
            Actualizar
          </button>
        </div>

        <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
            Total de vehículos
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-300">
            {totalVehiculos}
          </p>
        </div>

        {cargandoVehiculos ? (
          <p className="text-zinc-400">Cargando vehículos...</p>
        ) : vehiculos.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 text-zinc-400">
            No hay vehículos registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-zinc-950/80">
                <tr className="text-left text-zinc-400">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Placa</th>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Año</th>
                  <th className="px-4 py-3">Propietario</th>
                </tr>
              </thead>

              <tbody>
                {vehiculos.map((vehiculo) => (
                  <tr
                    key={vehiculo.id}
                    className="border-t border-zinc-800 text-zinc-200"
                  >
                    <td className="px-4 py-3 text-zinc-500">
                      {vehiculo.id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
                        {vehiculo.placa}
                      </span>
                    </td>
                    <td className="px-4 py-3">{vehiculo.marca}</td>
                    <td className="px-4 py-3">{vehiculo.modelo}</td>
                    <td className="px-4 py-3">{vehiculo.anio}</td>
                    <td className="px-4 py-3">
                      {vehiculo.propietario?.nombre || "Sin propietario"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}