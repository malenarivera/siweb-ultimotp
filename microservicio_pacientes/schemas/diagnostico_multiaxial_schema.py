from pydantic import BaseModel
from datetime import datetime
from schemas.item_dm_schema import ItemDMBase

class DiagnosticoMultiaxialBase(BaseModel):
    id_item1: str
    id_item2: str
    id_item3: str
    id_item4: str
    id_item5: str

class DiagnosticoMultiaxialCrear(DiagnosticoMultiaxialBase):
    creado_por: int

class DiagnosticoMultiaxialLeida(DiagnosticoMultiaxialBase):
    id_diagnostico_multiaxial: int
    creado_por: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class DatosCreacion(BaseModel):
    nombre: str # nombre de la persona que la creo
    id_usuario: int
    fecha: datetime

class DiagnosticoMultiaxialCompleto(BaseModel):
    # Con datos listos para usar en el front
    id_diagnostico_multiaxial: int
    creacion: DatosCreacion
    item_1: ItemDMBase
    item_2: ItemDMBase
    item_3: ItemDMBase
    item_4: ItemDMBase
    item_5: ItemDMBase


