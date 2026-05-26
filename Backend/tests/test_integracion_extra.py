from datetime import date


def crear_propietario(client, dpi="3334567890101", correo="prop.extra@test.com"):
    response = client.post(
        "/api/propietarios/",
        json={
            "dpi": dpi,
            "nombre": "Carlos Ramirez",
            "correo": correo,
            "direccion": "Guatemala",
            "telefono": "55551234",
        },
    )
    assert response.status_code == 201
    return response.json()


def crear_vehiculo(client, propietario_id, placa="EXT123"):
    response = client.post(
        "/api/vehiculos/",
        json={
            "placa": placa,
            "marca": "Mazda",
            "modelo": "3",
            "anio": 2022,
            "propietario_id": propietario_id,
        },
    )
    assert response.status_code == 201
    return response.json()


def crear_multa(client, placa="EXT123", monto=400.00):
    response = client.post(
        "/api/multas/",
        json={
            "placa": placa,
            "fecha": str(date.today()),
            "tipo_infraccion": "Semaforo en rojo",
            "descripcion": "El conductor no respeto la luz roja",
            "monto_base": monto,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_integracion_historial_propietario(client):
    propietario = crear_propietario(
        client,
        dpi="3334567890101",
        correo="historial@test.com",
    )

    vehiculo = crear_vehiculo(
        client,
        propietario_id=propietario["id"],
        placa="HIS123",
    )

    multa = crear_multa(client, placa="HIS123", monto=450.00)

    response = client.get(f"/api/propietarios/{propietario['id']}/historial")

    assert response.status_code == 200

    data = response.json()

    assert data["propietario"]["id"] == propietario["id"]
    assert len(data["vehiculos"]) >= 1
    assert len(data["multas"]) >= 1
    assert data["vehiculos"][0]["placa"] == vehiculo["placa"]
    assert data["multas"][0]["id"] == multa["id"]


def test_integracion_reporte_multas_despues_de_pago(client):
    propietario = crear_propietario(
        client,
        dpi="4444567890101",
        correo="reporte@test.com",
    )

    crear_vehiculo(
        client,
        propietario_id=propietario["id"],
        placa="REP123",
    )

    multa = crear_multa(client, placa="REP123", monto=600.00)

    pago = client.put(
        f"/api/multas/{multa['id']}/pagar",
        params={"fecha_pago": str(date.today())},
    )

    assert pago.status_code == 200

    response = client.get("/api/reportes/multas", params={"estado": "pagada"})

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert len(data["items"]) >= 1

    ids = [item["id"] for item in data["items"]]
    assert multa["id"] in ids


def test_integracion_ingresos_recaudados(client):
    propietario = crear_propietario(
        client,
        dpi="5554567890101",
        correo="ingresos@test.com",
    )

    crear_vehiculo(
        client,
        propietario_id=propietario["id"],
        placa="ING123",
    )

    multa = crear_multa(client, placa="ING123", monto=700.00)

    pago = client.put(
        f"/api/multas/{multa['id']}/pagar",
        params={"fecha_pago": str(date.today())},
    )

    assert pago.status_code == 200

    response = client.get(
        "/api/reportes/ingresos-recaudados",
        params={"agrupacion": "dia"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["agrupacion"] == "dia"
    assert data["total_general"] > 0
    assert len(data["items"]) >= 1


def test_integracion_busqueda_recibos_despues_de_pago(client):
    propietario = crear_propietario(
        client,
        dpi="6664567890101",
        correo="recibos@test.com",
    )

    crear_vehiculo(
        client,
        propietario_id=propietario["id"],
        placa="REC123",
    )

    multa = crear_multa(client, placa="REC123", monto=350.00)

    pago = client.put(
        f"/api/multas/{multa['id']}/pagar",
        params={"fecha_pago": str(date.today())},
    )

    assert pago.status_code == 200

    response = client.get("/api/recibos/buscar")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    recibo = data[0]

    assert "id_factura" in recibo
    assert "propietario_nombre" in recibo
    assert "placa_vehiculo" in recibo
    assert "total_pagado" in recibo
    assert "multas" in recibo


def test_integracion_auth_registro_login_perfil(client):
    usuario = {
        "nombres": "Ana",
        "apellidos": "Gomez",
        "nombre_usuario": "ana_integracion",
        "correo": "ana.integracion@test.com",
        "contrasena": "Admin123!",
    }

    registro = client.post("/auth/register", json=usuario)

    assert registro.status_code == 201

    login = client.post(
        "/auth/login",
        json={
            "usuario_o_correo": "ana.integracion@test.com",
            "contrasena": "Admin123!",
        },
    )

    assert login.status_code == 200

    token = login.json()["access_token"]

    perfil = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert perfil.status_code == 200

    data = perfil.json()

    assert data["correo"] == "ana.integracion@test.com"
    assert data["nombre_usuario"] == "ana_integracion"