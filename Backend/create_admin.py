from __future__ import annotations

import argparse

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.database import Base, engine
from app.db.session import SessionLocal
from app.models.usuario import Usuario


def upsert_admin(
    db: Session,
    *,
    nombre_usuario: str,
    correo: str,
    contrasena: str,
    nombres: str,
    apellidos: str,
) -> Usuario:
    clave = nombre_usuario.strip().lower()
    email = correo.strip().lower()

    usuario = (
        db.query(Usuario)
        .filter((Usuario.nombre_usuario == clave) | (Usuario.correo == email))
        .first()
    )

    if usuario:
        usuario.nombre_usuario = clave
        usuario.correo = email
        usuario.nombres = nombres.strip()
        usuario.apellidos = apellidos.strip()
        usuario.hashed_password = get_password_hash(contrasena)
        usuario.rol = "admin"
        usuario.activo = True
        db.commit()
        db.refresh(usuario)
        return usuario

    usuario = Usuario(
        nombre_usuario=clave,
        correo=email,
        nombres=nombres.strip(),
        apellidos=apellidos.strip(),
        hashed_password=get_password_hash(contrasena),
        rol="admin",
        activo=True,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def main() -> int:
    parser = argparse.ArgumentParser(description="Crea/actualiza un usuario admin en multas.db")
    parser.add_argument("--usuario", default="admin")
    parser.add_argument("--correo", default="admin@demo.com")
    parser.add_argument("--contrasena", default="Admin@123!")
    parser.add_argument("--nombres", default="Administrador")
    parser.add_argument("--apellidos", default="Sistema")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        usuario = upsert_admin(
            db,
            nombre_usuario=args.usuario,
            correo=args.correo,
            contrasena=args.contrasena,
            nombres=args.nombres,
            apellidos=args.apellidos,
        )
        print("OK admin listo:")
        print(f"  id: {usuario.id}")
        print(f"  usuario: {usuario.nombre_usuario}")
        print(f"  correo: {usuario.correo}")
        print("  contrasena: (la que pasaste por --contrasena)")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
