import uuid


def crear_propietario_payload():
    unico = str(uuid.uuid4())[:8]

    return {
        "dpi": f"12345{unico}",
        "nombre": "Juan Perez",
        "correo": f"juan{unico}@test.com",
        "direccion": "Zona 1",
        "telefono": "55554444"
    }


def test_actualizar_propietario_no_existente(client):
    payload = crear_propietario_payload()

    response = client.put("/api/propietarios/99999", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "Propietario no encontrado."


def test_actualizar_propietario_dpi_duplicado(client):
    propietario_1 = crear_propietario_payload()
    propietario_2 = crear_propietario_payload()

    response_1 = client.post("/api/propietarios/", json=propietario_1)
    response_2 = client.post("/api/propietarios/", json=propietario_2)

    assert response_1.status_code in [200, 201]
    assert response_2.status_code in [200, 201]

    id_propietario_2 = response_2.json()["id"]

    propietario_2_actualizado = {
        "dpi": propietario_1["dpi"],
        "nombre": "Carlos Lopez",
        "correo": propietario_2["correo"],
        "direccion": "Zona 2",
        "telefono": "55550000"
    }

    response = client.put(
        f"/api/propietarios/{id_propietario_2}",
        json=propietario_2_actualizado
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "El DPI ya existe"


def test_actualizar_propietario_correo_duplicado(client):
    propietario_1 = crear_propietario_payload()
    propietario_2 = crear_propietario_payload()

    response_1 = client.post("/api/propietarios/", json=propietario_1)
    response_2 = client.post("/api/propietarios/", json=propietario_2)

    assert response_1.status_code in [200, 201]
    assert response_2.status_code in [200, 201]

    id_propietario_2 = response_2.json()["id"]

    propietario_2_actualizado = {
        "dpi": propietario_2["dpi"],
        "nombre": "Carlos Lopez",
        "correo": propietario_1["correo"],
        "direccion": "Zona 2",
        "telefono": "55550000"
    }

    response = client.put(
        f"/api/propietarios/{id_propietario_2}",
        json=propietario_2_actualizado
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "El correo ya está registrado"


def test_actualizar_propietario_correctamente(client):
    propietario = crear_propietario_payload()

    response_crear = client.post("/api/propietarios/", json=propietario)

    assert response_crear.status_code in [200, 201]

    propietario_id = response_crear.json()["id"]

    payload_actualizado = {
        "dpi": propietario["dpi"],
        "nombre": "Ana Actualizada",
        "correo": propietario["correo"],
        "direccion": "Zona 10",
        "telefono": "55551111"
    }

    response = client.put(
        f"/api/propietarios/{propietario_id}",
        json=payload_actualizado
    )

    assert response.status_code == 200
    data = response.json()

    assert data["nombre"] == "Ana Actualizada"
    assert data["direccion"] == "Zona 10"
    assert data["telefono"] == "55551111"