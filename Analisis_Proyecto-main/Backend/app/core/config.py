from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracion(BaseSettings):
    app_nombre: str = Field(default="Sistema de Gestion de Multas", validation_alias="App_nombre")
    app_version: str = Field(default="1.0.0", validation_alias="App_version")
    debug: bool = Field(default=True, validation_alias="Debug")
    database_url: str = Field(default="sqlite:///./multas.db", validation_alias="Database_url")
    frontend_url: str = Field(default="http://localhost:5173", validation_alias="Frontend_url")

    @field_validator("debug", mode="before")
    @classmethod
    def normalizar_debug(cls, value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            valor = value.strip().lower()
            if valor in {"1", "true", "yes", "on", "debug", "development", "dev"}:
                return True
            if valor in {"0", "false", "no", "off", "release", "prod", "production"}:
                return False
        return True

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


configuracion = Configuracion()
