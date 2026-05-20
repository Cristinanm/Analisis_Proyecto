from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.vehiculo import Vehiculo
from app.models.propietario import Propietario
from app.schemas.vehiculo_schema import VehiculoCreate, VehiculoResponse, VehiculoBase
from app.services.vehiculo_service import (
    actualizar_vehiculo,
    crear_vehiculo,
    listar_vehiculos,
    obtener_vehiculo_por_placa,
)

router = APIRouter(prefix="/api/vehiculos", tags=["Vehículos"])


@router.post("/", response_model=VehiculoResponse, status_code=status.HTTP_201_CREATED)
def crear_nuevo_vehiculo(vehiculo: VehiculoCreate, db: Session = Depends(get_db)):
    existente = obtener_vehiculo_por_placa(db, vehiculo.placa.upper())

    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La placa ya existe",
        )

    nuevo_vehiculo = crear_vehiculo(db, vehiculo)

    if not nuevo_vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El propietario seleccionado no existe",
        )

    return nuevo_vehiculo


@router.get("/", response_model=list[VehiculoResponse])
def obtener_vehiculos(db: Session = Depends(get_db)):
    return listar_vehiculos(db)


@router.get("/buscar", response_model=list[VehiculoResponse])
def buscar_vehiculos(
    placa: str | None = Query(default=None),
    marca: str | None = Query(default=None),
    propietario: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Vehiculo).join(Propietario)

    if placa:
        query = query.filter(Vehiculo.placa.ilike(f"%{placa}%"))

    if marca:
        query = query.filter(Vehiculo.marca.ilike(f"%{marca}%"))

    if propietario:
        query = query.filter(Propietario.nombre.ilike(f"%{propietario}%"))

    return query.all()


@router.get("/placa/{placa}", response_model=VehiculoResponse)
def buscar_vehiculo_por_placa(placa: str, db: Session = Depends(get_db)):
    vehiculo = obtener_vehiculo_por_placa(db, placa.upper())

    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró un vehículo con la placa '{placa}'",
        )

    return vehiculo


@router.put("/{vehiculo_id}", response_model=VehiculoResponse)
def editar_vehiculo(
    vehiculo_id: int,
    vehiculo_actualizado: VehiculoBase,
    db: Session = Depends(get_db),
):
    vehiculo = actualizar_vehiculo(db, vehiculo_id, vehiculo_actualizado)

    if vehiculo == "PROPIETARIO_NO_EXISTE":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El propietario seleccionado no existe",
        )

    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró un vehículo con el ID '{vehiculo_id}'",
        )

    return vehiculo


from sqlalchemy.exc import IntegrityError

@router.delete("/{vehiculo_id}")
def eliminar_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()
    
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró un vehículo con el ID '{vehiculo_id}'"
        )
        
    try:
        db.delete(vehiculo)
        db.commit()
        return {"mensaje": "Vehículo eliminado correctamente"}
    except IntegrityError:
        # Esto pasa si intentamos borrar un carro que ya tiene multas guardadas
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar el vehículo porque ya tiene multas asociadas."
        )

