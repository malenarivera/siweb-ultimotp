import os
import json
import ast
import re
import builtins
import sys
import pytest

def _parse(raw):
    """Intentos para convertir la variable raw en un dict de headers:
    1) JSON
    2) literal Python con ast.literal_eval
    3) extraer token JWT (eyJ...)
    4) buscar 'Bearer <token>'
    Devuelve dict o None si no pudo parsear.
    """
    if not raw:
        return None

    # 1) JSON
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    # 2) Python literal (seguro)
    try:
        parsed = ast.literal_eval(raw)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    # 3) Buscar JWT-like (eyJ...) y devolver Authorization header
    m = re.search(r"(eyJ[A-Za-z0-9_\-]+(?:\.[A-Za-z0-9_\-]+){1,2})", raw)
    if m:
        token = m.group(1)
        return {"Authorization": f"Bearer {token}"}

    # 4) Buscar "Bearer <token>"
    m2 = re.search(r"Bearer\s*['\"]?([A-Za-z0-9_\-\.]+)['\"]?", raw, re.IGNORECASE)
    if m2:
        return {"Authorization": f"Bearer {m2.group(1)}"}

    return None

# Para cada env esperamos HEADERS_PSIQUIATRA y HEADERS_SECRETARIA.
# Si existe la variable de entorno intentamos parsearla y la exponemos en builtins
# con el mismo nombre para que el archivo de tests pueda usar HEADERS_PSIQUIATRA / HEADERS_SECRETARIA.
for env_name in ("HEADERS_PSIQUIATRA", "HEADERS_SECRETARIA"):
    raw = os.getenv(env_name)
    if raw:
        parsed = _parse(raw)
        if parsed is None:
            # Si el secret está presente pero no parseable, abortamos la corrida (mejor que fallos difíciles)
            pytest.exit(f"{env_name} presente pero no pudo parsearse a un dict de headers válido.")
        setattr(builtins, env_name, parsed)
    else:
        # Si no está definida la env var, exponemos un dict vacío y avisamos por stderr.
        # Esto permite correr tests localmente sin el secret (pero muy probablemente los endpoints devolverán 401/403).
        setattr(builtins, env_name, {})
        print(f"Warning: {env_name} no definida — usando dict vacío. Añade el secret en CI para tests reales.", file=sys.stderr)
