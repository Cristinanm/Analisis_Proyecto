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

    fecha_notificacion = Column(String, nullable=True)

    id_factura = Column(String, nullable=True)
    fecha_pago = Column(String, nullable=True)
    descuento_mora = Column(Float, nullable=False, default=0.0)
    monto_final = Column(Float, nullable=True)

    dias_retraso = Column(Integer, nullable=False, default=0)
    monto_mora_calculado = Column(Float, nullable=False, default=0.0)
    descuento_pronto_pago = Column(Float, nullable=False, default=0.0)

    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    vehiculo = relationship("Vehiculo", back_populates="multas")
    