from pydantic import BaseModel, EmailStr, Field


class RegistroRequest(BaseModel):
    nombres: str = Field(min_length=2, max_length=100)
    apellidos: str = Field(min_length=2, max_length=100)
    nombre_usuario: str = Field(min_length=4, max_length=50)
    correo: EmailStr
    contrasena: str = Field(min_length=8, max_length=72)


class LoginRequest(BaseModel):
    usuario_o_correo: str = Field(min_length=3, max_length=120)
    contrasena: str = Field(min_length=8, max_length=72)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    correo: EmailStr


class ForgotPasswordResponse(BaseModel):
    mensaje: str
    token_recuperacion: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10)
    nueva_contrasena: str = Field(min_length=8, max_length=72)


class RoleUpdateRequest(BaseModel):
    rol: str = Field(min_length=4, max_length=30)
