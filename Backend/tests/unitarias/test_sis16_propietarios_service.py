from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.schemas.propietario_schema import PropietarioCreate, PropietarioUpdate
from app.services.propietario_service import (
    actualizar_propietario,
    buscar_propietarios,
    crear_propietario,
    obtener_historial_propietario,
)


def _crear_propietario_base(db):
    return crear_propietario(
        db,
        PropietarioCreate(
    dpi="1234567890123",
    nombre=" Maria Lopez ",
    correo=" MARIA@TEST.COM ",
    direccion=" Zona 1 ",
    telefono=" 55551111 ",
),
    )


def test_sis16_crear_propietario_normaliza_campos(db):
    propietario = crear_propietario(
        db,
        PropietarioCreate(
            dpi="1234567890123",
            nombre=" Maria Lopez ",
            correo=" MARIA@TEST.COM ",
            direccion=" Zona 1 ",
            telefono=" 55551111 ",
        ),
    )

    assert propietario.dpi == "1234567890123"
    assert propietario.nombre == "Maria Lopez"
    assert propietario.correo == "maria@test.com"


def test_sis16_buscar_propietario_por_nombre(db):
    _crear_propietario_base(db)
    resultados = buscar_propietarios(db, nombre="maria")

    assert len(resultados) == 1
    assert resultados[0].nombre == "Maria Lopez"


def test_sis16_actualizar_propietario(db):
    propietario = _crear_propietario_base(db)

    actualizado = actualizar_propietario(
        db,
        propietario,
        PropietarioUpdate(
            dpi="9876543210123",
            nombre="Maria Lopez Actualizada",
            correo="maria.actualizada@test.com",
            direccion="Zona 10",
            telefono="55552222",
        ),
    )

    assert actualizado.nombre == "Maria Lopez Actualizada"
    assert actualizado.correo == "maria.actualizada@test.com"
    assert actualizado.dpi == "9876543210123"


def test_sis16_historial_propietario_con_vehiculos_y_multas(db):
    propietario = _crear_propietario_base(db)

    vehiculo = Vehiculo(
        placa="P111AAA",
        marca="Toyota",
        modelo="Corolla",
        anio=2020,
        propietario_id=propietario.id,
    )
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)

    multa = Multa(
        fecha="2026-05-01",
        tipo_infraccion="Exceso de velocidad",
        descripcion="Prueba historial",
        monto_base=350,
        estado="pendiente",
        fecha_notificacion="2026-05-01",
        vehiculo_id=vehiculo.id,
    )
    db.add(multa)
    db.commit()

    historial = obtener_historial_propietario(db, propietario.id)

    assert historial is not None
    assert historial["propietario"].id == propietario.id
    assert len(historial["vehiculos"]) == 1
    assert len(historial["multas"]) == 1
    assert historial["multas"][0]["placa"] == "P111AAA"
