from sqlalchemy.orm import Session
from app.models.vehiculo import Vehiculo
from app.models.multa import Multa

def obtener_totales_dashboard(db: Session):
    
    total_vehiculos = db.query(Vehiculo).count()
    
    
    pagadas = db.query(Multa).filter(Multa.estado == "pagada").count()
    pendientes = db.query(Multa).filter(Multa.estado == "pendiente").count()
    
    return {
        "total_vehiculos": total_vehiculos,
        "multas_pagadas": pagadas,
        "multas_pendientes": pendientes
    }