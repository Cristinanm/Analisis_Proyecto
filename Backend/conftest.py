import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.database import get_db

from app.models.propietario import Propietario
from app.models.vehiculo import Vehiculo
from app.models.multa import Multa

# Base de datos temporal para pruebas
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Crear tablas automáticamente
Base.metadata.create_all(bind=engine)


@pytest.fixture()
def db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()