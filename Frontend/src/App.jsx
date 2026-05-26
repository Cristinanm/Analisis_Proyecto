import { useEffect, useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage";
import RegistroPropietario from "./pages/RegistroPropietario";
import GestionUsuarios from "./pages/GestionUsuarios";
import RegistroMultas from "./pages/RegistroMultas";
import RegistroVehiculos from "./pages/RegistroVehiculos";

import HistorialPropietarios from "./pages/HistorialPropietarios";

import ReporteMultasEstado from "./pages/ReporteMultasEstado";
import IngresosRecaudados from "./pages/IngresosRecaudados";
import ConsultaMultasPorPlaca from "./pages/ConsultaMultasPorPlaca";
import BusquedaAvanzadaVehiculos from "./pages/BusquedaAvanzadaVehiculos";
import BusquedaRecibos from "./pages/BusquedaRecibos";

import { Dashboard } from "./pages/Dashboard";

import {
  HomeIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
  MoneyIcon,
  CitationIcon,
  VehicleIcon

} from "./components/UiIcons";

import { getMyProfile } from "./services/authApi";

const MODULOS = [
  {
    categoria: "Principal",
    items: [
      { key: "inicio", label: "Inicio", icon: HomeIcon },
    ],
  },
  {
    categoria: "Multas",
    items: [
      { key: "multas", label: "Registro de Multas", icon: CitationIcon },
      { key: "control-infracciones", label: "Control de Infracciones", icon: TicketIcon },
      { key: "reportes", label: "Reportes de Multas", icon: TicketIcon },
    ],
  },
  {
    categoria: "Vehículos",
    items: [
      { key: "vehiculos", label: "Registro Vehículos", icon: VehicleIcon },
    ],
  },
  {
    categoria: "Personas",
    items: [
      { key: "personas", label: "Registro Propietarios", icon: UsersIcon },
      { key: "historial-propietarios", label: "Historial Propietarios", icon: UsersIcon },
    ],
  },
  {
    categoria: "Finanzas",
    items: [
      { key: "ingresos-recaudados", label: "Ingresos Recaudados", icon: MoneyIcon },
      { key: "visor-recibos", label: "Visor de Recibos", icon: TicketIcon },
    ],
  },
  {
    categoria: "Sistema",
    items: [
      { key: "perfil", label: "Mi Perfil", icon: UserIcon },
      { key: "usuarios", label: "Gestión Usuarios", icon: UsersIcon },
    ],
  },
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
    if (moduloActivo === "visor-recibos") {
      return <BusquedaRecibos />;
    }

    if (moduloActivo === "inicio") {
      return <Dashboard />;
    }

    if (moduloActivo === "multas") {
      return <RegistroMultas />;
    }

    if (moduloActivo === "control-infracciones") {
      return <ConsultaMultasPorPlaca />;
    }

    if (moduloActivo === "vehiculos") {
      return <RegistroVehiculos token={token} />;
    }

    if (moduloActivo === "busqueda-vehiculos") {
      return <BusquedaAvanzadaVehiculos />;
    }

    if (moduloActivo === "personas") {
      return <RegistroPropietario />;
    }

    if (moduloActivo === "historial-propietarios") {
      return <HistorialPropietarios />;
    }

    if (moduloActivo === "reportes") {
      return <ReporteMultasEstado />;
    }

    if (moduloActivo === "ingresos-recaudados") {
      return <IngresosRecaudados />;
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
        <aside className="w-full md:w-72 bg-slate-950 p-5 shadow-2xl">
          <h1 className="mb-6 text-2xl font-bold text-white">
            TransitHub
          </h1>

          <nav className="space-y-6">
            {MODULOS.map((grupo) => (
              <div key={grupo.categoria}>
                <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {grupo.categoria}
                </p>

                <div className="space-y-2">
                  {grupo.items.map((modulo) => (
                    <button
                      key={modulo.key}
                      onClick={() => setModuloActivo(modulo.key)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                        moduloActivo === modulo.key
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      <modulo.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{modulo.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <button
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-red-700"
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