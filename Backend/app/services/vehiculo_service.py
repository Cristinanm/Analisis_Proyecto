from sqlalchemy.orm import Session
from app.models.vehiculo import Vehiculo
from app.schemas.vehiculo_schema import VehiculoCreate


def obtener_vehiculo_por_placa(db: Session, placa: str):
    return db.query(Vehiculo).filter(Vehiculo.placa == placa).first()


def crear_vehiculo(db: Session, vehiculo_data: VehiculoCreate):
    nuevo_vehiculo = Vehiculo(
        placa=vehiculo_data.placa.upper(),
        marca=vehiculo_data.marca,
        modelo=vehiculo_data.modelo,
        anio=vehiculo_data.anio,
        propietario=vehiculo_data.propietario,
    )
    db.add(nuevo_vehiculo)
    db.commit()
    db.refresh(nuevo_vehiculo)
    return nuevo_vehiculo


def listar_vehiculos(db: Session):
    return db.query(Vehiculo).all()