from sqlalchemy import Column, Integer, String

from app.database import Base


class Propietario(Base):
    __tablename__ = "propietarios"

    id = Column(Integer, primary_key=True, index=True)
    dpi = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(120), nullable=False)
    direccion = Column(String(255), nullable=False)
    telefono = Column(String(25), nullable=False)
