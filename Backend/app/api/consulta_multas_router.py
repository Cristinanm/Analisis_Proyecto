from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.vehiculo import Vehiculo
from app.models.multa import Multa

router = APIRouter(
    prefix="/api/consultas",
    tags=["Consultas"]
)


def calcular_monto_actualizado(multa: Multa):
    monto_base = float(multa.monto_base)

    # Si ya está pagada u otro estado, no recalcula
    if multa.estado.lower() != "pendiente":
        return {
            "descuento_mora": float(multa.descuento_mora or 0),
            "monto_actualizado": float(multa.monto_final or monto_base),
        }

    # Intentar convertir fecha
    try:
        fecha_multa = datetime.strptime(multa.fecha, "%Y-%m-%d").date()
    except Exception:
        return {
            "descuento_mora": 0.0,
            "monto_actualizado": monto_base,
        }

    hoy = datetime.now().date()
    dias = (hoy - fecha_multa).days

    descuento_mora = 0.0

    # Lógica de descuento o mora
    if dias <= 5:
        descuento_mora = round(monto_base * -0.10, 2)  # descuento
    elif dias > 30:
        descuento_mora = round(monto_base * 0.15, 2)   # mora

    monto_actualizado = round(monto_base + descuento_mora, 2)

    return {
        "descuento_mora": descuento_mora,
        "monto_actualizado": monto_actualizado,
    }


@router.get("/multas-por-placa/{placa}")
def consultar_multas_por_placa(
    placa: str,
    db: Session = Depends(get_db)
):
    placa_limpia = placa.strip().upper()

    vehiculo = (
        db.query(Vehiculo)
        .options(joinedload(Vehiculo.multas))
        .filter(func.upper(func.trim(Vehiculo.placa)) == placa_limpia)
        .first()
    )

    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró un vehículo con esa placa",
        )

    multas_response = []
    total_adeudado = 0.0

    for multa in vehiculo.multas:
        calculo = calcular_monto_actualizado(multa)

        if multa.estado.lower() == "pendiente":
            total_adeudado += calculo["monto_actualizado"]

        multas_response.append({
            "id": multa.id,
            "fecha": multa.fecha,
            "descripcion": multa.descripcion,
            "tipo_infraccion": multa.tipo_infraccion,
            "monto_base": float(multa.monto_base),
            "estado": multa.estado,
            "descuento_mora": calculo["descuento_mora"],
            "monto_actualizado": calculo["monto_actualizado"],
        })

    return {
        "vehiculo": {
            "id": vehiculo.id,
            "placa": vehiculo.placa,
            "marca": vehiculo.marca,
            "modelo": vehiculo.modelo,
            "anio": vehiculo.anio,
            "propietario": vehiculo.propietario,
        },
        "multas": multas_response,
        "total_adeudado": round(total_adeudado, 2),
        "mensaje": (
            "El vehículo no presenta multas registradas"
            if len(multas_response) == 0
            else "Consulta realizada correctamente"
        ),
    }