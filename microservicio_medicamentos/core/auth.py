import os
import base64
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import httpx
from functools import lru_cache
from typing import Optional, List
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization


# Leer variables de entorno (validación lazy - solo cuando se usa)
def _get_auth0_config():
    """Obtiene la configuración de Auth0 y valida que esté presente"""
    AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
    AUTH0_AUDIENCE = os.getenv("AUTH0_TEST_API")  # Audience para validar (https://crz.com)
    
    if not AUTH0_DOMAIN or not AUTH0_AUDIENCE:
        raise ValueError("AUTH0_DOMAIN y AUTH0_TEST_API deben estar configurados en las variables de entorno")
    
    return AUTH0_DOMAIN, AUTH0_AUDIENCE

security = HTTPBearer()

@lru_cache()
def get_jwks():
    """Obtiene las claves públicas de Auth0 desde el JWKS endpoint (cached)"""
    AUTH0_DOMAIN, _ = _get_auth0_config()
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    try:
        response = httpx.get(jwks_url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error al obtener claves públicas de Auth0: {str(e)}"
        )

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verifica que el token JWT de Auth0 sea válido.
    Retorna el payload del token si es válido.
    """
    try:
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No se proporcionaron credenciales"
            )
        global token
        token = credentials.credentials
        
        # 1. Obtener el header del token para extraer el kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token no contiene kid en el header"
            )
        
        # 2. Obtener las claves públicas (JWKS) de Auth0
        jwks = get_jwks()
        
        # 3. Buscar la clave correspondiente al kid
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == kid:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No se encontró la clave pública para verificar el token"
            )
        
        # 4. Convertir la clave JWK a formato PEM para python-jose
        
        # Construir la clave RSA pública desde los componentes n y e
        # Decodificar base64 y convertir bytes a entero big-endian
        n_bytes = base64.urlsafe_b64decode(rsa_key["n"] + "==")
        e_bytes = base64.urlsafe_b64decode(rsa_key["e"] + "==")
        n = int.from_bytes(n_bytes, byteorder='big')
        e = int.from_bytes(e_bytes, byteorder='big')
        
        public_numbers = rsa.RSAPublicNumbers(e, n)
        public_key_crypto = public_numbers.public_key()
        public_key_pem = public_key_crypto.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
        
        # 5. Verificar y decodificar el token
        # Esto valida:
        # - La firma (signature)
        # - La expiración (exp)
        # - El issuer (iss) debe ser https://AUTH0_DOMAIN/
        # - El audience (aud) debe ser AUTH0_TEST_API
        AUTH0_DOMAIN, AUTH0_AUDIENCE = _get_auth0_config()
        payload = jwt.decode(
            token,
            public_key_pem,
            algorithms=["RS256"],
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.JWTClaimsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Claims inválidas: {str(e)}"
        )
    except jwt.JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}"
        )
    except HTTPException:
        # Re-lanzar HTTPException sin modificar
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error al verificar token: {str(e)}"
        )

def get_user_rol(payload: dict) -> Optional[str]:
    """Extrae el rol del usuario del payload del token"""
    # Los roles están en https://crz-web.com/roles
    roles = payload.get("https://crz-web.com/roles", [])
    if roles and len(roles) > 0:
        return roles[0]  # Retorna el primer rol
    return None

def get_user_id(payload: dict) -> Optional[str]:
    """Extrae el ID del usuario (sub) del payload del token"""
    return payload.get("sub")

def get_user_id_authless(payload: dict) -> Optional[str]:
    # Devuelve el ID sin el auth| (se corresponde con el ID de la BD)
    id = get_user_id(payload)
    if not id:
        raise HTTPException(
            status_code=404,
            detail="No se reconoce el ID del usuario"
        )
    return int(id[6:])

def verify_role(rol_requerido: str):
    """
    Dependencia de FastAPI que verifica que el usuario tenga el rol requerido
    """
    def check_role(token_payload: dict = Depends(verify_token)):
        rol_usuario = get_user_rol(token_payload)
        if rol_usuario != rol_requerido:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere rol: {rol_requerido}, pero el usuario tiene rol: {rol_usuario}"
            )
        return token_payload
    return check_role

def get_token():
    return token
def verify_role_is_in(rol_requerido: List[str]):
    """
    Dependencia de FastAPI que verifica que el usuario tenga alguno de los roles requeridos
    """
    def check_role(token_payload: dict = Depends(verify_token)):
        rol_usuario = get_user_rol(token_payload)
        if rol_usuario not in rol_requerido:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere alguno de los siguientes roles: {', '.join(rol_requerido)}, pero el usuario tiene rol: {rol_usuario}"
            )
        return token_payload
    return check_role

