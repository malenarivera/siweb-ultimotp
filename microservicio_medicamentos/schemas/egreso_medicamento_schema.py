# app/schemas/egreso_medicamento_schema.py
from pydantic import BaseModel
from datetime import datetime

class EgresoMedicamentoCrear(BaseModel):
    id_medicamento: int
    id_paciente: int | None = None
    id_receta: int | None = None
    cantidad: int
    motivo: str

class EgresoMedicamentoCreado(BaseModel):
    id_egreso: int
    id_medicamento: int
    id_paciente: int | None = None
    id_receta: int | None = None
    id_profesional: int
    cantidad: int
    motivo: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True  # Enables reading from ORM objects

class EgresoMedicamentoLeer(BaseModel):
    id_egreso: int
    id_medicamento: int
    id_paciente: int | None = None
    id_receta: int | None = None
    id_profesional: int
    cantidad: int
    motivo: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True
