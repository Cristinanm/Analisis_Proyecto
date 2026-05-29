import pytest
import uuid

from app.models.propietario import Propietario
from app.schemas.vehiculo_schema import VehiculoCreate
from app.services.vehiculo_service import crear_vehiculo


def crear_propietario_prueba(db):

    unico = str(uuid.uuid4())[:8]

    propietario = Propietario(
        dpi=f"12345{unico}",
        nombre="Juan Perez",
        correo=f"juan{unico}@test.com",
        direccion="Zona 1",
        telefono="55554444"
    )

    db.add(propietario)
    db.commit()
    db.refresh(propietario)

    return propietario


def test_crear_vehiculo_correctamente(db):

    propietario = crear_propietario_prueba(db)

    vehiculo_data = VehiculoCreate(
        placa="P123A1",
        marca="Toyota",
        modelo="Corolla",
        anio=2020,
        propietario_id=propietario.id
    )

    vehiculo = crear_vehiculo(db, vehiculo_data)

    assert vehiculo is not None
    assert vehiculo.placa == "P123A1"
    assert vehiculo.marca == "Toyota"
    assert vehiculo.modelo == "Corolla"
    assert vehiculo.anio == 2020
    assert vehiculo.propietario_id == propietario.id


def test_crear_vehiculo_propietario_no_existe(db):

    vehiculo_data = VehiculoCreate(
        placa="P999X1",
        marca="Honda",
        modelo="Civic",
        anio=2022,
        propietario_id=99999
    )

    vehiculo = crear_vehiculo(db, vehiculo_data)

    assert vehiculo is None


def test_crear_vehiculo_placa_en_mayusculas(db):

    propietario = crear_propietario_prueba(db)

    vehiculo_data = VehiculoCreate(
        placa="p456d2",
        marca="Mazda",
        modelo="CX5",
        anio=2021,
        propietario_id=propietario.id
    )

    vehiculo = crear_vehiculo(db, vehiculo_data)

    assert vehiculo.placa == "P456D2"


def test_crear_vehiculo_elimina_espacios(db):

    propietario = crear_propietario_prueba(db)

    vehiculo_data = VehiculoCreate(
        placa="  p777a3  ",
        marca="  Toyota  ",
        modelo="  Hilux  ",
        anio=2023,
        propietario_id=propietario.id
    )

    vehiculo = crear_vehiculo(db, vehiculo_data)

    assert vehiculo.placa == "P777A3"
    assert vehiculo.marca == "Toyota"
    assert vehiculo.modelo == "Hilux"

def test_listar_vehiculos(client):
    response = client.get("/api/vehiculos/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_editar_vehiculo(client):
    payload = {
        "placa": "P123ABC",
        "marca": "Honda",
        "modelo": "Civic",
        "anio": 2025,
        "propietario_id": 1
    }

    response = client.put("/api/vehiculos/1", json=payload)

    assert response.status_code in [200, 404]

    if response.status_code == 200:
        data = response.json()
        assert data["marca"] == "Honda"
        assert data["modelo"] == "Civic"


def test_eliminar_vehiculo(client):
    response = client.delete("/api/vehiculos/1")

    assert response.status_code in [200, 204, 404]

    if response.status_code == 200:
        data = response.json()
        assert "mensaje" in data or "detail" in data