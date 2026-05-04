import sqlite3
from pathlib import Path

db_path = Path(__file__).with_name("multas.db")

columnas = [
    ("intentos_fallidos", "INTEGER NOT NULL DEFAULT 0"),
    ("bloqueado", "BOOLEAN NOT NULL DEFAULT 0"),
    ("bloqueado_en", "DATETIME NULL"),
    ("ultimo_intento_fallido", "DATETIME NULL"),
]

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

for nombre_columna, tipo_columna in columnas:
    try:
        cursor.execute(f"ALTER TABLE usuarios ADD COLUMN {nombre_columna} {tipo_columna}")
        print(f"Columna agregada: {nombre_columna}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"La columna ya existe: {nombre_columna}")
        else:
            print(f"Error con {nombre_columna}: {e}")

conn.commit()
conn.close()

print("Base de datos actualizada para RF-31.")