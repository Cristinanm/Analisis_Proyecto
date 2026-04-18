from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import Configuracion

connect_args = {
    "check_same_thread": False

}if Configuracion.database_url.startswith("sqlite") else {}
engine = create_engine(Configuracion.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
