from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    nombre_usuario = Column(String(50), unique=True, index=True, nullable=False)
    correo = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    rol = Column(String(30), nullable=False, default="usuario")
    activo = Column(Boolean, nullable=False, default=True)
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expira = Column(DateTime, nullable=True)
    creado_en = Column(DateTime, nullable=False, default=datetime.utcnow)


