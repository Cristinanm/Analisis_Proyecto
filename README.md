# Analisis_Proyecto

Sistema con backend en **FastAPI + SQLite** y frontend en **React + Vite + Tailwind CSS**.

## Requisitos

- Python 3.11+ (probado con 3.13)
- Node.js 20+ y npm

## Estructura

- `Backend/` API, autenticación y base SQLite
- `Frontend/` interfaz web

## Ejecutar Backend

1. Ir al backend:
```bash
cd Backend
```

2. Instalar dependencias:
```bash
python -m pip install -r requirements.txt
```

3. Ejecutar servidor:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend disponible en:
- `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`

## Ejecutar Frontend

1. Ir al frontend:
```bash
cd Frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar Vite:
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend disponible en:
- `http://127.0.0.1:5173`

## Usuario Seed (login)

Usuario administrador precargado:

- **usuario:** `admin`
- **correo:** `admin@demo.com`
- **contrasena:** `Admin@123!`
- **rol:** `admin`

Puedes iniciar sesión con `usuario` o `correo`.
