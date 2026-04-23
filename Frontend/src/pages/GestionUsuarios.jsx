import { useEffect, useMemo, useState } from "react";
import {
  createUserByAdmin,
  deleteUserByAdmin,
  listUsers,
  updateUserRole,
  updateUserStatus,
  updateUserByAdmin,
} from "../services/authApi";

const ROLES = ["usuario", "supervisor", "admin"];

const EMPTY_FORM = {
  nombres: "",
  apellidos: "",
  nombre_usuario: "",
  correo: "",
  contrasena: "",
  rol: "usuario",
  activo: true,
};

function GestionUsuarios({ token, perfilActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState("crear");
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listUsers(token);
      setUsuarios(data);
    } catch (err) {
      if (String(err.message).toLowerCase().includes("not found")) {
        setError("Not Found: el backend no tiene cargadas las rutas admin. Reinicia backend en puerto 8000 y vuelve a intentar.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    cargarUsuarios();
  }, [token]);

  const abrirCrear = () => {
    setModoModal("crear");
    setUsuarioEditando(null);
    setForm(EMPTY_FORM);
    setModalAbierto(true);
  };

  const abrirEditar = (u) => {
    setModoModal("editar");
    setUsuarioEditando(u);
    setForm({
      nombres: u.nombres || "",
      apellidos: u.apellidos || "",
      nombre_usuario: u.nombre_usuario || "",
      correo: u.correo || "",
      contrasena: "",
      rol: u.rol || "usuario",
      activo: Boolean(u.activo),
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalAbierto(false);
    setForm(EMPTY_FORM);
    setUsuarioEditando(null);
  };

  const onSubmitModal = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setGuardando(true);

    try {
      if (modoModal === "crear") {
        const creado = await createUserByAdmin(token, form);
        setUsuarios((prev) => [...prev, creado].sort((a, b) => a.id - b.id));
        setMensaje("Usuario creado correctamente.");
      } else if (usuarioEditando) {
        const payload = {
          nombres: form.nombres,
          apellidos: form.apellidos,
          nombre_usuario: form.nombre_usuario,
          correo: form.correo,
          rol: form.rol,
          activo: form.activo,
        };
        const actualizado = await updateUserByAdmin(token, usuarioEditando.id, payload);
        setUsuarios((prev) => prev.map((u) => (u.id === actualizado.id ? actualizado : u)));
        setMensaje("Usuario editado correctamente.");
      }
      cerrarModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambioRol = async (userId, rol) => {
    setMensaje("");
    setError("");
    try {
      const actualizado = await updateUserRole(token, userId, rol);
      setUsuarios((prev) => prev.map((u) => (u.id === actualizado.id ? actualizado : u)));
      setMensaje("Rol actualizado correctamente.");
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarCambioEstado = async (userId, activo) => {
    setMensaje("");
    setError("");
    try {
      const actualizado = await updateUserStatus(token, userId, activo);
      setUsuarios((prev) => prev.map((u) => (u.id === actualizado.id ? actualizado : u)));
      setMensaje("Estado actualizado correctamente.");
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarUsuario = async (userId) => {
    setMensaje("");
    setError("");
    try {
      await deleteUserByAdmin(token, userId);
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));
      setMensaje("Usuario eliminado correctamente.");
    } catch (err) {
      setError(err.message);
    }
  };

  const totalActivos = useMemo(() => usuarios.filter((u) => u.activo).length, [usuarios]);

  if (perfilActual?.rol !== "admin") {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
        <h2 className="text-2xl font-semibold">Gestion de Usuarios</h2>
        <p className="mt-3 text-zinc-300">
          Este modulo solo esta disponible para usuarios con rol administrador.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Gestion de Usuarios</h2>
          <p className="mt-1 text-sm text-zinc-400">Administra cuentas, roles y estado de acceso.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarUsuarios}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Recargar
          </button>
          <button
            onClick={abrirCrear}
            className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
          >
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Total</p>
          <p className="mt-1 text-xl font-semibold">{usuarios.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Activos</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">{totalActivos}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Inactivos</p>
          <p className="mt-1 text-xl font-semibold text-zinc-300">{usuarios.length - totalActivos}</p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
      {mensaje && <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{mensaje}</p>}

      {loading ? (
        <p className="mt-4 text-sm text-zinc-400">Cargando usuarios...</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-zinc-950/70">
              <tr className="text-left text-zinc-400">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Usuario</th>
                <th className="px-3 py-2">Correo</th>
                <th className="px-3 py-2">Rol</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t border-zinc-900">
                  <td className="px-3 py-3 text-zinc-500">{u.id}</td>
                  <td className="px-3 py-3">{u.nombre_usuario}</td>
                  <td className="px-3 py-3 text-zinc-300">{u.correo}</td>
                  <td className="px-3 py-3">
                    <select
                      value={u.rol}
                      onChange={(e) => manejarCambioRol(u.id, e.target.value)}
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100"
                    >
                      {ROLES.map((rol) => (
                        <option key={rol} value={rol}>{rol}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${u.activo ? "bg-emerald-500/20 text-emerald-200" : "bg-zinc-700 text-zinc-300"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
                        onClick={() => abrirEditar(u)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
                        onClick={() => manejarCambioEstado(u.id, !u.activo)}
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200"
                        onClick={() => eliminarUsuario(u.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {modoModal === "crear" ? "Crear usuario" : `Editar usuario #${usuarioEditando?.id}`}
              </h3>
              <button type="button" onClick={cerrarModal} className="text-zinc-400 hover:text-zinc-200">Cerrar</button>
            </div>

            <form onSubmit={onSubmitModal} className="grid gap-3 md:grid-cols-2">
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Nombres" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Apellidos" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Nombre de usuario" value={form.nombre_usuario} onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })} required />
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" type="email" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
              {modoModal === "crear" && (
                <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm md:col-span-2" type="password" placeholder="Contrasena segura" value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })} required />
              )}
              <select className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                {ROLES.map((rol) => (
                  <option key={rol} value={rol}>{rol}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                Usuario activo
              </label>

              <div className="mt-2 flex gap-2 md:col-span-2">
                <button type="submit" disabled={guardando} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60">
                  {guardando ? "Guardando..." : modoModal === "crear" ? "Crear" : "Guardar cambios"}
                </button>
                <button type="button" onClick={cerrarModal} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default GestionUsuarios;
