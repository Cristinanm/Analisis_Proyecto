from datetime import datetime

import pytest
from fastapi import HTTPException

from app.models.multa import Multa
from app.models.propietario import Propietario
from app.models.vehiculo import Vehiculo
from app.schemas.multa_schema import MultaCreate
from app.services.multa_service import calcular_dias_habiles, pagar_multa, registrar_multa


def _crear_vehiculo(db, placa="P123ABC"):
    propietario = Propietario(
        dpi="1234567890123",
        nombre="Juan Perez",
        correo="juan@test.com",
        direccion="Zona 1",
        telefono="55554444",
    )
    db.add(propietario)
    db.commit()
    db.refresh(propietario)

    vehiculo = Vehiculo(
        placa=placa,
        marca="Toyota",
        modelo="Corolla",
        anio=2020,
        propietario_id=propietario.id,
    )
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


def _crear_multa(db, vehiculo_id, estado="pendiente", monto=500, fecha_notificacion="2026-05-01"):
    multa = Multa(
        fecha=fecha_notificacion,
        tipo_infraccion="Exceso de velocidad",
        descripcion="Prueba",
        monto_base=monto,
        estado=estado,
        vehiculo_id=vehiculo_id,
        fecha_notificacion=fecha_notificacion,
    )
    db.add(multa)
    db.commit()
    db.refresh(multa)
    return multa


def test_calcular_dias_habiles_lunes_a_viernes():
    fecha_inicio = datetime.strptime("2026-05-18", "%Y-%m-%d")
    fecha_fin = datetime.strptime("2026-05-22", "%Y-%m-%d")
    assert calcular_dias_habiles(fecha_inicio, fecha_fin) == 4


def test_calcular_dias_habiles_no_cuenta_fin_de_semana():
    fecha_inicio = datetime.strptime("2026-05-15", "%Y-%m-%d")
    fecha_fin = datetime.strptime("2026-05-18", "%Y-%m-%d")
    assert calcular_dias_habiles(fecha_inicio, fecha_fin) == 1


def test_pagar_multa_inexistente(db):
    with pytest.raises(HTTPException) as error:
        pagar_multa(db, multa_id=99999, fecha_pago="2026-05-20")
    assert error.value.status_code == 404


def test_pagar_multa_fecha_invalida(db):
    vehiculo = _crear_vehiculo(db)
    multa = _crear_multa(db, vehiculo.id)

    with pytest.raises(HTTPException) as error:
        pagar_multa(db, multa.id, "20-05-2026")
    assert error.value.status_code == 400


def test_pagar_multa_correctamente(db):
    vehiculo = _crear_vehiculo(db)
    multa = _crear_multa(db, vehiculo.id)

    resultado = pagar_multa(db, multa.id, "2026-05-03")

    assert resultado["mensaje"] == "Multa pagada correctamente"
    assert resultado["estado"] == "pagada"
    assert resultado["monto_original"] == 500


def test_pagar_multa_ya_pagada(db):
    vehiculo = _crear_vehiculo(db)
    multa = _crear_multa(db, vehiculo.id, estado="pagada")

    with pytest.raises(HTTPException) as error:
        pagar_multa(db, multa.id, "2026-05-03")

    assert error.value.status_code == 400


def test_fecha_pago_menor_a_notificacion(db):
    vehiculo = _crear_vehiculo(db)
    multa = _crear_multa(db, vehiculo.id, monto=300, fecha_notificacion="2026-05-10")

    with pytest.raises(HTTPException) as error:
        pagar_multa(db, multa.id, "2026-05-05")

    assert error.value.status_code == 400


def test_pago_con_mora(db):
    vehiculo = _crear_vehiculo(db)
    multa = _crear_multa(db, vehiculo.id, monto=1000, fecha_notificacion="2026-01-01")

    resultado = pagar_multa(db, multa.id, "2026-02-15")

    assert resultado["monto_mora_aplicado"] == 100
    assert resultado["estado"] == "pagada"


def test_pago_con_descuento_pronto_pago(db):
    vehiculo = _crear_vehiculo(db)
    multa = _crear_multa(db, vehiculo.id, monto=400, fecha_notificacion="2026-05-01")

    resultado = pagar_multa(db, multa.id, "2026-05-03")

    assert resultado["descuento_aplicado"] == 100
    assert resultado["estado"] == "pagada"


def test_registrar_multa_correctamente(db):
    _crear_vehiculo(db, placa="P123ABC")

    multa_data = MultaCreate(
        placa="P123ABC",
        fecha="2026-05-01",
        tipo_infraccion="Exceso velocidad",
        descripcion="Prueba correcta",
        monto_base=600,
    )

    multa = registrar_multa(db, multa_data)

    assert multa.estado == "pendiente"
    assert multa.vehiculo_id is not None
