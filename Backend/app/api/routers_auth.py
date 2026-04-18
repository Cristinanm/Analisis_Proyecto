from fastapi import APIRouter, Depends
from app.api.deps import obtener_usuario_autenticado

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
def obtener_mi_perfil(usuario_actual: dict = Depends(obtener_usuario_autenticado)):
    return {
        "uid": usuario_actual.get("uid"),
        "correo": usuario_actual.get("correo"),
        "nombre": usuario_actual.get("nombre"),

    }

@router.get("/public")
def endpoint_publico():
    return {
        "mensaje": "Ruta publica disponible"
    }

@router.get("/protected")
def endpoint_protegido(usuario_actual: dict = Depends(obtener_usuario_autenticado)):
    return {
        "mensaje": "Ruta protegida disponible"
        "uid": usuario_actual.get("uid"),
        "correo": usuario_actual.get("correo"),
    }