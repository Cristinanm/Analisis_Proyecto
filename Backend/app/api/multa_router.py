from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.multa_schema import MultaCreate
from app.services.multa_service import registrar_multa

router = APIRouter(prefix="/api/multas", tags=["Multas"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_multa(multa: MultaCreate, db: Session = Depends(get_db)):
    nueva_multa = registrar_multa(db, multa)

    return {
        "id": nueva_multa.id,
        "vehiculo_id": nueva_multa.vehiculo_id,
        "fecha": nueva_multa.fecha,
        "tipo_infraccion": nueva_multa.tipo_infraccion,
        "descripcion": nueva_multa.descripcion,
        "monto_base": nueva_multa.monto_base,
        "estado": nueva_multa.estado,
        "mensaje": "Multa registrada exitosamente"
    }