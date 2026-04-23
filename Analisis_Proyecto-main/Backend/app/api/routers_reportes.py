from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.schemas.reporte import ReporteMulta, ReporteMultasPagadasResponse

router = APIRouter(prefix="/reportes", tags=["Reportes"])


def convertir_fecha(fecha_str: str):
    formatos = [
        "%Y-%m-%d",
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y",
    ]

    for formato in formatos:
        try:
            return datetime.strptime(fecha_str, formato)
        except ValueError:
            continue

    return None


def calcular_descuento_o_mora(multa: Multa) -> float:
    fecha_multa = convertir_fecha(multa.fecha)
    if not fecha_multa:
        return 0.0

    hoy = datetime.now()
    dias = (hoy.date() - fecha_multa.date()).days

    if dias <= 30:
        return round(-(multa.monto_base * 0.10), 2)  # descuento 10%
    else:
        return round(multa.monto_base * 0.15, 2)  # mora 15%


@router.get("/multas", response_model=list[ReporteMulta])
def obtener_reporte_multas(
    estado: str = Query("pendiente"),
    placa: str | None = Query(None),
    fecha: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Multa)
        .join(Vehiculo)
        .options(joinedload(Multa.vehiculo))
        .filter(Multa.estado == estado)
    )

    if placa:
        query = query.filter(Vehiculo.placa.ilike(f"%{placa}%"))

    multas = query.all()

    resultado = []

    for multa in multas:
        # filtro por fecha exacta desde frontend
        if fecha and multa.fecha != fecha:
            continue

        ajuste = calcular_descuento_o_mora(multa)
        total_actual = round(multa.monto_base + ajuste, 2)

        resultado.append(
            ReporteMulta(
                id=multa.id,
                placa=multa.vehiculo.placa if multa.vehiculo else "",
                fecha=multa.fecha,
                tipo_infraccion=multa.tipo_infraccion,
                monto_base=round(multa.monto_base, 2),
                descuento_o_mora=ajuste,
                total_actual=total_actual,
                estado=multa.estado,
            )
        )

    return resultado

# Nuevo modulo para reporte multas pagadas
@router.get("/multas-pagadas", response_model=ReporteMultasPagadasResponse)
def obtener_reporte_multas_pagadas(
    placa: str | None = Query(None),
    fecha: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Multa)
        .join(Vehiculo)
        .options(joinedload(Multa.vehiculo))
        .filter(Multa.estado == "pagada")
    )

    if placa:
        query = query.filter(Vehiculo.placa.ilike(f"%{placa}%"))

    multas = query.all()

    filas: list[ReporteMulta] = []
    total_recaudado = 0.0

    for multa in multas:
        if fecha and multa.fecha != fecha:
            continue

        monto = round(multa.monto_base, 2)
        total_recaudado += monto

        filas.append(
            ReporteMulta(
                id=multa.id,
                placa=multa.vehiculo.placa if multa.vehiculo else "",
                fecha=multa.fecha,
                tipo_infraccion=multa.tipo_infraccion,
                monto_base=monto,
                descuento_o_mora=0.0,
                total_actual=monto,
                estado=multa.estado,
            )
        )

    return ReporteMultasPagadasResponse(
        total_recaudado=round(total_recaudado, 2),
        Cantidad=len(filas),
        multas=filas,
    )