from datetime import date


def test_integracion_sistema_completo(client):
    # 1. Salud del backend
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    # 2. Registro de usuario
    usuario = {
        "nombres": "Admin",
        "apellidos": "Sistema",
        "nombre_usuario": "admin_sistema",
        "correo": "admin.sistema@test.com",
        "contrasena": "Admin123!",
    }

    res = client.post("/auth/register", json=usuario)
    assert res.status_code == 201

    # 3. Login
    res = client.post(
        "/auth/login",
        json={
            "usuario_o_correo": "admin.sistema@test.com",
            "contrasena": "Admin123!",
        },
    )
    assert res.status_code == 200
    token = res.json()["access_token"]

    # 4. Perfil autenticado
    res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["correo"] == "admin.sistema@test.com"

    # 5. Crear propietario
    propietario = {
        "dpi": "7774567890101",
        "nombre": "Roberto Morales",
        "correo": "roberto.sistema@test.com",
        "direccion": "Guatemala",
        "telefono": "55557777",
    }

    res = client.post("/api/propietarios/", json=propietario)
    assert res.status_code == 201
    propietario_creado = res.json()

    # 6. Buscar propietario
    res = client.get(
        "/api/propietarios/buscar",
        params={"nombre": "Roberto"},
    )
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 7. Crear vehículo
    vehiculo = {
        "placa": "SYS123",
        "marca": "Toyota",
        "modelo": "Hilux",
        "anio": 2023,
        "propietario_id": propietario_creado["id"],
    }

    res = client.post("/api/vehiculos/", json=vehiculo)
    assert res.status_code == 201
    vehiculo_creado = res.json()
    assert vehiculo_creado["placa"] == "SYS123"

    # 8. Buscar vehículo por placa
    res = client.get("/api/vehiculos/placa/SYS123")
    assert res.status_code == 200
    assert res.json()["placa"] == "SYS123"

    # 9. Crear multa
    multa = {
        "placa": "SYS123",
        "fecha": str(date.today()),
        "tipo_infraccion": "Exceso de velocidad",
        "descripcion": "Velocidad superior al limite permitido",
        "monto_base": 500.00,
    }

    res = client.post("/api/multas/", json=multa)
    assert res.status_code == 201
    multa_creada = res.json()
    assert multa_creada["estado"] == "pendiente"

    # 10. Consultar multas por placa
    res = client.get("/api/consultas/multas-por-placa/SYS123")
    assert res.status_code == 200
    consulta = res.json()
    assert consulta["vehiculo"]["placa"] == "SYS123"
    assert len(consulta["multas"]) >= 1

    # 11. Pagar multa
    res = client.put(
        f"/api/multas/{multa_creada['id']}/pagar",
        params={"fecha_pago": str(date.today())},
    )
    assert res.status_code == 200
    assert res.json()["estado"] == "pagada"

    # 12. Consultar reporte de multas
    res = client.get("/api/reportes/multas", params={"estado": "pagada"})
    assert res.status_code == 200
    assert "items" in res.json()

    # 13. Consultar ingresos recaudados
    res = client.get(
        "/api/reportes/ingresos-recaudados",
        params={"agrupacion": "dia"},
    )
    assert res.status_code == 200
    assert res.json()["total_general"] > 0

    # 14. Buscar recibos
    res = client.get("/api/recibos/buscar")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # 15. Exportar CSV
    res = client.get("/api/reportes/multas/exportar-csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]