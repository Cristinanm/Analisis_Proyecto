import { useState, useEffect } from "react";
import { getDashboardTotales } from "../services/dashboardService";
import BusquedaAvanzadaVehiculos from "./BusquedaAvanzadaVehiculos";

export const Dashboard = () => {
  const [totales, setTotales] = useState({
    total_vehiculos: 0,
    multas_pagadas: 0,
    multas_pendientes: 0,
  });

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getDashboardTotales();
        if (data) setTotales(data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();

    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const tarjetas = [
    {
      titulo: "Total de Vehículos",
      valor: totales.total_vehiculos,
      icono: "🚗",
      color: "from-blue-600 to-indigo-600",
      borde: "border-blue-500/40",
      texto: "text-blue-300",
    },
    {
      titulo: "Multas Pagadas",
      valor: totales.multas_pagadas,
      icono: "✅",
      color: "from-emerald-600 to-green-600",
      borde: "border-emerald-500/40",
      texto: "text-emerald-300",
    },
    {
      titulo: "Multas Pendientes",
      valor: totales.multas_pendientes,
      icono: "⚠️",
      color: "from-rose-600 to-red-600",
      borde: "border-rose-500/40",
      texto: "text-rose-300",
    },
  ];

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur">
        <span className="inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
          Panel administrativo
        </span>

        <h1 className="mt-4 text-3xl font-bold text-zinc-100">
          Panel de Control del Sistema
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Resumen general de vehículos, estado actual de las multas y búsqueda
          rápida de registros.
        </p>
      </header>

      {cargando ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-300 shadow-2xl">
          Cargando información del sistema...
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {tarjetas.map((tarjeta) => (
            <div
              key={tarjeta.titulo}
              className={`rounded-2xl border ${tarjeta.borde} bg-zinc-900/80 p-6 shadow-2xl transition hover:-translate-y-1 hover:shadow-blue-950/40`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-400">
                    {tarjeta.titulo}
                  </p>

                  <p className={`mt-4 text-4xl font-bold ${tarjeta.texto}`}>
                    {tarjeta.valor}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${tarjeta.color} text-2xl shadow-lg`}
                >
                  {tarjeta.icono}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BusquedaAvanzadaVehiculos />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-zinc-100">
          Accesos rápidos
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Usa el menú lateral para registrar vehículos, consultar placas,
          registrar multas o revisar reportes.
        </p>
      </div>
    </section>
  );
};