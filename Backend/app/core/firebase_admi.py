import firebase_admin
from firebase_admin import credentials

def initialize_firebase()->None:
    if firebase_admin._apps:
        return
    if Configuracion.firebase_credentials_path:
        credencial = credentials.Certificate(Configuracion.firebase_credentials_path)
        firebase_admin.initialize_app(credencial)
        return

    opciones = {}

    if Configuracion.firebase_project_id:
        opciones["projectId"] = Configuracion.firebase_project_id

    if opciones:
        firebase_admin.initialize_app(options=opciones)

    else:
        firebase_admin.initialize_app()
