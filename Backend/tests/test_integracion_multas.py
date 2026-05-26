from datetime import date, timedelta


def test_flujo_completo_propietario_vehiculo_multa_pago(client):
    propietario_data = {
        "dpi": "1234567890101",
        "nombre": "Luis Perez",
        "correo": "luis.integracion@test.com",
        "direccion": "Guatemala",
        "telefono": "55555555",
    }

    res_propietario = client.post("/api/propietarios/", json=propietario_data)

    assert res_propietario.status_code == 201
    propietario = res_propietario.json()
    assert propietario["nombre"] == "Luis Perez"
    assert propietario["dpi"] == "1234567890101"

    vehiculo_data = {
        "placa": "INT123",
        "marca": "Toyota",
        "modelo": "Corolla",
        "anio": 2020,
        "propietario_id": propietario["id"],
    }

    res_vehiculo = client.post("/api/vehiculos/", json=vehiculo_data)

    assert res_vehiculo.status_code == 201
    vehiculo = res_vehiculo.json()
    assert vehiculo["placa"] == "INT123"
    assert vehiculo["propietario_id"] == propietario["id"]

    multa_data = {
        "placa": "INT123",
        "fecha": str(date.today()),
        "tipo_infraccion": "Exceso de velocidad",
        "descripcion": "El vehiculo excedio el limite permitido",
        "monto_base": 500.00,
    }

    res_multa = client.post("/api/multas/", json=multa_data)

    assert res_multa.status_code == 201
    multa = res_multa.json()
    assert multa["estado"] == "pendiente"
    assert multa["monto_base"] == 500.00

    res_consulta = client.get("/api/consultas/multas-por-placa/INT123")

    assert res_consulta.status_code == 200
    consulta = res_consulta.json()
    assert consulta["vehiculo"]["placa"] == "INT123"
    assert len(consulta["multas"]) >= 1

    fecha_pago = str(date.today())

    res_pago = client.put(
        f"/api/multas/{multa['id']}/pagar",
        params={"fecha_pago": fecha_pago},
    )

    assert res_pago.status_code == 200
    pago = res_pago.json()
    assert pago["estado"] == "pagada"
    assert pago["fecha_pago"] == fecha_pago
    assert pago["monto_total_a_pagar"] > 0


def test_no_permite_pago_con_fecha_futura(client):
    propietario_data = {
        "dpi": "2234567890101",
        "nombre": "Maria Lopez",
        "correo": "maria.integracion@test.com",
        "direccion": "Guatemala",
        "telefono": "55556666",
    }

    res_propietario = client.post("/api/propietarios/", json=propietario_data)
    assert res_propietario.status_code == 201

    propietario = res_propietario.json()

    vehiculo_data = {
        "placa": "FUT123",
        "marca": "Honda",
        "modelo": "Civic",
        "anio": 2021,
        "propietario_id": propietario["id"],
    }

    res_vehiculo = client.post("/api/vehiculos/", json=vehiculo_data)
    assert res_vehiculo.status_code == 201

    multa_data = {
        "placa": "FUT123",
        "fecha": str(date.today()),
        "tipo_infraccion": "Estacionamiento prohibido",
        "descripcion": "Vehiculo estacionado en area no permitida",
        "monto_base": 300.00,
    }

    res_multa = client.post("/api/multas/", json=multa_data)
    assert res_multa.status_code == 201

    multa = res_multa.json()

    fecha_futura = str(date.today() + timedelta(days=5))

    res_pago = client.put(
        f"/api/multas/{multa['id']}/pagar",
        params={"fecha_pago": fecha_futura},
    )

    assert res_pago.status_code == 400
    assert "fecha futura" in res_pago.json()["detail"].lower()