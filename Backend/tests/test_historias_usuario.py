from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ======================================================
# TESTS GENERALES
# ======================================================

def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_version():
    response = client.get("/version")

    assert response.status_code == 200
    assert "version" in response.json()


def test_root_responde():
    response = client.get("/")

    assert response.status_code in [200, 404]


# ======================================================
# SIS-37-RF-1 REGISTRO DE MULTAS
# ======================================================

def test_registrar_multa_placa_inexistente():
    payload = {
        "placa": "XYZ999",
        "fecha": "2026-05-20",
        "tipo_infraccion": "Exceso de velocidad",
        "descripcion": "Vehiculo excedio limite",
        "monto_base": 500
    }

    response = client.post("/api/multas/", json=payload)

    assert response.status_code in [400, 404]


# ======================================================
# SIS-48-RF-13 BUSQUEDA AVANZADA VEHICULOS
# ======================================================

def test_busqueda_vehiculos():
    response = client.get("/api/vehiculos/buscar?placa=P")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_busqueda_vehiculos_marca():
    response = client.get("/api/vehiculos/buscar?marca=Toyota")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_busqueda_vehiculos_propietario():
    response = client.get("/api/vehiculos/buscar?propietario=Juan")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ======================================================
# SIS-18-RF-49 REPORTES MULTAS PAGADAS
# ======================================================

def test_reporte_multas_pagadas():
    response = client.get(
        "/api/reportes/multas-pagadas?fecha_inicio=2026-01-01&fecha_fin=2026-12-31"
    )

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "total_ingresos" in data


def test_reporte_estado_multas():
    response = client.get("/api/reportes/multas-estado")

    assert response.status_code == 200

    data = response.json()

    assert "total_pagadas" in data
    assert "total_pendientes" in data
    assert "total_multas" in data


def test_reporte_multas_tiene_items():
    response = client.get("/api/reportes/multas")

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert isinstance(data["items"], list)


# ======================================================
# SIS-83-RF-63 REPORTES UNIFICADOS
# ======================================================

def test_reporte_unificado_multas():
    response = client.get("/api/reportes/multas")

    assert response.status_code == 200

    data = response.json()

    assert "items" in data


# ======================================================
# SIS-22-RNF-01 SEGURIDAD
# ======================================================

def test_login_invalido():
    payload = {
        "usuario_o_correo": "usuariofake",
        "contrasena": "123456"
    }

    response = client.post("/auth/login", json=payload)

    assert response.status_code in [400, 401, 422]


def test_registro_usuario():
    payload = {
        "nombres": "Pytest",
        "apellidos": "Testing",
        "nombre_usuario": "pytest_user_01",
        "correo": "pytest01@gmail.com",
        "contrasena": "Pytest123"
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code in [200, 201, 400]


def test_token_invalido():
    headers = {
        "Authorization": "Bearer token_invalido"
    }

    response = client.get("/auth/me", headers=headers)

    assert response.status_code in [401, 403]


# ======================================================
# TEST EXTRA VEHICULO POR PLACA
# ======================================================

def test_buscar_vehiculo_por_placa_inexistente():
    response = client.get("/api/vehiculos/placa/XXX999")

    assert response.status_code in [404]


# ======================================================
# TEST EXTRA DASHBOARD
# ======================================================

def test_dashboard():
    response = client.get("/api/reportes/dashboard")

    assert response.status_code == 200


def test_dashboard_tiene_totales():
    response = client.get("/api/reportes/dashboard")

    assert response.status_code == 200

    data = response.json()

    assert "total_vehiculos" in data
    assert "multas_pagadas" in data
    assert "multas_pendientes" in data


# ======================================================
# RF-18 CREACION PERSONA
# ======================================================

def test_listar_propietarios():
    response = client.get("/api/propietarios/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_propietario_no_existente():
    response = client.get("/api/propietarios/99999")

    assert response.status_code in [404]


def test_campos_obligatorios_propietario():
    payload = {
        "nombres": "",
        "apellidos": "",
        "dpi": "",
        "correo": ""
    }

    response = client.post("/api/propietarios/", json=payload)

    assert response.status_code in [400, 422]


def test_dpi_duplicado():
    payload = {
        "dpi": "1234567890101",
        "nombre": "Juan Perez",
        "correo": "juan1@gmail.com",
        "direccion": "Zona 1",
        "telefono": "55554444"
    }

    response = client.post("/api/propietarios/", json=payload)

    assert response.status_code in [201, 400]


def test_correo_duplicado():
    payload = {
        "dpi": "9876543210101",
        "nombre": "Carlos Lopez",
        "correo": "pytest01@gmail.com",
        "direccion": "Zona 10",
        "telefono": "55556666"
    }

    response = client.post("/api/propietarios/", json=payload)

    assert response.status_code in [201, 400]

# ======================================================
# RF-61 / RF-66 / RF-67 HISTORIAL PROPIETARIOS
# ======================================================

def test_historial_propietario_inexistente():
    response = client.get("/api/propietarios/99999/historial")

    assert response.status_code in [404]


def test_historial_propietario_inexistente():
    response = client.get("/api/propietarios/99999/historial")

    assert response.status_code in [404]


# ======================================================
# RF-25 DASHBOARD
# ======================================================

def test_dashboard_rf25():
    response = client.get("/api/reportes/dashboard")

    assert response.status_code == 200


# ======================================================
# RF-39 CONSULTA MULTAS POR PLACA
# ======================================================

def test_consulta_placa_inexistente():
    response = client.get("/api/vehiculos/placa/XXX999")

    assert response.status_code in [404]


def test_vehiculo_sin_multas():
    response = client.get("/api/vehiculos/placa/P000XYZ")

    assert response.status_code in [200, 404]