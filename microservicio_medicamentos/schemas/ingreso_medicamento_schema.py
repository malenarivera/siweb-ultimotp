# app/schemas/ingreso_medicamento_schema.py
from pydantic import BaseModel
from datetime import datetime

class IngresoMedicamentoCrear(BaseModel):
    id_medicamento: int
    id_paciente: int
    id_profesional: int
    cantidad: int
    motivo: str

class IngresoMedicamentoCreado(BaseModel):
    id_ingreso: int
    id_medicamento: int
    id_paciente: int
    id_profesional: int
    cantidad: int
    motivo: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True  # Enables reading from ORM objects

class IngresoMedicamentoLeer(BaseModel):
    id_ingreso: int
    id_medicamento: int
    id_paciente: int
    id_profesional: int
    cantidad: int
    motivo: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True
