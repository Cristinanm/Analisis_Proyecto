from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import obtener_usuario_autenticado
from app.core.security import create_access_token
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.auth import (
    AdminUserCreateRequest,
    AdminUserUpdateRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RegistroRequest,
    ResetPasswordRequest,
    RoleUpdateRequest,
    TokenResponse,
    UserStatusUpdateRequest,
)
from app.schemas.usuario_schema import UsuarioRespuesta
from app.services.auth_service import (
    actualizar_rol_usuario,
    actualizar_estado_usuario,
    actualizar_usuario_admin,
    autenticar_usuario,
    crear_usuario_admin,
    crear_usuario,
    eliminar_usuario_admin,
    generar_token_recuperacion,
    listar_usuarios,
    restablecer_contrasena,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


def _validar_admin(usuario_actual: Usuario) -> None:
    if usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un administrador puede ejecutar esta accion.",
        )


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
    _validar_admin(usuario_actual)

    return actualizar_rol_usuario(db, user_id, payload.rol)


@router.get("/admin/users", response_model=list[UsuarioRespuesta])
def obtener_usuarios_admin(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_autenticado),
):
    _validar_admin(usuario_actual)
    return listar_usuarios(db)


@router.patch("/admin/users/{user_id}/status", response_model=UsuarioRespuesta)
def actualizar_estado(
    user_id: int,
    payload: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_autenticado),
):
    _validar_admin(usuario_actual)

    if usuario_actual.id == user_id and payload.activo is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propio usuario administrador.",
        )

    return actualizar_estado_usuario(db, user_id, payload.activo)


@router.post("/admin/users", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def crear_usuario_desde_admin(
    payload: AdminUserCreateRequest,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_autenticado),
):
    _validar_admin(usuario_actual)
    return crear_usuario_admin(db, payload)


@router.put("/admin/users/{user_id}", response_model=UsuarioRespuesta)
def editar_usuario_desde_admin(
    user_id: int,
    payload: AdminUserUpdateRequest,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_autenticado),
):
    _validar_admin(usuario_actual)
    if usuario_actual.id == user_id and payload.activo is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propio usuario administrador.",
        )
    return actualizar_usuario_admin(db, user_id, payload)


@router.delete("/admin/users/{user_id}")
def eliminar_usuario_desde_admin(
    user_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_autenticado),
):
    _validar_admin(usuario_actual)
    eliminar_usuario_admin(db, user_id, usuario_actual.id)
    return {"mensaje": "Usuario eliminado correctamente."}
