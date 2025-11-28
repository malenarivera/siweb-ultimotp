from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import date, datetime
from typing import Union

class Genero(Enum):
    MUJER = "mujer"
    HOMBRE = "hombre"
    OTRO = "otro"

class PacienteCrear(BaseModel):
    dni: str
    nombre: str
    apellido: str
    genero: Genero
    obra_social: str | None = None
    fecha_nacimiento: date | None = None
    fecha_ingreso: date | None = None
    domicilio: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None

class PacienteCreado(BaseModel):
    id_usuario: int

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

class UnPacienteUsuario(BaseModel):
    id_usuario: int
    dni: str
    nombre: str
    apellido: str
    genero: Genero
    obra_social: str | None = None
    fecha_nacimiento: date | None = None
    fecha_ingreso: date | None = None
    domicilio: str | None = None
    email: str | None = None
    telefono: str | None = None
    foto_url: str | None = None
    alta: Alta
    baja: Baja | None = None
    edicion: Edicion | None = None

class UnPaciente(BaseModel):
    id_usuario: int
    dni: str
    nombre: str
    apellido: str
    genero: Genero
    obra_social: str | None = None
    fecha_nacimiento: date | None = None
    fecha_ingreso: date | None = None
    domicilio: str | None = None

class ResultadoBusqueda(BaseModel):
    pacientes: list[UnPaciente]
    total: int
    limit: int

class PacienteEditar(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    genero: Union[Genero, None] = None
    obra_social: str | None = None
    fecha_nacimiento: date | None = None
    fecha_ingreso: date | None = None
    domicilio: str | None = None
    email: str | None = None
    telefono: str | None = None

class PacienteBaja(BaseModel):
    motivo: str
