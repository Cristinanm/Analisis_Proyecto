import { useEffect, useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage";
import RegistroPropietario from "./pages/RegistroPropietario";
import GestionUsuarios from "./pages/GestionUsuarios";
import RegistroMultas from "./pages/RegistroMultas";

import ReporteMultasEstado from "./pages/ReporteMultasEstado";
import ConsultaMultasPorPlaca from "./pages/ConsultaMultasPorPlaca";

import ReporteMultasPagadas from "./pages/ReporteMultasPagadas";
import ReporteMultasPendientes from "./pages/ReporteMultasPendientes";
import ConsultaMultasPorPlaca from "./pages/ConsultaMultasPorPlaca"; // ✅ RF-39
import { Dashboard } from "./pages/Dashboard"; // ✅ RF-25 / RF-27
 main

import {
  HomeIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
} from "./components/UiIcons";

import { getMyProfile } from "./services/authApi";

const MODULOS = [
  { key: "inicio", label: "Inicio", icon: HomeIcon },
  { key: "multas", label: "Registro de Multas", icon: TicketIcon },
  { key: "consulta-multas", label: "Consulta por Placa", icon: TicketIcon },
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

    if (moduloActivo === "multas") {
      return <RegistroMultas />;
    }


    if (moduloActivo === "inicio") {
      return <Dashboard />;
    }


    if (moduloActivo === "multas") return <RegistroMultas />;
 main

    if (moduloActivo === "consulta-multas") {
      return <ConsultaMultasPorPlaca />;
    }

    if (moduloActivo === "personas") {
      return <RegistroPropietario />;
    }

    if (moduloActivo === "reportes") {
      return <ReporteMultasEstado />;
    }

    if (moduloActivo === "perfil") {
      return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-100 shadow-2xl">
          <h2 className="text-2xl font-semibold">Perfil del Usuario</h2>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <strong>Nombre:</strong> {perfil?.nombres} {perfil?.apellidos}
            </p>
            <p>
              <strong>Usuario:</strong> {perfil?.nombre_usuario}
            </p>
            <p>
              <strong>Correo:</strong> {perfil?.correo}
            </p>
            <p>
              <strong>Rol:</strong> {perfil?.rol}
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
        <h2 className="text-2xl font-semibold">Panel Principal</h2>
        <p className="mt-3">
          Navega por la barra lateral para usar el sistema.
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
    <main className="min-h-screen">
      <div className="min-h-screen md:flex">
        <aside className="w-full md:w-72 bg-zinc-950 p-5">
          <h1 className="text-xl text-white">Control Empresarial</h1>

          <nav className="mt-5 space-y-2">
            {MODULOS.map((modulo) => (
              <button
                key={modulo.key}
                onClick={() => setModuloActivo(modulo.key)}
                className="block w-full text-left text-white hover:bg-zinc-800 p-2 rounded"
              >
                {modulo.label}
              </button>
            ))}
          </nav>

          <button
            className="mt-5 bg-red-500 text-white p-2 w-full"
            onClick={() => {
              localStorage.removeItem("token");
              setToken("");
            }}
          >
            Cerrar sesión
          </button>
        </aside>

        <section className="w-full p-6">{contenido}</section>
      </div>
    </main>
  );
}

export default App;