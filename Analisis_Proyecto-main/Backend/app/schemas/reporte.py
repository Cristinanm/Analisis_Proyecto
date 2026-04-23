from pydantic import BaseModel


class ReporteMulta(BaseModel):
    id: int
    placa: str
    fecha: str
    tipo_infraccion: str
    monto_base: float
    descuento_o_mora: float
    total_actual: float
    estado: str

    class Config:
        from_attributes = True

    # Clase para crear reportes de multas pagadas y total recaudadas

class ReporteMultasPagadasResponse (BaseModel):
    total_recaudado: float 
    Cantidad: int
    multas: list[ReporteMulta]