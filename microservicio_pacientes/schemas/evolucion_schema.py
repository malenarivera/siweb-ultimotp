from pydantic import BaseModel, Field, validator
from enum import Enum
from datetime import datetime
from schemas.diagnostico_multiaxial_schema import DiagnosticoMultiaxialCompleto


class TipoEvolucion(str, Enum):
    INDIVIDUAL = "individual"
    GRUPAL = "grupal"

class EvolucionBase(BaseModel):
    observacion: str
    id_turno: int | None = None
    tipo: TipoEvolucion
    creada_por: int

class EvolucionCrear(BaseModel):
    observacion: str
    id_turno: int | None = None
    id_item1: str | None = None
    id_item2: str | None = None
    id_item3: str | None = None
    id_item4: str | None = None
    id_item5: str | None = None


class EvolucionLeida(EvolucionBase):
    id_evolucion: int
    id_usuario: int
    fecha_creacion: datetime
    marcada_erronea: bool | None = False
    motivo_erronea: str | None = None
    marcada_erronea_por: int | None = None
    id_diagnostico_multiaxial: int | None = None

    class Config:
        from_attributes = True

class DatosCreacion(BaseModel):
    nombre: str # nombre de la persona que la creo
    id_usuario: int
    fecha: datetime

class DatosErronea(BaseModel):
    nombre: str # nombre de la persona que la marco como erronea
    id_usuario: int
    fecha: datetime
    motivo: str

class EvolucionCompleta(BaseModel):
    # Con datos listos para usar en el front
    id_usuario: int
    id_evolucion: int
    tipo: TipoEvolucion
    observacion: str
    id_turno: int | None = None
    diagnostico: DiagnosticoMultiaxialCompleto | None
    creacion: DatosCreacion
    erronea: DatosErronea | None = None

class EvolucionMarcarErronea(BaseModel):
    motivo_erronea: str | None = None
    # marcada_erronea_por: int Lo llena el backend segun el usuario logueado


class EvolucionGrupalCrear(BaseModel):
    ids_usuario: list[int] = Field(min_items=2)
    observacion: str

    @validator("ids_usuario")
    def validar_minimos(cls, v):
        if not isinstance(v, list) or len(v) < 2:
            raise ValueError("ids_usuario debe contener al menos 2 IDs")
        return v


class EvolucionGrupalFallida(BaseModel):
    id_usuario: int
    motivo: str


class EvolucionGrupalRespuesta(BaseModel):
    creadas: list[EvolucionLeida]
    fallidas: list[EvolucionGrupalFallida]