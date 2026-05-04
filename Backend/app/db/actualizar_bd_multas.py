import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parents[2] / "multas.db"

columnas = [
    ("fecha_notificacion", "TEXT NULL"),
    ("id_factura", "TEXT NULL"),
    ("fecha_pago", "TEXT NULL"),
    ("descuento_mora", "REAL NOT NULL DEFAULT 0"),
    ("monto_final", "REAL NOT NULL DEFAULT 0"),
    ("dias_retraso", "INTEGER NOT NULL DEFAULT 0"),
    ("monto_mora_calculado", "REAL NOT NULL DEFAULT 0"),
    ("descuento_pronto_pago", "REAL NOT NULL DEFAULT 0"),
]

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(multas)")
columnas_existentes = [columna[1] for columna in cursor.fetchall()]

for nombre_columna, tipo_columna in columnas:
    if nombre_columna in columnas_existentes:
        print(f"La columna ya existe: {nombre_columna}")
    else:
        cursor.execute(f"ALTER TABLE multas ADD COLUMN {nombre_columna} {tipo_columna}")
        print(f"Columna agregada: {nombre_columna}")

conn.commit()
conn.close()

print("Tabla multas actualizada correctamente.")