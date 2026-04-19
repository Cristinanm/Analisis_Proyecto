from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.schemas.multa_schema import MultaCreate


def registrar_multa(db: Session, multa_data: MultaCreate):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.placa == multa_data.placa.upper()).first()

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
        vehiculo_id=vehiculo.id
    )

    db.add(nueva_multa)
    db.commit()
    db.refresh(nueva_multa)

    return nueva_multa