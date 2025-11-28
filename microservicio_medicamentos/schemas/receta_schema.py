# app/schemas/receta_schema.py
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class EstadoReceta(str, Enum):
    ASIGNADA = "Asignada"
    MEDICAMENTO_INGRESADO = "Medicamento ingresado"
    MEDICAMENTO_ENTREGADO = "Medicamento entregado"

class RecetaCrear(BaseModel):
    id_evolucion: int
    id_medicamento: int
    id_profesional: int
    observaciones: str

class RecetaCreada(BaseModel):
    id_receta: int
    id_evolucion: int
    id_medicamento: int
    id_profesional: int
    estado: EstadoReceta
    observaciones: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class RecetaLeer(BaseModel):
    id_receta: int
    id_evolucion: int
    id_medicamento: int
    id_profesional: int
    estado: EstadoReceta
    observaciones: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class EstadoRecetaActualizar(BaseModel):
    estado: EstadoReceta   