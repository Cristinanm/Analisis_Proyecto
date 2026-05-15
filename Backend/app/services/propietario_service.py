from sqlalchemy.orm import Session

from app.models.propietario import Propietario
from app.models.vehiculo import Vehiculo
from app.models.multa import Multa
from app.schemas.propietario_schema import PropietarioCreate, PropietarioUpdate


def obtener_propietario_por_id(db: Session, propietario_id: int):
    return db.query(Propietario).filter(Propietario.id == propietario_id).first()


def obtener_propietario_por_dpi(db: Session, dpi: str):
    return db.query(Propietario).filter(Propietario.dpi == dpi).first()


def obtener_propietario_por_correo(db: Session, correo: str):
    return db.query(Propietario).filter(Propietario.correo == correo).first()


def listar_propietarios(db: Session):
    return db.query(Propietario).order_by(Propietario.nombre.asc()).all()


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
        correo=data.correo.strip().lower(),
        direccion=data.direccion.strip(),
        telefono=data.telefono.strip(),
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return nuevo


def actualizar_propietario(
    db: Session,
    propietario: Propietario,
    data: PropietarioUpdate,
):
    propietario.dpi = data.dpi.strip()
    propietario.nombre = data.nombre.strip()
    propietario.correo = data.correo.strip().lower()
    propietario.direccion = data.direccion.strip()
    propietario.telefono = data.telefono.strip()

    db.commit()
    db.refresh(propietario)

    return propietario


def obtener_historial_propietario(db: Session, propietario_id: int):
    propietario = obtener_propietario_por_id(db, propietario_id)

    if not propietario:
        return None

    vehiculos = (
        db.query(Vehiculo)
        .filter(Vehiculo.propietario.ilike(f"%{propietario.nombre}%"))
        .order_by(Vehiculo.placa.asc())
        .all()
    )

    vehiculo_ids = [vehiculo.id for vehiculo in vehiculos]

    multas = []

    if vehiculo_ids:
        multas_db = (
            db.query(Multa, Vehiculo.placa)
            .join(Vehiculo, Multa.vehiculo_id == Vehiculo.id)
            .filter(Multa.vehiculo_id.in_(vehiculo_ids))
            .order_by(Multa.fecha.desc())
            .all()
        )

        multas = [
            {
                "id": multa.id,
                "fecha": str(multa.fecha),
                "tipo_infraccion": multa.tipo_infraccion,
                "descripcion": multa.descripcion,
                "monto_base": multa.monto_base,
                "estado": multa.estado,
                "placa": placa,
            }
            for multa, placa in multas_db
        ]

    return {
        "propietario": propietario,
        "vehiculos": vehiculos,
        "multas": multas,
    }