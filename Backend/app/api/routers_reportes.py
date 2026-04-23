from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.schemas.reporte import ReporteMultaPagada

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


@router.get("/multas-pagadas")
def obtener_reporte_multas_pagadas(
    fecha_inicio: str = Query(...),
    fecha_fin: str = Query(...),
    db: Session = Depends(get_db),
):
    fecha_inicio_dt = convertir_fecha(fecha_inicio)
    fecha_fin_dt = convertir_fecha(fecha_fin)

    if not fecha_inicio_dt or not fecha_fin_dt:
        raise HTTPException(status_code=400, detail="Formato de fecha invalido. Use YYYY-MM-DD")

    if fecha_inicio_dt > fecha_fin_dt:
        raise HTTPException(status_code=400, detail="La fecha inicio no puede ser mayor que la fecha fin")

    multas = (
        db.query(Multa)
        .join(Vehiculo)
        .options(joinedload(Multa.vehiculo))
        .filter(Multa.estado == "pagada")
        .all()
    )

    items = []
    total_ingresos = 0.0

    for multa in multas:
        if not multa.fecha_pago:
            continue

        fecha_pago_dt = convertir_fecha(multa.fecha_pago)
        if not fecha_pago_dt:
            continue

        if fecha_inicio_dt.date() <= fecha_pago_dt.date() <= fecha_fin_dt.date():
            monto_final = float(multa.monto_final or 0.0)

            item = {
                "id": multa.id,
                "placa": multa.vehiculo.placa if multa.vehiculo else "",
                "id_factura": multa.id_factura,
                "fecha_pago": multa.fecha_pago,
                "monto_base": float(multa.monto_base),
                "descuento_mora": float(multa.descuento_mora or 0.0),
                "monto_final": monto_final,
                "estado": multa.estado,
            }

            items.append(item)
            total_ingresos += monto_final

    return {
        "items": items,
        "total_ingresos": round(total_ingresos, 2)
    }


@router.put("/multas/{multa_id}/pagar")
def pagar_multa(
    multa_id: int,
    descuento_mora: float = Query(0.0),
    db: Session = Depends(get_db),
):
    multa = db.query(Multa).filter(Multa.id == multa_id).first()

    if not multa:
        raise HTTPException(status_code=404, detail="Multa no encontrada")

    if multa.estado == "pagada":
        raise HTTPException(status_code=400, detail="La multa ya fue pagada")

    ahora = datetime.now()
    fecha_pago = ahora.strftime("%Y-%m-%d")
    id_factura = f"FAC-{multa.id}-{ahora.strftime('%Y%m%d%H%M%S')}"

    monto_final = round(float(multa.monto_base) + float(descuento_mora), 2)

    multa.estado = "pagada"
    multa.fecha_pago = fecha_pago
    multa.id_factura = id_factura
    multa.descuento_mora = round(float(descuento_mora), 2)
    multa.monto_final = monto_final

    db.commit()
    db.refresh(multa)

    return {
        "message": "Multa pagada correctamente",
        "multa": {
            "id": multa.id,
            "estado": multa.estado,
            "fecha_pago": multa.fecha_pago,
            "id_factura": multa.id_factura,
            "descuento_mora": multa.descuento_mora,
            "monto_final": multa.monto_final,
        }
    }