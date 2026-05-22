import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.models.propietario import Propietario


SQLALCHEMY_DATABASE_URL = "sqlite:///./test_ingresos_recaudados.db"

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

        vehiculo = Vehiculo(
            placa="P123ABC",
            marca="Toyota",
            modelo="Corolla",
            anio=2020,
            propietario_id=propietario.id,
        )
        db.add(vehiculo)
        db.commit()
        db.refresh(vehiculo)

        multas = [
            Multa(
                fecha="2026-05-01",
                tipo_infraccion="Exceso de velocidad",
                descripcion="Multa pagada uno",
                monto_base=500,
                estado="pagada",
                fecha_pago="2026-05-02",
                id_factura="FAC-1",
                descuento_mora=0,
                monto_final=500,
                vehiculo_id=vehiculo.id,
            ),
            Multa(
                fecha="2026-05-10",
                tipo_infraccion="Estacionamiento prohibido",
                descripcion="Multa pagada dos",
                monto_base=300,
                estado="pagada",
                fecha_pago="2026-05-15",
                id_factura="FAC-2",
                descuento_mora=0,
                monto_final=300,
                vehiculo_id=vehiculo.id,
            ),
            Multa(
                fecha="2026-06-01",
                tipo_infraccion="Semaforo en rojo",
                descripcion="Multa pagada tres",
                monto_base=700,
                estado="pagada",
                fecha_pago="2026-06-01",
                id_factura="FAC-3",
                descuento_mora=0,
                monto_final=700,
                vehiculo_id=vehiculo.id,
            ),
            Multa(
                fecha="2026-06-05",
                tipo_infraccion="Multa pendiente",
                descripcion="Esta multa no debe contarse",
                monto_base=200,
                estado="pendiente",
                descuento_mora=0,
                monto_final=200,
                vehiculo_id=vehiculo.id,
            ),
        ]

        db.add_all(multas)
        db.commit()

    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def test_ingresos_recaudados_por_dia():
    response = client.get("/api/reportes/ingresos-recaudados?agrupacion=dia")

    assert response.status_code == 200

    data = response.json()

    assert data["agrupacion"] == "dia"
    assert data["total_general"] == 1500
    assert len(data["items"]) == 3

    periodos = [item["periodo"] for item in data["items"]]

    assert "2026-05-02" in periodos
    assert "2026-05-15" in periodos
    assert "2026-06-01" in periodos


def test_ingresos_recaudados_por_mes():
    response = client.get("/api/reportes/ingresos-recaudados?agrupacion=mes")

    assert response.status_code == 200

    data = response.json()

    assert data["agrupacion"] == "mes"
    assert data["total_general"] == 1500
    assert len(data["items"]) == 2

    mayo = next(item for item in data["items"] if item["periodo"] == "2026-05")
    junio = next(item for item in data["items"] if item["periodo"] == "2026-06")

    assert mayo["total_recaudado"] == 800
    assert mayo["cantidad_multas"] == 2

    assert junio["total_recaudado"] == 700
    assert junio["cantidad_multas"] == 1


def test_ingresos_recaudados_por_anio():
    response = client.get("/api/reportes/ingresos-recaudados?agrupacion=anio")

    assert response.status_code == 200

    data = response.json()

    assert data["agrupacion"] == "anio"
    assert data["total_general"] == 1500
    assert len(data["items"]) == 1

    item = data["items"][0]

    assert item["periodo"] == "2026"
    assert item["total_recaudado"] == 1500
    assert item["cantidad_multas"] == 3


def test_ingresos_recaudados_ignora_multas_pendientes():
    response = client.get("/api/reportes/ingresos-recaudados?agrupacion=anio")

    assert response.status_code == 200

    data = response.json()

    assert data["total_general"] == 1500
    assert data["items"][0]["cantidad_multas"] == 3


def test_ingresos_recaudados_rechaza_agrupacion_invalida():
    response = client.get("/api/reportes/ingresos-recaudados?agrupacion=semana")

    assert response.status_code == 400
    assert "Agrupacion invalida" in response.text