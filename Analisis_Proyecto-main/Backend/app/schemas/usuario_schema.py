from pydantic import BaseModel, ConfigDict, EmailStr

class UsuarioBase(BaseModel):
    nombres: str
    apellidos: str
    nombre_usuario: str
    correo: EmailStr
    rol: str
    activo: bool = True

class UsuarioRespuesta(UsuarioBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
