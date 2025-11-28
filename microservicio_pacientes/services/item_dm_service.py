from models.item_dm import ItemDM
from schemas.item_dm_schema import ItemDMLeida
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

class ItemDMService:
    @staticmethod
    async def listar_items(db: AsyncSession):
        result = await db.execute(select(ItemDM))
        items = result.scalars().all()
        return [ItemDMLeida.from_orm(item) for item in items]
