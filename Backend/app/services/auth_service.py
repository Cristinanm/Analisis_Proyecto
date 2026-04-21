import re
import secrets
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.usuario import Usuario
from app.schemas.auth import RegistroRequest

ROLES_VALIDOS = {"usuario", "admin", "supervisor"}
PATRON_PASSWORD_SEGURA = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$"
)


def _validar_password_segura(contrasena: str) -> None:
    if not PATRON_PASSWORD_SEGURA.match(contrasena):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "La contraseña debe tener 8+ caracteres, mayúscula, "
                "minúscula, número y símbolo especial."
            ),
        )


def _obtener_usuario_por_correo(db: Session, correo: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.correo == correo.lower()).first()


def _obtener_usuario_por_username(db: Session, username: str) -> Usuario | None:
    return (
        db.query(Usuario)
        .filter(Usuario.nombre_usuario == username.strip().lower())
        .first()
    )


def crear_usuario(db: Session, payload: RegistroRequest) -> Usuario:
    correo = payload.correo.lower()
    nombre_usuario = payload.nombre_usuario.strip().lower()

    if _obtener_usuario_por_correo(db, correo):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo electrónico ya está registrado.",
        )

    if _obtener_usuario_por_username(db, nombre_usuario):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de usuario ya existe.",
        )

    _validar_password_segura(payload.contrasena)

    nuevo_usuario = Usuario(
        nombres=payload.nombres.strip(),
        apellidos=payload.apellidos.strip(),
        nombre_usuario=nombre_usuario,
        correo=correo,
        hashed_password=get_password_hash(payload.contrasena),
        rol="usuario",
        activo=True,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


def autenticar_usuario(db: Session, usuario_o_correo: str, contrasena: str) -> Usuario:
    clave = usuario_o_correo.strip().lower()
    usuario = (
        db.query(Usuario)
        .filter((Usuario.nombre_usuario == clave) | (Usuario.correo == clave))
        .first()
    )

    if not usuario or not verify_password(contrasena, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas.",
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario está inactivo. Contacta al administrador.",
        )

    return usuario


def generar_token_recuperacion(db: Session, correo: str) -> str | None:
    usuario = _obtener_usuario_por_correo(db, correo)
    if not usuario:
        return None

    token = secrets.token_urlsafe(32)
    usuario.reset_token = token
    usuario.reset_token_expira = datetime.utcnow() + timedelta(minutes=30)
    db.commit()
    return token


def restablecer_contrasena(db: Session, token: str, nueva_contrasena: str) -> None:
    _validar_password_segura(nueva_contrasena)
    usuario = db.query(Usuario).filter(Usuario.reset_token == token).first()

    if (
        not usuario
        or not usuario.reset_token_expira
        or usuario.reset_token_expira < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token de recuperación es inválido o expiró.",
        )

    usuario.hashed_password = get_password_hash(nueva_contrasena)
    usuario.reset_token = None
    usuario.reset_token_expira = None
    db.commit()


def actualizar_rol_usuario(db: Session, user_id: int, rol: str) -> Usuario:
    rol_normalizado = rol.strip().lower()
    if rol_normalizado not in ROLES_VALIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Roles válidos: {', '.join(sorted(ROLES_VALIDOS))}",
        )

    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    usuario.rol = rol_normalizado
    db.commit()
    db.refresh(usuario)
    return usuario
