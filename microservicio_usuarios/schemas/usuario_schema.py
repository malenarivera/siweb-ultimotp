from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Annotated, Literal
from datetime import datetime


class CargarUsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr | None = None
    telefono: str | None = None
    sembrado: bool = False
    rol: str = "Paciente"

class EditarUsuarioBase(BaseModel):
    email: EmailStr | Literal[""] | None = None
    telefono: Annotated[str, StringConstraints(strip_whitespace=True, min_length=8, max_length=20)] | Literal[""] | None = None

class DesactivarUsuarioBase(BaseModel):
    motivo: str

class UnUsuario(BaseModel):
    id_usuario: int
    email: EmailStr | None = None
    telefono: str | None = None
    foto_url: str | None = None
    alta: Alta
    baja: Baja | None = None
    edicion: Edicion | None = None

class Alta(BaseModel):
    fecha: datetime
    id_usuario: int | None = None
     
class Baja(BaseModel):
    fecha: datetime | None = None
    id_usuario: int | None = None
    motivo: str | None = None

class Edicion(BaseModel):
    fecha: datetime | None = None
    id_usuario: int | None = None

