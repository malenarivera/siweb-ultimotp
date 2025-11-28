from pydantic import BaseModel, Field, model_validator
from datetime import datetime, time, date, timedelta
from fastapi import HTTPException

class CrearAgenda(BaseModel):
    idProfesional: str
    model_config = {
        "json_schema_extra": {
            "example": {
               "idProfesional": "1"
            }
        }
    }

class AgendaCreada(BaseModel):
    id: str 
    model_config = {
        "json_schema_extra": {
            "example": {
               "id": "68f9457f3b6b2f179e506c98"
            }
        }
    }

class UnaAgenda(BaseModel):
    id: str
    idProfesional: str
    horarios: list[Horario] | None = None
    periodosCongelados: list[PeriodoCongelado] | None = None
    idUsuario: str
    fecha: datetime
    activa: bool = True
    baja: Baja | None = None
    model_config = {
        "json_schema_extra": {
            "example": {
               "id": "68f984238fbeeaeda2701afd",
               "idProfesional": "10",
               "horarios": [
                {
                    "duracionDefectoTurno": 15,
                    "fechaInicio": "2026-01-02",
                    "idUsuario": "1",
                    "fecha": "2015-10-10 09:32",
                    "dias":  [
                        {
                            "nro": 0,
                            "horaInicio": "09:00",
                            "horaFin": "13:00"
                        },
                        {
                            "nro": 2,
                            "horaInicio": "09:00",
                            "horaFin": "13:00"
                        },
                        {
                            "nro": 4,
                            "horaInicio": "09:00",
                            "horaFin": "13:00"
                        }
                    ]
                }
               ],
               "periodosCongelados": [
                {
                    "fechaInicio": "2025-12-20",
                    "fechaFin": "2026-01-01",
                    "motivo": "vacaciones",
                    "activa": True,
                    "idUsuario": 1,
                    "fecha": "2025-10-20"
                }
               ],
               "idUsuario": "1",
               "fecha": "2015-10-10 09:29",
               "activa": True,
               "baja": None
            }
        }
    }

class Horario(BaseModel):
    duracionDefectoTurno: int = Field(..., ge=15)
    fechaInicio: date | None = None
    idUsuario: str
    fecha: datetime = datetime.now()
    dias: list[Dia]

class HorarioMongo(BaseModel):
    duracionDefectoTurno: int = Field(..., ge=15)
    fechaInicio: date
    idUsuario: str
    fecha: datetime = datetime.now()
    dias: list[DiaMongo]

class CargarHorario(BaseModel):
    duracionDefectoTurno: int = Field(..., ge=15)
    fechaInicio: date
    dias: list[Dia]
    model_config = {
        "json_schema_extra": {
            "example": {
               "duracionDefectoTurno": "30",
               "fechaInicio": "2026-01-02",
               "dias": [
                {
                    "nro": 2,
                    "horaInicio": "08:00",
                    "horaFin": "18:00"
                },
                {
                    "nro": 4,
                    "horaInicio": "08:00",
                    "horaFin": "18:00"
                },
               ]
            }
        }
    }

class DiaMongo(BaseModel): # Mongo no puede recibir tipo time de python
    nro: int = Field(..., ge=0, le=6)
    horaInicio: str
    horaFin: str

class Dia(BaseModel):
    nro: int = Field(..., ge=0, le=6)
    horaInicio: time
    horaFin: time
    @model_validator(mode='after')
    def validar_horas(self) -> 'TimeRange':
        if self.horaInicio >= self.horaFin:
            raise HTTPException(
                status_code=422,
                detail=f'La hora de finalizacion de la agenda del dia {self.nro} NO puede ser menor o igual a la hora de inicio'
            )
        if (timedelta(hours=self.horaFin.hour, minutes=self.horaFin.minute) - timedelta(hours=self.horaInicio.hour, minutes=self.horaInicio.minute)) < timedelta(hours=1):
            raise HTTPException(
                status_code=422,
                detail=f'El horario de atencion del dia {self.nro} debe ser de al menos una hora'
            )
        return self

class PeriodoCongelado(BaseModel):
    fechaInicio: date
    fechaFin: date
    motivo: str
    activa: bool = True
    idUsuario: str
    fecha: datetime = datetime.now() # fecha en la que se carga del horario
    @model_validator(mode='after')
    def validar_fechas(self):
        if self.fechaInicio > self.fechaFin:
            raise HTTPException(
                status_code=422,
                detail="La fecha de finalizacion del periodo congelado NO puede ser menor a la fecha de inicio"
            )
        return self


class Congelar(BaseModel):
    fechaInicio: date
    fechaFin: date
    motivo: str
    model_config = {
        "json_schema_extra": {
            "example": {
               "fechaInicio": "2025-12-20",
               "fechaFin": "2026-01-10",
               "motivo": "vacaciones"
            }
        }
    }
    @model_validator(mode='after')
    def validar_fechas(self):
        if self.fechaInicio > self.fechaFin:
            raise HTTPException(
                status_code=422,
                detail="La fecha de finalizacion del periodo congelado NO puede ser menor a la fecha de inicio"
            )
        return self

class Baja(BaseModel):
    idUsuario: str
    fecha: datetime