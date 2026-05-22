from datetime import datetime
import csv
from io import StringIO

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.schemas.reporte import DashboardSummary
from app.services.reporte_service import obtener_totales_dashboard

router = APIRouter(prefix="/api/reportes", tags=["Reportes"])


def convertir_fecha(fecha_str: str):
    if not fecha_str:
        return None

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
        raise HTTPException(
            status_code=400,
            detail="Formato de fecha invalido. Use YYYY-MM-DD",
        )

    if fecha_inicio_dt > fecha_fin_dt:
        raise HTTPException(
            status_code=400,
            detail="La fecha inicio no puede ser mayor que la fecha fin",
        )

    multas = (
        db.query(Multa)
        .join(Vehiculo)
        .options(joinedload(Multa.vehiculo))
        .filter(func.lower(Multa.estado) == "pagada")
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
                "monto_base": float(multa.monto_base or 0.0),
                "descuento_mora": float(multa.descuento_mora or 0.0),
                "monto_final": monto_final,
                "estado": multa.estado,
            }

            items.append(item)
            total_ingresos += monto_final

    return {
        "items": items,
        "total_ingresos": round(total_ingresos, 2),
    }


@router.get("/multas")
def obtener_reporte_multas(
    estado: str | None = Query(default=None),
    placa: str | None = Query(default=None),
    fecha_inicio: str | None = Query(default=None),
    fecha_fin: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Multa)
        .join(Vehiculo)
        .options(joinedload(Multa.vehiculo))
    )

    if estado:
        estado_limpio = estado.strip().lower()

        if estado_limpio in ["pagada", "pagadas"]:
            query = query.filter(func.lower(Multa.estado) == "pagada")

        elif estado_limpio in ["pendiente", "pendientes"]:
            query = query.filter(
                func.lower(Multa.estado).in_(["pendiente", "pendientes"])
            )

    if placa:
        query = query.filter(Vehiculo.placa.ilike(f"%{placa.strip()}%"))

    multas = query.order_by(Multa.id.desc()).all()

    fecha_inicio_dt = convertir_fecha(fecha_inicio) if fecha_inicio else None
    fecha_fin_dt = convertir_fecha(fecha_fin) if fecha_fin else None

    items = []
    total_ingresos = 0.0

    for multa in multas:
        fecha_reporte = multa.fecha_pago if multa.estado == "pagada" else multa.fecha
        fecha_reporte_dt = convertir_fecha(fecha_reporte) if fecha_reporte else None

        if fecha_inicio_dt and fecha_reporte_dt:
            if fecha_reporte_dt.date() < fecha_inicio_dt.date():
                continue

        if fecha_fin_dt and fecha_reporte_dt:
            if fecha_reporte_dt.date() > fecha_fin_dt.date():
                continue

        monto_base = float(multa.monto_base or 0.0)
        descuento_mora = float(multa.descuento_mora or 0.0)
        monto_final = float(multa.monto_final or (monto_base + descuento_mora))

        if multa.estado and multa.estado.lower() == "pagada":
            total_ingresos += monto_final

        items.append(
            {
                "id": multa.id,
                "placa": multa.vehiculo.placa if multa.vehiculo else "N/A",
                "fecha": multa.fecha,
                "fecha_pago": multa.fecha_pago,
                "tipo_infraccion": multa.tipo_infraccion,
                "monto_base": monto_base,
                "descuento_o_mora": descuento_mora,
                "descuento_mora": descuento_mora,
                "total_actual": monto_final,
                "monto_final": monto_final,
                "estado": multa.estado,
            }
        )

    return {
        "items": items,
        "total_ingresos": round(total_ingresos, 2),
    }


@router.put("/multas/{multa_id}/pagar")
def pagar_multa(
    multa_id: int,
    descuento_mora: float = Query(0.0),
    db: Session = Depends(get_db),
):
    multa = db.query(Multa).filter(Multa.id == multa_id).first()

    if not multa:
        raise HTTPException(
            status_code=404,
            detail="Multa no encontrada",
        )

    if multa.estado == "pagada":
        raise HTTPException(
            status_code=400,
            detail="La multa ya fue pagada",
        )

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
        },
    }


@router.get("/multas-estado")
def obtener_conteo_multas_por_estado(db: Session = Depends(get_db)):
    total_pagadas = (
        db.query(Multa)
        .filter(func.lower(Multa.estado) == "pagada")
        .count()
    )

    total_pendientes = (
        db.query(Multa)
        .filter(func.lower(Multa.estado).in_(["pendiente", "pendientes"]))
        .count()
    )

    total_multas = total_pagadas + total_pendientes

    return {
        "total_pagadas": total_pagadas,
        "total_pendientes": total_pendientes,
        "total_multas": total_multas,
        "items": [
            {
                "estado": "Pagadas",
                "total": total_pagadas,
            },
            {
                "estado": "Pendientes",
                "total": total_pendientes,
            },
        ],
    }


@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return obtener_totales_dashboard(db)


