from pydantic import BaseModel


class PropietarioSimple(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class VehiculoBase(BaseModel):
    placa: str
    marca: str
    modelo: str
    anio: int


class VehiculoCreate(VehiculoBase):
    propietario_id: int


class VehiculoResponse(VehiculoBase):
    id: int
    propietario_id: int | None = None
    propietario: PropietarioSimple | None = None

    class Config:
        from_attributes = True