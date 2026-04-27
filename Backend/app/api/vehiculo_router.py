from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vehiculo import Vehiculo
from app.schemas.vehiculo_schema import VehiculoCreate, VehiculoResponse, VehiculoBase
from app.services.vehiculo_service import (
    crear_vehiculo,
    listar_vehiculos,
    obtener_vehiculo_por_placa,
    actualizar_vehiculo,
)

router = APIRouter(prefix="/api/vehiculos", tags=["Vehículos"])


@router.post("/", response_model=VehiculoResponse, status_code=status.HTTP_201_CREATED)
def crear_nuevo_vehiculo(vehiculo: VehiculoCreate, db: Session = Depends(get_db)):
    existente = obtener_vehiculo_por_placa(db, vehiculo.placa.upper())

    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La placa ya existe"
        )

    return crear_vehiculo(db, vehiculo)


@router.get("/", response_model=list[VehiculoResponse])
def obtener_vehiculos(db: Session = Depends(get_db)):
    return listar_vehiculos(db)


@router.get("/buscar", response_model=list[VehiculoResponse])
def buscar_vehiculos(
    placa: str | None = Query(default=None),
    marca: str | None = Query(default=None),
    propietario: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Vehiculo)

    if placa:
        query = query.filter(Vehiculo.placa.ilike(f"%{placa}%"))

    if marca:
        query = query.filter(Vehiculo.marca.ilike(f"%{marca}%"))

    if propietario:
        query = query.filter(Vehiculo.propietario.ilike(f"%{propietario}%"))

    return query.all()


@router.get("/placa/{placa}", response_model=VehiculoResponse)
def buscar_vehiculo_por_placa(placa: str, db: Session = Depends(get_db)):
    vehiculo = obtener_vehiculo_por_placa(db, placa.upper())

    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró un vehículo con la placa '{placa}'"
        )

    return vehiculo


@router.put("/{vehiculo_id}", response_model=VehiculoResponse)
def editar_vehiculo(
    vehiculo_id: int,
    vehiculo_actualizado: VehiculoBase,
    db: Session = Depends(get_db)
):
    vehiculo = actualizar_vehiculo(db, vehiculo_id, vehiculo_actualizado)

    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró un vehículo con el ID '{vehiculo_id}'"
        )

    return vehiculo