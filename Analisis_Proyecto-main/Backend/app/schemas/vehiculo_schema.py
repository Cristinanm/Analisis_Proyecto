from pydantic import BaseModel


class VehiculoBase(BaseModel):
    placa: str
    marca: str
    modelo: str
    anio: int
    propietario: str | None = None


class VehiculoCreate(VehiculoBase):
    pass


class VehiculoResponse(VehiculoBase):
    id: int

    class Config:
        from_attributes = True