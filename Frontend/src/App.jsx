import { useEffect, useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage";
import GestionPropietarios from "./pages/GestionPropietarios";
import GestionUsuarios from "./pages/GestionUsuarios";
import RegistroMultas from "./pages/RegistroMultas";
import ReporteMultasPagadas from "./pages/ReporteMultasPagadas";
import ReporteMultasPendientes from "./pages/ReporteMultasPendientes";
import {
  HomeIcon,
  LogoutIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
} from "./components/UiIcons";
import { getMyProfile } from "./services/authApi";

const MODULOS = [
  { key: "inicio", label: "Inicio", icon: HomeIcon },
  { key: "multas", label: "Registro de Multas", icon: TicketIcon },
  { key: "personas", label: "Modulo Personas", icon: UsersIcon },
  { key: "reportes", label: "Reportes", icon: TicketIcon },
  { key: "perfil", label: "Mi Perfil", icon: UserIcon },
  { key: "usuarios", label: "Gestion Usuarios", icon: UsersIcon },
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
    if (moduloActivo === "multas") return <RegistroMultas />;
    if (moduloActivo === "personas") return <GestionPropietarios />;

    if (moduloActivo === "reportes") {
      return <ReporteMultasPagadas />;
    }

    if (moduloActivo === "perfil") {
      return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
          <h2 className="text-2xl font-semibold text-zinc-100">Perfil del Usuario</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
              <span className="text-zinc-400">Nombre:</span> {perfil?.nombres} {perfil?.apellidos}
            </p>
            <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
              <span className="text-zinc-400">Usuario:</span> {perfil?.nombre_usuario}
            </p>
            <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
              <span className="text-zinc-400">Correo:</span> {perfil?.correo}
            </p>
            <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
              <span className="text-zinc-400">Rol:</span> {perfil?.rol}
            </p>
          </div>
        </section>
      );
    }

    if (moduloActivo === "usuarios") {
      return <GestionUsuarios token={token} perfilActual={perfil} />;
    }

    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
        <h2 className="text-2xl font-semibold text-zinc-100">Panel Principal</h2>
        <p className="mt-3 text-zinc-300">
          Navega por la barra lateral para entrar a los modulos habilitados del sistema.
        </p>
      </section>
    );
  }, [moduloActivo, perfil, token]);

  if (!token) return <AuthPage onAuthenticated={setToken} />;

  if (loadingPerfil) {
    return (
      <main className="flex min-h-screen items-center justify-center text-zinc-100">
        Cargando perfil...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent">
      <div className="min-h-screen md:flex">
        <aside className="w-full border-b border-zinc-800 bg-zinc-950/95 px-4 py-5 md:sticky md:top-0 md:h-screen md:w-72 md:border-b-0 md:border-r md:px-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Workspace</p>
          <h1 className="mt-2 text-xl font-semibold text-zinc-100">Control Empresarial</h1>
          <p className="mt-1 text-xs text-zinc-500">Usuario activo: {perfil?.nombre_usuario}</p>

          <nav className="mt-5 grid gap-2">
            {MODULOS.map((modulo) => {
              const Icon = modulo.icon;
              const activo = moduloActivo === modulo.key;
              return (
                <button
                  key={modulo.key}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    activo
                      ? "bg-zinc-800 text-amber-100"
                      : "text-zinc-300 hover:bg-zinc-900/60"
                  }`}
                  onClick={() => setModuloActivo(modulo.key)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{modulo.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
            onClick={() => {
              localStorage.removeItem("token");
              setToken("");
              setModuloActivo("inicio");
            }}
          >
            <LogoutIcon className="h-4 w-4" />
            Cerrar sesion
          </button>
        </aside>

        <section className="w-full px-4 py-4 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl space-y-4">
            <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-5 py-4 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Sistema</p>
              <h2 className="text-lg font-semibold text-zinc-100">Gestion de Plataforma</h2>
            </header>
            {contenido}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
