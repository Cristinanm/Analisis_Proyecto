from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import configuracion

connect_args = {
    "check_same_thread": False

} if configuracion.database_url.startswith("sqlite") else {}
engine = create_engine(configuracion.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
