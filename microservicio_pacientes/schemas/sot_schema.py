from pydantic import BaseModel
from datetime import date, time, datetime

class SotBase(BaseModel):
    motivo: str
    id_usuario_paciente: int
    fecha: date
    hora: time
    observacion: str

class SotActualizar(BaseModel):
    motivo: str | None = None
    observacion: str | None = None
    fecha: date | None = None
    hora: time | None = None
    motivo_modificado: str

class SotCrear(BaseModel):
    motivo: str
    fecha: date
    hora: time
    observacion: str

class SotLeida(SotBase):
    id_sot: int
    creado_por: int
    fecha_creacion: datetime
    id_usuario_paciente: int
    motivo_modificado: str | None = None
    modificado_por: int | None = None
    fecha_modificacion: datetime | None = None
    modificado: bool = False

    class Config:
        from_attributes = True

class DatosCreacion(BaseModel):
    nombre: str # nombre de la persona que la creo
    id_usuario: int
    fecha: datetime

class DatosModificacion(BaseModel):
    nombre: str
    id_usuario: int
    fecha: datetime
    motivo: str

class SotCompleta(SotBase):
    id_sot: int
    id_usuario_paciente: int
    motivo: str
    observacion: str
    fecha: date
    hora: time
    creacion: DatosCreacion
    modificacion: DatosModificacion | None = None
