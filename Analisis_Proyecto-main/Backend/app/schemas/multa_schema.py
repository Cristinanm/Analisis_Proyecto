from pydantic import BaseModel, Field


class MultaCreate(BaseModel):
    placa: str
    fecha: str
    tipo_infraccion: str = Field(..., min_length=1)
    descripcion: str = Field(..., min_length=1)
    monto_base: float = Field(..., gt=0)


class MultaResponse(BaseModel):
    id: int
    vehiculo_id: int
    fecha: str
    tipo_infraccion: str
    descripcion: str
    monto_base: float
    estado: str
    mensaje: str