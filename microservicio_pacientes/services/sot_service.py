from models.sot import Sot
from schemas.sot_schema import SotCrear, SotLeida, SotActualizar, SotCompleta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from models.paciente import Paciente
from datetime import datetime
from services.evolucion_service import EvolucionService
from fastapi import HTTPException

class SotService:

    @staticmethod
    async def listar_sots(
        id_usuario: int,
        db: AsyncSession,
        limit: int = 20,
        page: int = 1,
        from_date: datetime = None,
        to_date: datetime = None,
        order: str = "desc"
    ) -> list[SotCompleta]:
        from sqlalchemy import and_, desc, asc
        query = select(Sot).where(Sot.id_usuario_paciente == id_usuario)
        if from_date:
            query = query.where(Sot.fecha_creacion >= from_date)
        if to_date:
            query = query.where(Sot.fecha_creacion <= to_date)
        sort_column = Sot.fecha_creacion
        query = query.order_by(asc(sort_column) if order == "asc" else desc(sort_column))
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        result = await db.execute(query)
        sots = result.scalars().all()
        lista_sots = []
        profesionales_bd = {}
        for s in sots:
            if s.creado_por not in profesionales_bd:
                profesionales_bd[s.creado_por] = await EvolucionService.buscar_datos_basicos_usuario(s.creado_por)
            datos_creacion = {
                "nombre": profesionales_bd[s.creado_por]['nombre_completo'],
                "id_usuario": profesionales_bd[s.creado_por]['id_usuario'],
                "fecha": s.fecha_creacion
            }

            if s.modificado:
                if s.modificado_por not in profesionales_bd:
                    profesionales_bd[s.modificado_por] = await EvolucionService.buscar_datos_basicos_usuario(s.modificado_por)
                datos_modificacion = {
                    "nombre": profesionales_bd[s.modificado_por]['nombre_completo'],
                    "id_usuario": profesionales_bd[s.modificado_por]['id_usuario'],
                    "fecha": s.fecha_modificacion,
                    "motivo": s.motivo_modificado
                }
            else:
                datos_modificacion = None

            sot = {
                **s.__dict__,
                "creacion": datos_creacion,
                "modificacion": datos_modificacion
            }
            lista_sots.append(SotCompleta(**sot))
        return lista_sots

    @staticmethod
    async def crear_sot(id_usuario: int, sot_data: SotCrear, db: AsyncSession, idDuenio: int | str = 1) -> Sot:
        # Verificar que el paciente existe
        result = await db.execute(select(Paciente).where(Paciente.id_usuario == id_usuario))
        paciente = result.scalar_one_or_none()
        if not paciente:
            raise NoResultFound(f"Paciente no encontrado")
        nuevo_sot = Sot(**sot_data.model_dump(), id_usuario_paciente = id_usuario, creado_por=idDuenio, fecha_creacion=datetime.utcnow())
        db.add(nuevo_sot)
        await db.commit()
        await db.refresh(nuevo_sot)
        return nuevo_sot

    @staticmethod
    async def actualizar_sot(id_usuario: int, id_sot: int, sot_data: SotActualizar, db: AsyncSession, idDuenio: int | str = 1) -> Sot:
        result = await db.execute(select(Sot).where(Sot.id_sot == id_sot, Sot.id_usuario_paciente == id_usuario))
        sot = result.scalar_one_or_none()
        if not sot:
            raise HTTPException(status_code=404, detail='No se encontró una SOT con los parametros indicados')
        if idDuenio != sot.creado_por:
            raise HTTPException(status_code=403, detail='Solo el creador de la SOT puede modificarla')
        for field, value in sot_data.dict().items():
            if value is not None:
                setattr(sot, field, value)
        sot.modificado_por = idDuenio
        sot.fecha_modificacion = datetime.utcnow()
        sot.modificado = True
        await db.commit()
        await db.refresh(sot)
        return sot
