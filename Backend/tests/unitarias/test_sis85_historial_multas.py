from app.models.multa import Multa
from app.api.consulta_multas_router import calcular_monto_actualizado


def _multa_base(**overrides):
    data = {
        "id": 1,
        "fecha": "2099-12-30",
        "tipo_infraccion": "Prueba",
        "descripcion": "Prueba",
        "monto_base": 1000,
        "estado": "pendiente",
        "vehiculo_id": 1,
        "fecha_notificacion": "2099-12-30",
    }
    data.update(overrides)
    return Multa(**data)


def test_sis85_calcula_descuento_pronto_pago():
    multa = _multa_base(fecha="2099-12-30", monto_base=1000, estado="pendiente")
    calculo = calcular_monto_actualizado(multa)

    assert calculo["descuento_mora"] == -100.0
    assert calculo["monto_actualizado"] == 900.0


def test_sis85_calcula_mora_por_retraso():
    multa = _multa_base(fecha="2026-01-01", monto_base=1000, estado="pendiente")
    calculo = calcular_monto_actualizado(multa)

    assert calculo["descuento_mora"] == 150.0
    assert calculo["monto_actualizado"] == 1150.0


def test_sis85_multa_pagada_no_recalcula():
    multa = _multa_base(
        estado="pagada",
        monto_base=500,
        monto_final=550,
        descuento_mora=50,
    )
    calculo = calcular_monto_actualizado(multa)

    assert calculo["descuento_mora"] == 50.0
    assert calculo["monto_actualizado"] == 550.0
