import { useEffect, useMemo, useState } from "react";
// Importamos la función que creaste en el paso anterior
import { editarVehiculo } from "../services/vehiculoApi"; 

const API_URL = "http://127.0.0.1:8000/api/vehiculos/";
const PROPIETARIOS_URL = "http://127.0.0.1:8000/api/propietarios/";

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

  const [vehiculos, setVehiculos] = useState([]);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(false);

  const [propietarios, setPropietarios] = useState([]);
  const [cargandoPropietarios, setCargandoPropietarios] = useState(false);

  // --- NUEVOS ESTADOS PARA LA EDICIÓN ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  const totalVehiculos = useMemo(() => vehiculos.length, [vehiculos]);

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-zinc-100 placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  const labelClass = "mb-1 block font-semibold text-zinc-200";

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
      const response = await fetch(PROPIETARIOS_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

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

  const obtenerNombrePropietario = (propietario) => {
    if (!propietario) return "Sin propietario";

    if (typeof propietario === "string") {
      return propietario;
    }

    if (propietario.nombre) {
      return propietario.nombre;
    }

    const nombreCompleto = `${propietario.nombres || ""} ${
      propietario.apellidos || ""
    }`.trim();

    return nombreCompleto || "Sin propietario";
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
      await cargarVehiculos();
    } catch (err) {
      setError(err.message || "Error al registrar vehículo");
    } finally {
      setCargando(false);
    }
  };

  // --- FUNCIONES PARA LA EDICIÓN ---
  const abrirModalEdicion = (vehiculo) => {
    setVehiculoEditando({
      id: vehiculo.id,
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVehiculoEditando(null);
  };

  const handleEditChange = (e) => {
    setVehiculoEditando({
      ...vehiculoEditando,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setCargandoEdicion(true);
    setError("");
    setMensaje("");

    try {
      await editarVehiculo(vehiculoEditando.id, {
        placa: vehiculoEditando.placa.toUpperCase().trim(),
        marca: vehiculoEditando.marca.trim(),
        modelo: vehiculoEditando.modelo.trim(),
        anio: Number(vehiculoEditando.anio),
      });

      setMensaje("Vehículo actualizado correctamente");
      cerrarModal();
      await cargarVehiculos(); // Recargamos la tabla para ver los cambios
    } catch (err) {
      setError(err.message || "Error al actualizar vehículo");
    } finally {
      setCargandoEdicion(false);
    }
  };

  return (
    <div className="space-y-6 relative">
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
                  {obtenerNombrePropietario(propietario)}
                  {propietario.dpi ? ` - DPI: ${propietario.dpi}` : ""}
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
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {vehiculos.map((vehiculo) => (
                  <tr
                    key={vehiculo.id}
                    className="border-t border-zinc-800 text-zinc-200 hover:bg-zinc-800/30 transition-colors"
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
                      {obtenerNombrePropietario(vehiculo.propietario)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => abrirModalEdicion(vehiculo)}
                        className="rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- MODAL DE EDICIÓN --- */}
      {modalAbierto && vehiculoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-2xl font-bold text-white">Editar Vehículo</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Placa</label>
                <input
                  type="text"
                  name="placa"
                  value={vehiculoEditando.placa}
                  onChange={handleEditChange}
                  className={inputClass}
                  required
                />
              </div>
              
              <div>
                <label className={labelClass}>Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={vehiculoEditando.marca}
                  onChange={handleEditChange}
                  className={inputClass}
                  required
                />
              </div>
              
              <div>
                <label className={labelClass}>Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  value={vehiculoEditando.modelo}
                  onChange={handleEditChange}
                  className={inputClass}
                  required
                />
              </div>
              
              <div>
                <label className={labelClass}>Año</label>
                <input
                  type="number"
                  name="anio"
                  value={vehiculoEditando.anio}
                  onChange={handleEditChange}
                  className={inputClass}
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 font-semibold text-zinc-300 hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargandoEdicion}
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  {cargandoEdicion ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}