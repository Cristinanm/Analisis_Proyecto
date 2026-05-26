from sqlalchemy.orm import Session
from app.models.multa import Multa
from app.models.vehiculo import Vehiculo
from app.models.propietario import Propietario

def buscar_recibos(db: Session, termino: str = ""):
    query = db.query(Multa, Vehiculo, Propietario).join(
        Vehiculo, Multa.vehiculo_id == Vehiculo.id
    ).outerjoin(
        Propietario, Vehiculo.propietario_id == Propietario.id
    )

    if termino:
        termino_lower = f"%{termino.lower()}%"
        query = query.filter(
            (Multa.id_factura.ilike(termino_lower)) |
            (Propietario.nombre.ilike(termino_lower))
        )

    resultados = query.all()

    facturas_dict = {}

    for multa, vehiculo, propietario in resultados:
        if multa.id not in facturas_dict:
            facturas_dict[multa.id] = {
                "id_factura": multa.id,
                "fecha_pago": str(multa.fecha_pago) if multa.fecha_pago else "",
                "propietario_nombre": propietario.nombre if propietario else "Desconocido",
                "placa_vehiculo": vehiculo.placa,
                "total_pagado": 0.0,
                "multas": []
            }
        facturas_dict[multa.id]["total_pagado"] += float(multa.monto_final or 0.0)

        facturas_dict[multa.id]["multas"].append({
            "id": multa.id,
            "tipo_infraccion": multa.tipo_infraccion,
            "descripcion": multa.descripcion,
            "monto_final": float(multa.monto_final or 0.0)
        })

    return list(facturas_dict.values())