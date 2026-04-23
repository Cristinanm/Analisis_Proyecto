import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.security import get_password_hash
from app.database import Base, SessionLocal, engine
from app.api.vehiculo_router import router as vehiculo_router
from app.api.multa_router import router as multa_router
from app.api.routers_auth import router as auth_router
from app.api.propietario_router import router as propietario_router
from app.api.routers_reportes import router as reportes_router
from app.models.usuario import Usuario

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Sistema de Multas",
    version="1.0.0"
)

def _seed_admin_si_no_existe() -> None:
    db = SessionLocal()
    try:
        existe = db.query(Usuario.id).first()
        if existe:
            return

        nombre_usuario = os.getenv("DEFAULT_ADMIN_USERNAME", "admin").strip().lower()
        correo = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@local.test").strip().lower()
        contrasena = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin123!")

        admin = Usuario(
            nombres="Admin",
            apellidos="Sistema",
            nombre_usuario=nombre_usuario,
            correo=correo,
            hashed_password=get_password_hash(contrasena),
            rol="admin",
            activo=True,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def _startup_seed() -> None:
    _seed_admin_si_no_existe()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehiculo_router)
app.include_router(multa_router)
app.include_router(auth_router)
app.include_router(propietario_router)
app.include_router(reportes_router)

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Backend funcionando correctamente"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
