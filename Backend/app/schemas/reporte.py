from pydantic import BaseModel


class ReporteMultaPagada(BaseModel):
    id: int
    placa: str
    id_factura: str | None
    fecha_pago: str | None
    monto_base: float
    descuento_mora: float
    monto_final: float
    estado: str

    class Config:
        from_attributes = True