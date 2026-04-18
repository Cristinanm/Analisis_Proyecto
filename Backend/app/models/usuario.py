from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firebase_uid: Mapped[str] = mapped_column(String(255), unique=True, index=True,
     nullable=False)
     nombres: Mapped[str] = mapped_column(String(255), nullable=False)
     apellidos: Mapped[str] = mapped_column(String(255), nullable=False)
     correo: Mapped[str] = mapped_column(String(255), unique=True, index=True, 
     nullable=False)
     rol: Mapped[str] = mapped_column(String(50), nullable=False)
     activo: Mapped[bool] = mapped_column(Boolean, default=True)
     


