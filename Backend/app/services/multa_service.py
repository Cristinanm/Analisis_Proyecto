from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.schemas.multa_schema import MultaCreate


def registrar_multa(db: Session, multa_data: MultaCreate):
    vehiculo = db.query(Vehiculo).filter(
        Vehiculo.placa == multa_data.placa.upper()
    ).first()

    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró un vehículo con la placa '{multa_data.placa}'"
        )

    nueva_multa = Multa(
    fecha=multa_data.fecha,
    tipo_infraccion=multa_data.tipo_infraccion,
    descripcion=multa_data.descripcion,
    monto_base=multa_data.monto_base,
    estado="pendiente",
    vehiculo_id=vehiculo.id,
    fecha_notificacion=multa_data.fecha
)

    db.add(nueva_multa)
    db.commit()
    db.refresh(nueva_multa)

    return nueva_multa


def calcular_dias_habiles(fecha_inicio, fecha_fin):
    dias = 0
    fecha_actual = fecha_inicio

    while fecha_actual < fecha_fin:
        fecha_actual += timedelta(days=1)

        if fecha_actual.weekday() < 5:
            dias += 1

    return dias


def pagar_multa(db: Session, multa_id: int, fecha_pago: str):
    multa = db.query(Multa).filter(Multa.id == multa_id).first()

    if not multa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Multa no encontrada"
        )

    if multa.estado == "pagada":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La multa ya fue pagada"
        )

    if not multa.fecha_notificacion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La multa no tiene fecha de notificación"
        )

    try:
        fecha_notificacion = datetime.strptime(multa.fecha_notificacion, "%Y-%m-%d")
        fecha_pago_dt = datetime.strptime(fecha_pago, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de fecha inválido. Use YYYY-MM-DD"
        )

    if fecha_pago_dt < fecha_notificacion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de pago no puede ser menor a la fecha de notificación"
        )

    dias_retraso = (fecha_pago_dt - fecha_notificacion).days
    dias_habiles = calcular_dias_habiles(fecha_notificacion, fecha_pago_dt)

    monto_original = multa.monto_base
    monto_mora = 0.0
    descuento = 0.0

    if dias_retraso > 30:
        monto_mora = monto_original * 0.10

    if dias_habiles <= 5:
        descuento = monto_original * 0.25

    monto_total = monto_original + monto_mora - descuento

    multa.fecha_pago = fecha_pago
    multa.dias_retraso = dias_retraso
    multa.monto_mora_calculado = monto_mora
    multa.descuento_pronto_pago = descuento

    multa.descuento_mora = descuento
    multa.monto_final = monto_total
    multa.estado = "pagada"

    db.commit()
    db.refresh(multa)

    return {
        "mensaje": "Multa pagada correctamente",
        "monto_original": monto_original,
        "dias_retraso": dias_retraso,
        "monto_mora_aplicado": monto_mora,
        "descuento_aplicado": descuento,
        "monto_total_a_pagar": monto_total,
        "fecha_notificacion": multa.fecha_notificacion,
        "fecha_pago": multa.fecha_pago,
        "estado": multa.estado
    }