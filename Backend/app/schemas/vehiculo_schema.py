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
    propietario_id: int


class VehiculoCreate(VehiculoBase):
    pass


class VehiculoResponse(VehiculoBase):
    id: int
    propietario: PropietarioSimple | None = None

    class Config:
        from_attributes = True