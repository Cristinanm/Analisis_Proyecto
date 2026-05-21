import pytest
from fastapi import HTTPException
from datetime import datetime

from app.models.vehiculo import Vehiculo
from app.schemas.multa_schema import MultaCreate
from app.models.multa import Multa
from app.services.multa_service import calcular_dias_habiles, pagar_multa, registrar_multa


# Pruebas del service

def test_calcular_dias_habiles_lunes_a_viernes():
    fecha_inicio = datetime.strptime("2026-05-18", "%Y-%m-%d")
    fecha_fin = datetime.strptime("2026-05-22", "%Y-%m-%d")

    resultado = calcular_dias_habiles(fecha_inicio, fecha_fin)

    assert resultado == 4


def test_calcular_dias_habiles_no_cuenta_fin_de_semana():
    fecha_inicio = datetime.strptime("2026-05-15", "%Y-%m-%d")
    fecha_fin = datetime.strptime("2026-05-18", "%Y-%m-%d")

    resultado = calcular_dias_habiles(fecha_inicio, fecha_fin)

    assert resultado == 1


def test_pagar_multa_inexistente(db):
    with pytest.raises(HTTPException) as error:
        pagar_multa(db, multa_id=99999, fecha_pago="2026-05-20")

    assert error.value.status_code == 404
    assert error.value.detail == "Multa no encontrada"


# Prueba de fecha inválida

def test_pagar_multa_fecha_invalida(db):
    multa = Multa(
        fecha="2026-05-01",
        tipo_infraccion="Exceso de velocidad",
        descripcion="Prueba",
        monto_base=500,
        estado="pendiente",
        vehiculo_id=1,
        fecha_notificacion="2026-05-01"
    )

    db.add(multa)
    db.commit()
    db.refresh(multa)

    with pytest.raises(HTTPException) as error:
        pagar_multa(db, multa.id, "20-05-2026")

    assert error.value.status_code == 400
    assert error.value.detail == "Formato de fecha inválido. Use YYYY-MM-DD"


# Prueba de pago correcto

def test_pagar_multa_correctamente(db):
    multa = Multa(
        fecha="2026-05-01",
        tipo_infraccion="Exceso de velocidad",
        descripcion="Prueba",
        monto_base=500,
        estado="pendiente",
        vehiculo_id=1,
        fecha_notificacion="2026-05-01"
    )

    db.add(multa)
    db.commit()
    db.refresh(multa)

    resultado = pagar_multa(db, multa.id, "2026-05-03")

    assert resultado["mensaje"] == "Multa pagada correctamente"
    assert resultado["estado"] == "pagada"
    assert resultado["monto_original"] == 500

##Prueba de multa ya pagada
def test_pagar_multa_ya_pagada(db):
    multa = Multa(
        fecha="2026-05-01",
        tipo_infraccion="Exceso de velocidad",
        descripcion="Prueba",
        monto_base=500,
        estado="pagada",
        vehiculo_id=1,
        fecha_notificacion="2026-05-01"
    )

    db.add(multa)
    db.commit()
    db.refresh(multa)

    with pytest.raises(HTTPException) as error:
        pagar_multa(db, multa.id, "2026-05-03")

    assert error.value.status_code == 400
    assert error.value.detail == "La multa ya fue pagada"

##PRUEBA PAGO FECHA MENOR
def test_fecha_pago_menor_a_notificacion(db):

    multa = Multa(
        fecha="2026-05-10",
        tipo_infraccion="Semáforo en rojo",
        descripcion="Prueba",
        monto_base=300,
        estado="pendiente",
        vehiculo_id=1,
        fecha_notificacion="2026-05-10"
    )

    db.add(multa)
    db.commit()
    db.refresh(multa)

    with pytest.raises(HTTPException) as error:
        pagar_multa(db, multa.id, "2026-05-05")

    assert error.value.status_code == 400
    assert error.value.detail == "La fecha de pago no puede ser menor a la fecha de notificación"

    ##PAGO CON MORA

def test_pago_con_mora(db):

    multa = Multa(
        fecha="2026-01-01",
        tipo_infraccion="Exceso de velocidad",
        descripcion="Prueba mora",
        monto_base=1000,
        estado="pendiente",
        vehiculo_id=1,
        fecha_notificacion="2026-01-01"
    )

    db.add(multa)
    db.commit()
    db.refresh(multa)

    resultado = pagar_multa(db, multa.id, "2026-02-15")

    assert resultado["monto_mora_aplicado"] == 100
    assert resultado["estado"] == "pagada"

##Pago con descuento por pronto pago

def test_pago_con_descuento_pronto_pago(db):

    multa = Multa(
        fecha="2026-05-01",
        tipo_infraccion="Parqueo prohibido",
        descripcion="Prueba descuento",
        monto_base=400,
        estado="pendiente",
        vehiculo_id=1,
        fecha_notificacion="2026-05-01"
    )

    db.add(multa)
    db.commit()
    db.refresh(multa)

    resultado = pagar_multa(db, multa.id, "2026-05-03")

    assert resultado["descuento_aplicado"] == 100
    assert resultado["estado"] == "pagada"

##Registrar multa correctamente

def test_registrar_multa_correctamente(db):

    vehiculo = Vehiculo(
        placa="P123ABC",
        marca="Toyota",
        modelo="Corolla",
        anio=2020,
        propietario_id=1
    )

    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)

    multa_data = MultaCreate(
        placa="P123ABC",
        fecha="2026-05-01",
        tipo_infraccion="Exceso velocidad",
        descripcion="Prueba correcta",
        monto_base=600
    )

    multa = registrar_multa(db, multa_data)

    assert multa.estado == "pendiente"
    assert multa.vehiculo_id == vehiculo.id

