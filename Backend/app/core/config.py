from pydantic_settings import BaseSettings, SettingsConfigDict

class Configuracion(BaseSettings):
    app_nombre: str = "Sistema de Gestion de Multas"
    app_version: str = "1.0.0"
    debug: bool = True
    database_url: str = "sqlite:////multas.db"
    frontend_url: str = "http://localhost:5173"
    firebase_credentials: str = ""
    firebase_project_id: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    Configuracion = Configuracion()
