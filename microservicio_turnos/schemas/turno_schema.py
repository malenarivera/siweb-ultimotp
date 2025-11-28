from pydantic import BaseModel, Field, model_validator
from datetime import datetime, time, date, timedelta
from fastapi import HTTPException
from enum import Enum
import locale

class EstadosTurno(Enum):
    PENDIENTE = "pendiente"
    ATENDIDO = "atendido"
    REPROGRAMADO = "reprogramado"
    CANCELADO = "cancelado"
    AUSENTE = "paciente ausente"

class MetodosNotificacion(Enum):
    TELEFONO = "telefono"
    MAIL = "mail"

class UnTurno(BaseModel):
    id: str
    idAgenda: str
    fechaReserva: date
    hora: time
    idPaciente: str
    duracion: int
    idUsuario: str # carga
    fecha: datetime
    estadoActual: Estado
    estadoAnterior: Estado | None = None
    recordatorios: list[Recordatorio] = []
    model_config = {
        "json_schema_extra": {
            "example": {
                "idAgenda": "32f9457f3b6b2f179e506c55",
                "fechaReserva": "2025-10-22",
                "hora": "09:30",
                "idPaciente": "1",
                "duracion": 30,
                "idUsuario": "1",
                "fecha": datetime.now(),
                "estadoActual": "pendiente",
                "estadoAnterior": None,
                "recordatorios": []
            }
        }
    }

class Estado(BaseModel):
    estado: EstadosTurno
    idUsuario: str # carga
    fecha: datetime = datetime.now()# carga

class CrearEstado(BaseModel):
    estado: EstadosTurno
    model_config = {
        "json_schema_extra": {
            "example": {
            "estado": "atendido"
            }
        }
    }

class Recordatorio(BaseModel):
    idUsuarioRecibe: str
    fecha: date
    hora: str
    metodo: list[MetodosNotificacion] = Field(..., max_items=2, min_items=1)
    activo: bool = True

class CargarRecordatorio(BaseModel):
    fecha: date
    hora: time
    metodo: list[MetodosNotificacion] = [Field(..., max_items=2, min_items=1)]
    @model_validator(mode='after')
    def validar_fecha(self):
        if self.fecha < date.today():
            raise HTTPException(
                status_code=422,
                detail="No se puede crear un recordatoria en una fecha del pasado"
            )
        return self
        model_config = {
            "json_schema_extra": {
                "example": {
                    "fecha": "2025-01-01",
                    "hora": "10:00",
                    "metodo": ["mail"]
                }
            }
        }


class TurnoCreado(BaseModel):
    id: str 
    model_config = {
        "json_schema_extra": {
            "example": {
            "id": "32f9457f3b6b2f179e506c55"
            }
        }
    }

class CrearTurno(BaseModel):
    idProfesional: str
    fechaReserva: date
    hora: time
    idPaciente: str
    duracion: int | None = Field(None, ge=15)
    @model_validator(mode='after')
    def validar_fecha(self):
        if self.fechaReserva < date.today():
            raise HTTPException(
                status_code=422,
                detail="No se puede sacar un turno en una fecha del pasado"
            )
        if datetime.combine(self.fechaReserva, self.hora) < (datetime.now() + timedelta(minutes=60)):
            raise HTTPException(
                status_code=422,
                detail="El turno debe sacarse con al menos una hora de anticipacion"
            )
        return self
    model_config = {
        "json_schema_extra": {
            "example": {
               "idProfesional": "2",
               "fechaReserva": "2025-11-03",
               "hora": "13:15",
               "idPaciente": "14",
               "duracion": 45
            }
        }
    }

        