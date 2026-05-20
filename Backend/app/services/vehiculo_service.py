from sqlalchemy.orm import Session

from app.models.vehiculo import Vehiculo


from app.models.propietario import Propietario

from app.schemas.vehiculo_schema import VehiculoCreate, VehiculoBase


def obtener_vehiculo_por_placa(db: Session, placa: str):
    return db.query(Vehiculo).filter(Vehiculo.placa == placa.upper()).first()



def obtener_vehiculo_por_id(db: Session, vehiculo_id: int):
    return db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()



def crear_vehiculo(db: Session, vehiculo_data: VehiculoCreate):
    propietario = db.query(Propietario).filter(
        Propietario.id == vehiculo_data.propietario_id
    ).first()

    if not propietario:
        return None

    nuevo_vehiculo = Vehiculo(
        placa=vehiculo_data.placa.upper().strip(),
        marca=vehiculo_data.marca.strip(),
        modelo=vehiculo_data.modelo.strip(),
        anio=vehiculo_data.anio,
        propietario_id=vehiculo_data.propietario_id,
    )

    db.add(nuevo_vehiculo)
    db.commit()
    db.refresh(nuevo_vehiculo)

    return nuevo_vehiculo


def listar_vehiculos(db: Session):
    return db.query(Vehiculo).order_by(Vehiculo.id.asc()).all()


def actualizar_vehiculo(db: Session, vehiculo_id: int, datos):
    db_vehiculo = db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()
    
    if not db_vehiculo:
        return None
        
    # Actualizamos solo los datos que vienen en VehiculoBase
    db_vehiculo.placa = datos.placa
    db_vehiculo.marca = datos.marca
    db_vehiculo.modelo = datos.modelo
    db_vehiculo.anio = datos.anio
    
    db.commit()
    db.refresh(db_vehiculo)
    return db_vehiculo