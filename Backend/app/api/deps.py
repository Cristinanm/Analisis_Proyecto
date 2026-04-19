from fastapi import Depends, HTTPException, status, Header
from app.core.security import validar_token_firebase

def obtener_token_Bearer(authorization: str | None = Header(Default=None))->str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
         detail="Credenciales de autenticación no proporcionadas")
    return authorization.replace("Bearer ", "", 1).strip()
    
def obtener_usuario_autenticado(token: str = Depends(obtener_token_Bearer))->dict:
    return validar_token_firebase(token)
    
