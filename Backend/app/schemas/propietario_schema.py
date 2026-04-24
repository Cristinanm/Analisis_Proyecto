from pydantic import BaseModel, Field, EmailStr


class PropietarioBase(BaseModel):
    dpi: str = Field(min_length=13, max_length=13)
    nombre: str = Field(min_length=2, max_length=120)
    correo: EmailStr
    direccion: str = Field(min_length=4, max_length=255)
    telefono: str = Field(min_length=6, max_length=25)


class PropietarioCreate(PropietarioBase):
    pass


class PropietarioUpdate(PropietarioBase):
    pass


class PropietarioResponse(PropietarioBase):
    id: int

    class Config:
        from_attributes = True