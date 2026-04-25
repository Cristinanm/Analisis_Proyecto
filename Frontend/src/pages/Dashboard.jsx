import { useState, useEffect } from "react";
import { getDashboardTotales } from "../services/dashboardService";

export const Dashboard = () => {
    const [totales, setTotales] = useState({
        total_vehiculos: 0,
        multas_pagadas: 0,
        multas_pendientes: 0
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            const data = await getDashboardTotales();
            if (data) {
                setTotales(data);
            }
            setCargando(false);
        };
        cargarDatos();
    }, []);

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1 style={{ fontSize: "24px", marginBottom: "20px", color: "#333" }}>Panel de Control del Sistema</h1>
            
            {cargando ? (
                <p>Cargando información del sistema...</p>
            ) : (
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    
                    {/* Tarjeta 1: Vehículos */}
                    <div style={tarjetaEstilo}>
                        <h3 style={tituloTarjeta}>Total de Vehículos</h3>
                        <p style={numeroEstilo}>{totales.total_vehiculos}</p>
                    </div>

                    {/* Tarjeta 2: Multas Pagadas */}
                    <div style={{...tarjetaEstilo, borderLeft: "5px solid #10b981"}}>
                        <h3 style={tituloTarjeta}>Multas Pagadas</h3>
                        <p style={{...numeroEstilo, color: "#10b981"}}>{totales.multas_pagadas}</p>
                    </div>

                    {/* Tarjeta 3: Multas Pendientes */}
                    <div style={{...tarjetaEstilo, borderLeft: "5px solid #ef4444"}}>
                        <h3 style={tituloTarjeta}>Multas Pendientes</h3>
                        <p style={{...numeroEstilo, color: "#ef4444"}}>{totales.multas_pendientes}</p>
                    </div>

                </div>
            )}
        </div>
    );
};

// Estilos básicos
const tarjetaEstilo = {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "20px",
    minWidth: "250px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    borderLeft: "5px solid #3b82f6" 
};
const tituloTarjeta = { margin: "0 0 10px 0", color: "#6b7280", fontSize: "16px", fontWeight: "normal" };
const numeroEstilo = { margin: "0", fontSize: "32px", fontWeight: "bold", color: "#1f2937" };