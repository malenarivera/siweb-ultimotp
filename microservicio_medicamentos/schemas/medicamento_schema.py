# app/schemas/medicamento_schema.py
from pydantic import BaseModel
from datetime import datetime

class MedicamentoCrear(BaseModel):
    laboratorio_titular: str | None = None
    nombre_comercial: str
    nombre_generico: str
    concentracion: str
    forma_farmaceutica: str
    presentacion: str
    stock: int = 0

class MedicamentoCreado(BaseModel):
    id_medicamento: int
    laboratorio_titular: str | None = None
    nombre_comercial: str
    nombre_generico: str
    concentracion: str
    forma_farmaceutica: str
    presentacion: str
    stock: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True  # Enables reading from ORM objects

class MedicamentoLeer(BaseModel):
    id_medicamento: int
    laboratorio_titular: str | None = None
    nombre_comercial: str
    nombre_generico: str
    concentracion: str
    forma_farmaceutica: str
    presentacion: str
    stock: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class MedicamentoBuscar(BaseModel):
    laboratorio_titular: str | None = None
    nombre_comercial: str | None = None
    nombre_generico: str | None = None
    nomCom_NomGene: str | None = None
    concentracion: str | None = None
    forma_farmaceutica: str | None = None
    presentacion: str | None = None

class ResultadoBusquedaMedicamentos(BaseModel):
    medicamentos: list[MedicamentoLeer]
    total: int
    limit: int
