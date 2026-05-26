import pytest
from fastapi import HTTPException

from app.core.security import get_password_hash
from app.models.usuario import Usuario
from app.schemas.auth import RegistroRequest
from app.services.auth_service import autenticar_usuario, crear_usuario


def _registro_base(**overrides):
    data = {
        "nombres": "Ana",
        "apellidos": "Perez",
        "nombre_usuario": "anauser",
        "correo": "ana@test.com",
        "contrasena": "Ana12345!",
    }
    data.update(overrides)
    return RegistroRequest(**data)


def _crear_usuario_directo(db, **overrides):
    data = {
        "nombres": "Juan",
        "apellidos": "Lopez",
        "nombre_usuario": "juan",
        "correo": "juan@test.com",
        "hashed_password": get_password_hash("Clave123!"),
        "rol": "usuario",
        "activo": True,
        "intentos_fallidos": 0,
        "bloqueado": False,
    }
    data.update(overrides)
    u = Usuario(**data)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def test_sis41_crear_usuario_registra_y_normaliza(db):
    nuevo = crear_usuario(
        db,
        _registro_base(
            nombre_usuario="  AnaUser  ",
            correo="ANA@TEST.COM",
        ),
    )

    assert nuevo.id is not None
    assert nuevo.nombre_usuario == "anauser"
    assert nuevo.correo == "ana@test.com"
    assert nuevo.hashed_password != "Ana12345!"


def test_sis41_crear_usuario_rechaza_correo_duplicado(db):
    crear_usuario(db, _registro_base())

    with pytest.raises(HTTPException) as err:
        crear_usuario(
            db,
            _registro_base(
                nombre_usuario="otro_user",
                correo="ana@test.com",
            ),
        )

    assert err.value.status_code == 409


def test_sis41_login_bloquea_al_tercer_intento_fallido(db):
    user = _crear_usuario_directo(db)

    with pytest.raises(HTTPException) as e1:
        autenticar_usuario(db, user.nombre_usuario, "mala12345!")
    assert e1.value.status_code == 401

    with pytest.raises(HTTPException) as e2:
        autenticar_usuario(db, user.nombre_usuario, "mala12345!")
    assert e2.value.status_code == 401

    with pytest.raises(HTTPException) as e3:
        autenticar_usuario(db, user.nombre_usuario, "mala12345!")
    assert e3.value.status_code == 403

    db.refresh(user)
    assert user.bloqueado is True
    assert user.intentos_fallidos == 3


def test_sis41_login_exitoso_limpia_intentos(db):
    user = _crear_usuario_directo(db, intentos_fallidos=2)

    autenticado = autenticar_usuario(db, user.correo, "Clave123!")

    assert autenticado.id == user.id
    db.refresh(user)
    assert user.intentos_fallidos == 0
    assert user.ultimo_intento_fallido is None
