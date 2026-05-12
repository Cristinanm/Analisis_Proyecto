from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Vehiculo(Base):
    __tablename__ = "vehiculos"

    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String, unique=True, nullable=False, index=True)
    marca = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    anio = Column(Integer, nullable=False)

    propietario_id = Column(Integer, ForeignKey("propietarios.id"), nullable=False)

    propietario = relationship("Propietario", back_populates="vehiculos")
    multas = relationship("Multa", back_populates="vehiculo")
