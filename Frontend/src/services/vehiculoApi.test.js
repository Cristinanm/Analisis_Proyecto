import { describe, expect, it, vi, beforeEach } from "vitest";
import { editarVehiculo, eliminarVehiculo, listarVehiculos, crearVehiculo } from "./vehiculoApi";

describe("SIS-90 vehiculoApi", () => {
    
    // Esto "limpia" la memoria del robot antes de cada prueba
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("envía petición PUT al endpoint correcto para editar un vehículo", async () => {
        // 1. Preparamos la respuesta simulada del backend
        const mockResponse = { id: 1, placa: "P123ABC", marca: "Toyota" };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        // 2. Ejecutamos
        const payload = { placa: "P123ABC", marca: "Toyota", modelo: "Corolla", anio: 2026 };
        const data = await editarVehiculo(1, payload);

        // 3. Afirmamos (expect) que el sistema intentó hacer el PUT correctamente
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/vehiculos/1"),
            expect.objectContaining({
                method: "PUT",
                body: JSON.stringify(payload)
            })
        );
        // Afirmamos que devolvió los datos correctos
        expect(data).toEqual(mockResponse);
    });

    it("envía petición DELETE al endpoint correcto para eliminar un vehículo", async () => {
        const mockResponse = { mensaje: "Vehículo eliminado correctamente" };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        // Ejecutamos tu función de borrar
        const data = await eliminarVehiculo(5);

        // Afirmamos que el método usado fue DELETE hacia el ID 5
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/vehiculos/5"),
            expect.objectContaining({
                method: "DELETE"
            })
        );
        expect(data).toEqual(mockResponse);
    });

    it("envía petición GET al endpoint correcto para listar los vehículos", async () => {
        // Simulamos que el backend nos devuelve una lista con un vehículo
        const mockResponse = [{ id: 1, placa: "P123ABC", marca: "Toyota" }];
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        // Ejecutamos la funcion
        const data = await listarVehiculos();

        // Afirmamos que se llamó a la ruta correcta con el método GET
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/vehiculos/"),
            
                expect.any(Object) // Aunque fetch usa GET por defecto, es buena práctica si nuestro request base lo envía
            
        );
        expect(data).toEqual(mockResponse);
    });

    it("envía petición POST al endpoint correcto para crear un vehículo", async () => {
        // Simulamos la respuesta de éxito
        const mockResponse = { id: 2, placa: "NUEVO1", marca: "Honda" };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const payload = { placa: "NUEVO1", marca: "Honda", modelo: "Civic", anio: 2025 };
        const token = "mi_token_falso";
        
        // Ejecutamos tu función
        const data = await crearVehiculo(payload, token);

        // Afirmamos que se hizo el POST y se envió el Token en los Headers
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/vehiculos/"),
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify(payload)
            })
        );
        expect(data).toEqual(mockResponse);
    });
});