const API_URL = "http://localhost:8000/api/recibos";

export const buscarRecibos = async (termino = "") => {
    try {
        const response = await fetch(`${API_URL}/buscar?termino=${termino}`);
        if (!response.ok) {
            throw new Error("Error al buscar recibos");
        }
        return await response.json();
    } catch (error) {
        console.error("Error en buscarRecibos:", error);
        return [];
    }
};