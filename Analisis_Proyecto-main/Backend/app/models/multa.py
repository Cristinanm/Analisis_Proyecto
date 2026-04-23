from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Multa(Base):
    __tablename__ = "multas"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(String, nullable=False)
    tipo_infraccion = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    monto_base = Column(Float, nullable=False)
    estado = Column(String, nullable=False, default="pendiente")

    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    vehiculo = relationship("Vehiculo", back_populates="multas")