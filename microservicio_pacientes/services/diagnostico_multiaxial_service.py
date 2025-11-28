from models.diagnostico_multiaxial import DiagnosticoMultiaxial
from models.item_dm import ItemDM
from schemas.diagnostico_multiaxial_schema import DiagnosticoMultiaxialCrear, DiagnosticoMultiaxialLeida
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

class DiagnosticoMultiaxialService:
    @staticmethod
    async def listar_diagnosticos(db: AsyncSession):
        result = await db.execute(select(DiagnosticoMultiaxial))
        diagnosticos = result.scalars().all()
        return [DiagnosticoMultiaxialLeida.from_orm(d) for d in diagnosticos]
    
    @staticmethod
    async def crear_diagnostico(input: DiagnosticoMultiaxialCrear, db: AsyncSession):
        # Validar que cada id_item existe y corresponde al eje correcto
        items_ids = [
            (input.id_item1, 1),
            (input.id_item2, 2),
            (input.id_item3, 3),
            (input.id_item4, 4),
            (input.id_item5, 5)
        ]
        
        for id_item, eje_esperado in items_ids:
            result = await db.execute(select(ItemDM).where(ItemDM.id_item == id_item))
            item = result.scalar_one_or_none()
            
            if not item:
                raise ValueError(f"El item '{id_item}' no existe en la base de datos")
            
            if item.eje != eje_esperado:
                raise ValueError(f"El item '{id_item}' pertenece al eje {item.eje}, pero se esperaba el eje {eje_esperado}")
        
        diagnostico = DiagnosticoMultiaxial(
            **input.model_dump(),
            fecha_creacion=datetime.utcnow()
        )
        db.add(diagnostico)
        await db.commit()
        await db.refresh(diagnostico)
        # return DiagnosticoMultiaxialLeida.from_orm(diagnostico)
        #devolvemos el id
        return diagnostico.id_diagnostico_multiaxial