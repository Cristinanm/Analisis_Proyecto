import { useEffect, useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage";
import RegistroMultas from "./pages/RegistroMultas";
import { getMyProfile } from "./services/authApi";

const MODULOS = [
  { key: "inicio", label: "Inicio" },
  { key: "multas", label: "Registro de Multas" },
  { key: "perfil", label: "Mi Perfil" },
  { key: "usuarios", label: "Gestion Usuarios" },
];

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [perfil, setPerfil] = useState(null);
  const [loadingPerfil, setLoadingPerfil] = useState(Boolean(token));
  const [moduloActivo, setModuloActivo] = useState("inicio");

  useEffect(() => {
    if (!token) {
      setPerfil(null);
      setLoadingPerfil(false);
      return;
    }

    setLoadingPerfil(true);
    getMyProfile(token)
      .then((data) => setPerfil(data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken("");
      })
      .finally(() => setLoadingPerfil(false));
  }, [token]);

  const contenido = useMemo(() => {
    if (moduloActivo === "multas") {
      return <RegistroMultas />;
    }

    if (moduloActivo === "perfil") {
      return (
        <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-100 shadow-xl">
          <h2 className="text-2xl font-semibold text-cyan-300">Perfil del Usuario</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <p className="rounded-xl bg-slate-950/70 p-3"><span className="text-slate-400">Nombre:</span> {perfil?.nombres} {perfil?.apellidos}</p>
            <p className="rounded-xl bg-slate-950/70 p-3"><span className="text-slate-400">Usuario:</span> {perfil?.nombre_usuario}</p>
            <p className="rounded-xl bg-slate-950/70 p-3"><span className="text-slate-400">Correo:</span> {perfil?.correo}</p>
            <p className="rounded-xl bg-slate-950/70 p-3"><span className="text-slate-400">Rol:</span> {perfil?.rol}</p>
          </div>
        </section>
      );
    }

    if (moduloActivo === "usuarios") {
      return (
        <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-100 shadow-xl">
          <h2 className="text-2xl font-semibold text-cyan-300">Gestion de Usuarios</h2>
          <p className="mt-3 text-slate-300">
            Modulo reservado para administracion de roles y usuarios. Aqui integraremos el siguiente avance.
          </p>
        </section>
      );
    }

    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-100 shadow-xl">
        <h2 className="text-2xl font-semibold text-cyan-300">Panel Principal</h2>
        <p className="mt-3 text-slate-300">
          Navega por la barra lateral para entrar a los modulos habilitados del sistema.
        </p>
      </section>
    );
  }, [moduloActivo, perfil]);

  if (!token) {
    return <AuthPage onAuthenticated={setToken} />;
  }

  if (loadingPerfil) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-100">
        Cargando perfil...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workspace</p>
          <h1 className="mt-2 text-xl font-semibold text-cyan-300">Control Empresarial</h1>
          <p className="mt-1 text-xs text-slate-400">Usuario activo: {perfil?.nombre_usuario}</p>

          <nav className="mt-5 space-y-2">
            {MODULOS.map((modulo) => (
              <button
                key={modulo.key}
                className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  moduloActivo === modulo.key
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                    : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                }`}
                onClick={() => setModuloActivo(modulo.key)}
              >
                {modulo.label}
              </button>
            ))}
          </nav>

          <button
            className="mt-6 w-full rounded-xl bg-rose-500/90 px-3 py-2.5 text-sm font-semibold text-white hover:bg-rose-500"
            onClick={() => {
              localStorage.removeItem("token");
              setToken("");
              setModuloActivo("inicio");
            }}
          >
            Cerrar sesion
          </button>
        </aside>

        <section className="space-y-4">
          <header className="rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-4 shadow-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sistema</p>
            <h2 className="text-lg font-semibold text-slate-100">Gestion de Plataforma</h2>
          </header>
          {contenido}
        </section>
      </div>
    </main>
  );
}

export default App;
