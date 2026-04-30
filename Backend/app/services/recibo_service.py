from sqlalchemy.orm import Session
from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.models.propietario import Propietario

def buscar_recibos(db: Session, termino: str = ""):
    # 1. Buscar multas que tengan un id_factura asignado
    query = db.query(Multa, Vehiculo, Propietario).join(
        Vehiculo, Multa.vehiculo_id == Vehiculo.id
    ).outerjoin(
        Propietario, Vehiculo.propietario == Propietario.dpi
    ).filter(Multa.id_factura.isnot(None))

    # 2. Filtrar por el buscador
    if termino:
        termino_lower = f"%{termino.lower()}%"
        query = query.filter(
            (Multa.id_factura.ilike(termino_lower)) |
            (Propietario.nombre.ilike(termino_lower))
        )

    resultados = query.all()

    # 3. Agrupar las multas por número de factura
    facturas_dict = {}
    for multa, vehiculo, propietario in resultados:
        if multa.id_factura not in facturas_dict:
            facturas_dict[multa.id_factura] = {
                "id_factura": multa.id_factura,
                "fecha_pago": multa.fecha_pago or "",
                "propietario_nombre": propietario.nombre if propietario else "Desconocido",
                "placa_vehiculo": vehiculo.placa,
                "total_pagado": 0.0,
                "multas": []
            }
        
        facturas_dict[multa.id_factura]["total_pagado"] += (multa.monto_final or 0.0)
        facturas_dict[multa.id_factura]["multas"].append({
            "id": multa.id,
            "tipo_infraccion": multa.tipo_infraccion,
            "descripcion": multa.descripcion,
            "monto_final": multa.monto_final or 0.0
        })

    return list(facturas_dict.values())