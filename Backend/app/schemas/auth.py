from pydantic import BaseModel, EmailStr

class UsuarioAutenticado(BaseModel):
    uid: str
    correo: EmailStr | None = None
    nombre: str | None = None
