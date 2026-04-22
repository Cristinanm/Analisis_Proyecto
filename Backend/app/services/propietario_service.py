from sqlalchemy.orm import Session

from app.models.propietario import Propietario
from app.schemas.propietario_schema import PropietarioCreate, PropietarioUpdate


def obtener_propietario_por_id(db: Session, propietario_id: int):
    return db.query(Propietario).filter(Propietario.id == propietario_id).first()


def obtener_propietario_por_dpi(db: Session, dpi: str):
    return db.query(Propietario).filter(Propietario.dpi == dpi).first()


def buscar_propietarios(db: Session, dpi: str | None = None, nombre: str | None = None):
    query = db.query(Propietario)

    if dpi:
        query = query.filter(Propietario.dpi == dpi)

    if nombre:
        query = query.filter(Propietario.nombre.ilike(f"%{nombre}%"))

    return query.order_by(Propietario.nombre.asc()).all()


def crear_propietario(db: Session, data: PropietarioCreate):
    nuevo = Propietario(
        dpi=data.dpi.strip(),
        nombre=data.nombre.strip(),
        direccion=data.direccion.strip(),
        telefono=data.telefono.strip(),
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


def actualizar_propietario(db: Session, propietario: Propietario, data: PropietarioUpdate):
    propietario.dpi = data.dpi.strip()
    propietario.nombre = data.nombre.strip()
    propietario.direccion = data.direccion.strip()
    propietario.telefono = data.telefono.strip()
    db.commit()
    db.refresh(propietario)
    return propietario
