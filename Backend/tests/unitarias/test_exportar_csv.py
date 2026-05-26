import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.multa import Multa
from app.models.vehiculo import Vehiculo

try:
    from app.models.propietario import Propietario
except Exception:
    Propietario = None


SQLALCHEMY_DATABASE_URL = "sqlite:///./test_exportar_csv.db"

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

    db = TestingSessionLocal()

    try:
        propietario_id = None

        if Propietario is not None:
            propietario = Propietario(
                nombre="Juan Perez",
                dpi="1234567890101",
                telefono="55555555",
                correo="juan@test.com",
                direccion="Guatemala",
            )
            db.add(propietario)
            db.commit()
            db.refresh(propietario)
            propietario_id = propietario.id

        vehiculo = Vehiculo(
            placa="P123ABC",
            marca="Toyota",
            modelo="Corolla",
            anio=2020,
            propietario_id=propietario_id,
        )

        db.add(vehiculo)
        db.commit()
        db.refresh(vehiculo)

        multa_pagada = Multa(
            fecha="2026-05-01",
            tipo_infraccion="Exceso de velocidad",
            descripcion="Multa de prueba pagada",
            monto_base=500,
            estado="pagada",
            fecha_pago="2026-05-02",
            id_factura="FAC-1",
            descuento_mora=0,
            monto_final=500,
            vehiculo_id=vehiculo.id,
        )

        multa_pendiente = Multa(
            fecha="2026-05-03",
            tipo_infraccion="Estacionamiento prohibido",
            descripcion="Multa de prueba pendiente",
            monto_base=300,
            estado="pendiente",
            descuento_mora=0,
            monto_final=300,
            vehiculo_id=vehiculo.id,
        )

        db.add(multa_pagada)
        db.add(multa_pendiente)
        db.commit()

    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def test_exportar_csv_responde_correctamente():
    response = client.get("/api/reportes/multas/exportar-csv")

    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "attachment" in response.headers["content-disposition"]
    assert "reporte_multas.csv" in response.headers["content-disposition"]


def test_exportar_csv_incluye_encabezados():
    response = client.get("/api/reportes/multas/exportar-csv")

    contenido = response.text

    assert "ID" in contenido
    assert "Placa" in contenido
    assert "Fecha" in contenido
    assert "Tipo de infraccion" in contenido
    assert "Monto base" in contenido
    assert "Monto final" in contenido
    assert "Estado" in contenido


def test_exportar_csv_incluye_multas_registradas():
    response = client.get("/api/reportes/multas/exportar-csv")

    contenido = response.text

    assert "P123ABC" in contenido
    assert "Exceso de velocidad" in contenido
    assert "Estacionamiento prohibido" in contenido


def test_exportar_csv_filtra_por_estado_pagada():
    response = client.get("/api/reportes/multas/exportar-csv?estado=pagada")

    contenido = response.text

    assert response.status_code == 200
    assert "Exceso de velocidad" in contenido
    assert "Estacionamiento prohibido" not in contenido


def test_exportar_csv_rechaza_fecha_inicio_invalida():
    response = client.get(
        "/api/reportes/multas/exportar-csv?fecha_inicio=fecha-mala"
    )

    assert response.status_code == 400
    assert "Formato de fecha_inicio invalido" in response.text