from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import obtener_usuario_autenticado
from app.core.security import create_access_token
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RegistroRequest,
    ResetPasswordRequest,
    RoleUpdateRequest,
    TokenResponse,
)
from app.schemas.usuario_schema import UsuarioRespuesta
from app.services.auth_service import (
    actualizar_rol_usuario,
    autenticar_usuario,
    crear_usuario,
    generar_token_recuperacion,
    restablecer_contrasena,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def registrar_usuario(payload: RegistroRequest, db: Session = Depends(get_db)):
    usuario = crear_usuario(db, payload)
    return usuario


@router.post("/login", response_model=TokenResponse)
def iniciar_sesion(payload: LoginRequest, db: Session = Depends(get_db)):
    usuario = autenticar_usuario(db, payload.usuario_o_correo, payload.contrasena)
    token = create_access_token({"sub": str(usuario.id), "rol": usuario.rol})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UsuarioRespuesta)
def obtener_mi_perfil(usuario_actual: Usuario = Depends(obtener_usuario_autenticado)):
    return usuario_actual


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def recuperar_contrasena(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    token = generar_token_recuperacion(db, payload.correo)
    return ForgotPasswordResponse(
        mensaje="Si el correo existe, se genero un token de recuperacion temporal.",
        token_recuperacion=token,
    )


@router.post("/reset-password")
def resetear_contrasena(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    restablecer_contrasena(db, payload.token, payload.nueva_contrasena)
    return {"mensaje": "Contrasena actualizada exitosamente."}


@router.patch("/admin/users/{user_id}/role", response_model=UsuarioRespuesta)
def asignar_rol(
    user_id: int,
    payload: RoleUpdateRequest,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_autenticado),
):
    if usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un administrador puede asignar roles.",
        )

    return actualizar_rol_usuario(db, user_id, payload.rol)
