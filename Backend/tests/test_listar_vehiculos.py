import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.vehiculo import Vehiculo
from app.models.propietario import Propietario


SQLALCHEMY_DATABASE_URL = "sqlite:///./test_listar_vehiculos.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def preparar_base_de_datos():
    app.dependency_overrides[get_db] = override_get_db

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    yield

    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def crear_propietario(db):
    propietario = Propietario(
        dpi="1234567890101",
        nombre="Juan Perez",
        correo="juan@test.com",
        direccion="Guatemala",
        telefono="55555555",
    )

    db.add(propietario)
    db.commit()
    db.refresh(propietario)

    return propietario


def test_listar_vehiculos_devuelve_lista_vacia_si_no_hay_registros():
    response = client.get("/api/vehiculos/")

    assert response.status_code == 200
    assert response.json() == []


def test_listar_vehiculos_devuelve_vehiculos_registrados():
    db = TestingSessionLocal()

    try:
        propietario = crear_propietario(db)

        vehiculo = Vehiculo(
            placa="P123ABC",
            marca="Toyota",
            modelo="Corolla",
            anio=2020,
            propietario_id=propietario.id,
        )

        db.add(vehiculo)
        db.commit()

    finally:
        db.close()

    response = client.get("/api/vehiculos/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["placa"] == "P123ABC"
    assert data[0]["marca"] == "Toyota"
    assert data[0]["modelo"] == "Corolla"
    assert data[0]["anio"] == 2020
    assert data[0]["propietario_id"] is not None


def test_listar_vehiculos_ordenados_por_id():
    db = TestingSessionLocal()

    try:
        propietario = crear_propietario(db)

        vehiculo_1 = Vehiculo(
            placa="P111AAA",
            marca="Toyota",
            modelo="Corolla",
            anio=2020,
            propietario_id=propietario.id,
        )

        vehiculo_2 = Vehiculo(
            placa="P222BBB",
            marca="Honda",
            modelo="Civic",
            anio=2021,
            propietario_id=propietario.id,
        )

        db.add_all([vehiculo_1, vehiculo_2])
        db.commit()

    finally:
        db.close()

    response = client.get("/api/vehiculos/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["id"] < data[1]["id"]
    assert data[0]["placa"] == "P111AAA"
    assert data[1]["placa"] == "P222BBB"


def test_listar_vehiculos_no_falla_con_propietario_asignado():
    db = TestingSessionLocal()

    try:
        propietario = crear_propietario(db)

        vehiculo = Vehiculo(
            placa="P999ZZZ",
            marca="Mazda",
            modelo="3",
            anio=2022,
            propietario_id=propietario.id,
        )

        db.add(vehiculo)
        db.commit()

    finally:
        db.close()

    response = client.get("/api/vehiculos/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["placa"] == "P999ZZZ"
    assert data[0]["marca"] == "Mazda"
    assert data[0]["modelo"] == "3"
    assert data[0]["anio"] == 2022
    assert data[0]["propietario_id"] is not None


def test_listar_vehiculos_incluye_datos_principales_para_el_panel():
    db = TestingSessionLocal()

    try:
        propietario = crear_propietario(db)

        vehiculo = Vehiculo(
            placa="P456DEF",
            marca="Nissan",
            modelo="Sentra",
            anio=2019,
            propietario_id=propietario.id,
        )

        db.add(vehiculo)
        db.commit()

    finally:
        db.close()

    response = client.get("/api/vehiculos/")

    assert response.status_code == 200

    data = response.json()
    vehiculo = data[0]

    assert "id" in vehiculo
    assert "placa" in vehiculo
    assert "marca" in vehiculo
    assert "modelo" in vehiculo
    assert "anio" in vehiculo
    assert "propietario_id" in vehiculo