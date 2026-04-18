from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel):
    firebase_uid: str
    nombres: str
    apellidos: str
    correo: EmailStr
    rol: str
    activo: bool = True

class UsuarioRespuesta(UsuarioBase):
    id: int
    class Config:
        from_attributes = True
