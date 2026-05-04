from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class UsuarioBase(BaseModel):
    nombres: str
    apellidos: str
    nombre_usuario: str
    correo: EmailStr
    rol: str
    activo: bool = True

    # RF-31: bloqueo por intentos fallidos
    intentos_fallidos: int = 0
    bloqueado: bool = False
    bloqueado_en: datetime | None = None
    ultimo_intento_fallido: datetime | None = None


class UsuarioRespuesta(UsuarioBase):
    id: int
    model_config = ConfigDict(from_attributes=True)