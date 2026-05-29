import uuid


def crear_propietario(client):
    unico = str(uuid.uuid4())[:8]

    payload = {
        "dpi": f"98765{unico}",
        "nombre": "Propietario Vehiculo",
        "correo": f"propvehiculo{unico}@test.com",
        "direccion": "Zona 5",
        "telefono": "55556666"
    }

    response = client.post("/api/propietarios/", json=payload)
    assert response.status_code in [200, 201]

    return response.json()


def crear_vehiculo_payload(propietario_id, placa=None):
    if placa is None:
        placa = f"P{str(uuid.uuid4())[:5].upper()}"

    return {
        "placa": placa,
        "marca": "Toyota",
        "modelo": "Corolla",
        "anio": 2024,
        "propietario_id": propietario_id
    }


def test_crear_vehiculo_placa_duplicada(client):
    propietario = crear_propietario(client)

    payload = crear_vehiculo_payload(propietario["id"], "P111AAA")

    response_1 = client.post("/api/vehiculos/", json=payload)
    assert response_1.status_code in [200, 201]

    response_2 = client.post("/api/vehiculos/", json=payload)

    assert response_2.status_code == 400
    assert response_2.json()["detail"] == "La placa ya existe"


def test_crear_vehiculo_propietario_no_existe_router(client):
    payload = crear_vehiculo_payload(99999, "P222BBB")

    response = client.post("/api/vehiculos/", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "El propietario seleccionado no existe"

def test_eliminar_vehiculo_correctamente(client):
    propietario = crear_propietario(client)

    payload = crear_vehiculo_payload(propietario["id"], "P444DDD")

    response_crear = client.post("/api/vehiculos/", json=payload)
    assert response_crear.status_code in [200, 201]

    vehiculo_id = response_crear.json()["id"]

    response = client.delete(f"/api/vehiculos/{vehiculo_id}")

    assert response.status_code == 200
    assert response.json()["mensaje"] == "Vehículo eliminado correctamente"


def test_eliminar_vehiculo_no_existente(client):
    response = client.delete("/api/vehiculos/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "No se encontró un vehículo con el ID '99999'"