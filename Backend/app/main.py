from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.api.vehiculo_router import router as vehiculo_router
from app.api.multa_router import router as multa_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Sistema de Multas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehiculo_router)
app.include_router(multa_router)

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Backend funcionando correctamente"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
