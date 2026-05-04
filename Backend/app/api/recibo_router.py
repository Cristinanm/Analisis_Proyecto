from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.recibo_service import buscar_recibos

router = APIRouter(prefix="/api/recibos", tags=["Recibos"])

@router.get("/buscar")
def buscar_facturas(termino: str = "", db: Session = Depends(get_db)):
    """
    Busca facturas por número de ID o por nombre del propietario.
    Si no se envía ningún término, devuelve todas las facturas.
    """
    return buscar_recibos(db, termino)



