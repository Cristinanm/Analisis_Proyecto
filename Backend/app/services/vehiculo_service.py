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

#
from app.schemas.vehiculo_schema import VehiculoBase

def actualizar_vehiculo(db: Session, vehiculo_id: int, datos: VehiculoBase):
    
    db_vehiculo = db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()
    
    if db_vehiculo:
        
        db_vehiculo.placa = datos.placa.upper()
        db_vehiculo.marca = datos.marca
        db_vehiculo.modelo = datos.modelo
        db_vehiculo.anio = datos.anio
        db_vehiculo.propietario = datos.propietario
        
        
        db.commit()
        db.refresh(db_vehiculo)
        
    return db_vehiculo