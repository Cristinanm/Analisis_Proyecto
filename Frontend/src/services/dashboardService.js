// src/services/dashboardService.js
const API_URL = "http://localhost:8000/api/reportes/dashboard";

export const getDashboardTotales = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Error al obtener los datos del dashboard");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en getDashboardTotales:", error);
        return null; // Devuelve null si hay error para que la pantalla no explote
    }
};