# RF-64: Ingresos recaudados por dia, mes y año
@router.get("/ingresos-recaudados")
def obtener_ingresos_recaudados(
    agrupacion: str = Query("dia", description="Opciones: dia, mes, anio"),
    db: Session = Depends(get_db),
):
    agrupacion = agrupacion.lower().strip()

    if agrupacion not in ["dia", "mes", "anio"]:
        raise HTTPException(
            status_code=400,
            detail="Agrupacion invalida. Use: dia, mes o anio.",
        )

    multas_pagadas = (
        db.query(Multa)
        .filter(func.lower(Multa.estado) == "pagada")
        .filter(Multa.fecha_pago.isnot(None))
        .all()
    )

    ingresos = {}

    for multa in multas_pagadas:
        fecha_pago = str(multa.fecha_pago)

        if agrupacion == "dia":
            periodo = fecha_pago[:10]
        elif agrupacion == "mes":
            periodo = fecha_pago[:7]
        else:
            periodo = fecha_pago[:4]

        monto = float(multa.monto_final or multa.monto_base or 0.0)

        if periodo not in ingresos:
            ingresos[periodo] = {
                "periodo": periodo,
                "total_recaudado": 0.0,
                "cantidad_multas": 0,
            }

        ingresos[periodo]["total_recaudado"] += monto
        ingresos[periodo]["cantidad_multas"] += 1

    items = list(ingresos.values())
    items.sort(key=lambda item: item["periodo"])

    total_general = sum(item["total_recaudado"] for item in items)

    for item in items:
        item["total_recaudado"] = round(item["total_recaudado"], 2)

    return {
        "agrupacion": agrupacion,
        "total_general": round(total_general, 2),
        "items": items,
    }


# SIS-93 / RF-93: Exportacion de reporte de multas a CSV
@router.get("/multas/exportar-csv")
def exportar_reporte_multas_csv(
    estado: str | None = Query(default=None),
    placa: str | None = Query(default=None),
    fecha_inicio: str | None = Query(default=None),
    fecha_fin: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Multa)
        .join(Vehiculo)
        .options(joinedload(Multa.vehiculo))
    )

    if estado:
        estado_limpio = estado.strip().lower()

        if estado_limpio in ["pagada", "pagadas"]:
            query = query.filter(func.lower(Multa.estado) == "pagada")

        elif estado_limpio in ["pendiente", "pendientes"]:
            query = query.filter(
                func.lower(Multa.estado).in_(["pendiente", "pendientes"])
            )

    if placa:
        query = query.filter(Vehiculo.placa.ilike(f"%{placa.strip()}%"))

    fecha_inicio_dt = convertir_fecha(fecha_inicio) if fecha_inicio else None
    fecha_fin_dt = convertir_fecha(fecha_fin) if fecha_fin else None

    if fecha_inicio and not fecha_inicio_dt:
        raise HTTPException(
            status_code=400,
            detail="Formato de fecha_inicio invalido. Use YYYY-MM-DD",
        )

    if fecha_fin and not fecha_fin_dt:
        raise HTTPException(
            status_code=400,
            detail="Formato de fecha_fin invalido. Use YYYY-MM-DD",
        )

    if fecha_inicio_dt and fecha_fin_dt and fecha_inicio_dt > fecha_fin_dt:
        raise HTTPException(
            status_code=400,
            detail="La fecha inicio no puede ser mayor que la fecha fin",
        )

    multas = query.order_by(Multa.id.desc()).all()

    output = StringIO()
    output.write("\ufeff")

    writer = csv.writer(output)
    writer.writerow(
        [
            "ID",
            "Placa",
            "Fecha",
            "Fecha de pago",
            "Tipo de infraccion",
            "Monto base",
            "Descuento o mora",
            "Monto final",
            "Estado",
        ]
    )

    for multa in multas:
        estado_multa = (multa.estado or "").lower()
        fecha_reporte = multa.fecha_pago if estado_multa == "pagada" else multa.fecha
        fecha_reporte_dt = convertir_fecha(fecha_reporte) if fecha_reporte else None

        if fecha_inicio_dt and fecha_reporte_dt:
            if fecha_reporte_dt.date() < fecha_inicio_dt.date():
                continue

        if fecha_fin_dt and fecha_reporte_dt:
            if fecha_reporte_dt.date() > fecha_fin_dt.date():
                continue

        monto_base = float(multa.monto_base or 0.0)
        descuento_mora = float(multa.descuento_mora or 0.0)
        monto_final = float(multa.monto_final or (monto_base + descuento_mora))

        writer.writerow(
            [
                multa.id,
                multa.vehiculo.placa if multa.vehiculo else "N/A",
                multa.fecha or "",
                multa.fecha_pago or "",
                multa.tipo_infraccion or "",
                round(monto_base, 2),
                round(descuento_mora, 2),
                round(monto_final, 2),
                multa.estado or "",
            ]
        )

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": "attachment; filename=reporte_multas.csv"
        },
    )