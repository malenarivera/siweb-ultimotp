from pydantic import BaseModel, Field

class ItemDMBase(BaseModel):
    id_item: str
    eje: int = Field(ge=1, le=5)
    descripcion: str

class ItemDMCrear(ItemDMBase):
    pass

class ItemDMLeida(ItemDMBase):
    class Config:
        from_attributes = True
