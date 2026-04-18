from fastapi import HTTPException, status
from firebase_admin import auth

def validar_token_firebase(token: str)->dict:
    try:
        token_decodificado = auth.verify_id_token(token)
        return token_decodificado
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Token de autenticación inválido{error}")
        