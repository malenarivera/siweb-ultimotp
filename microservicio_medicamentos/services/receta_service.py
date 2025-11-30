from models.recetas import Receta
from models.medicamento import Medicamento
from schemas.receta_schema import RecetaCrear, RecetaCreada, RecetaLeer, EstadoReceta, EstadoRecetaActualizar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import httpx
from core.auth import get_token

class RecetaService:
    @staticmethod
    async def buscar_datos_profesional(id_profesional: int):
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {get_token()}"}
            response = await client.get(f'http://usuarios:8003/personal/{id_profesional}', headers=headers)
            if response.status_code != 200:
                raise ValueError(response.json()['detail'])
            r = response.json()
            return r

    @staticmethod
    async def crear_receta(input: RecetaCrear, db: AsyncSession) -> RecetaCreada:
        # Verificar que el profesional existe
        try:
            await RecetaService.buscar_datos_profesional(input.id_profesional)
        except ValueError as e:
            raise ValueError(f"El profesional con id {input.id_profesional} no existe")
        
        # Verificar que el medicamento existe
        result = await db.execute(select(Medicamento).where(Medicamento.id_medicamento == input.id_medicamento))
        medicamento = result.scalar_one_or_none()
        if medicamento is None:
            raise ValueError(f"El medicamento con id {input.id_medicamento} no existe")
        
        receta_data = input.dict()
        receta_data['estado'] = EstadoReceta.ASIGNADA.value  # Estado por defecto
        receta = Receta(**receta_data)
        db.add(receta)
        await db.commit()
        await db.refresh(receta)
        return RecetaCreada.from_orm(receta)

    @staticmethod
    async def buscarReceta_por_profesional(
        id_profesional: int,
        cantidad_a_traer: int,
        db: AsyncSession,
        estado: str | None = None
    ):
        query = select(Receta).where(Receta.id_profesional == id_profesional)
        # Filtro opcional por estado
        if estado:
            query = query.where(Receta.estado == estado)
        # Limitar la cantidad de resultados
        query = query.limit(cantidad_a_traer)
        result = await db.execute(query)
        recetas = result.scalars().all()
        # Convertir a schemas
        return [RecetaLeer.from_orm(r) for r in recetas]

    @staticmethod
    async def actualizar_estado_receta(id_receta: int, estado: EstadoReceta, db: AsyncSession) -> RecetaLeer | None:
        result = await db.execute(select(Receta).where(Receta.id_receta == id_receta))
        receta = result.scalar_one_or_none()
        if receta is None:
            return None
        receta.estado = estado.value
        await db.commit()
        await db.refresh(receta)
        return RecetaLeer.from_orm(receta)