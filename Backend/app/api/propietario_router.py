from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.propietario_schema import (
    PropietarioCreate,
    PropietarioResponse,
    PropietarioUpdate,
)
from app.services.propietario_service import (
    actualizar_propietario,
    buscar_propietarios,
    crear_propietario,
    obtener_propietario_por_correo,
    obtener_propietario_por_dpi,
    obtener_propietario_por_id,
)

router = APIRouter(prefix="/api/propietarios", tags=["Propietarios"])


@router.post("/", response_model=PropietarioResponse, status_code=status.HTTP_201_CREATED)
def crear_nuevo_propietario(data: PropietarioCreate, db: Session = Depends(get_db)):
    if not data.dpi or not data.nombre or not data.correo or not data.direccion or not data.telefono:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faltan datos obligatorios",
        )

    existente_dpi = obtener_propietario_por_dpi(db, data.dpi.strip())
    if existente_dpi:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El DPI ya existe",
        )

    existente_correo = obtener_propietario_por_correo(db, data.correo.strip().lower())
    if existente_correo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado",
        )

    return crear_propietario(db, data)


@router.get("/buscar", response_model=list[PropietarioResponse])
def buscar_propietario(
    dpi: str | None = Query(default=None),
    nombre: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    dpi_valor = dpi.strip() if dpi else None
    nombre_valor = nombre.strip() if nombre else None

    if not dpi_valor and not nombre_valor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes enviar un criterio de busqueda: DPI o nombre.",
        )

    return buscar_propietarios(db, dpi=dpi_valor, nombre=nombre_valor)


@router.get("/{propietario_id}", response_model=PropietarioResponse)
def consultar_propietario(propietario_id: int, db: Session = Depends(get_db)):
    propietario = obtener_propietario_por_id(db, propietario_id)

    if not propietario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propietario no encontrado.",
        )

    return propietario


@router.put("/{propietario_id}", response_model=PropietarioResponse)
def editar_propietario(
    propietario_id: int, data: PropietarioUpdate, db: Session = Depends(get_db)
):
    propietario = obtener_propietario_por_id(db, propietario_id)
    if not propietario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propietario no encontrado.",
        )

    existente_dpi = obtener_propietario_por_dpi(db, data.dpi.strip())
    if existente_dpi and existente_dpi.id != propietario.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El DPI ya existe",
        )

    existente_correo = obtener_propietario_por_correo(db, data.correo.strip().lower())
    if existente_correo and existente_correo.id != propietario.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado",
        )

    return actualizar_propietario(db, propietario, data)