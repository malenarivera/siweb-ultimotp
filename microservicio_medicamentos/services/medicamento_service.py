import stat
from models.medicamento import Medicamento
from models.recetas import Receta
from schemas.medicamento_schema import MedicamentoCrear, MedicamentoCreado, MedicamentoLeer, MedicamentoBuscar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from datetime import datetime

class MedicamentoService:
    @staticmethod
    async def crear_medicamento(input: MedicamentoCrear, db: AsyncSession) -> MedicamentoCreado:
        medicamento_data = input.dict()
        medicamento = Medicamento(**medicamento_data)
        db.add(medicamento)
        await db.commit()
        await db.refresh(medicamento)
        return MedicamentoCreado.from_orm(medicamento)

    @staticmethod
    async def obtener_medicamentos(db: AsyncSession) -> list[MedicamentoLeer]:
        result = await db.execute(select(Medicamento))
        medicamentos = result.scalars().all()
        return [MedicamentoLeer.from_orm(medicamento) for medicamento in medicamentos]

    @staticmethod
    async def buscar_medicamentos(filtros: MedicamentoBuscar, db: AsyncSession):
        from sqlalchemy import func
        query = select(Medicamento)
        count = select(func.count()).select_from(Medicamento)
        condiciones = []
        condiciones_nomCom_NomGene = []
        
        # Aplicar filtros solo si se proporcionan valores
        if filtros.laboratorio_titular is not None:
            condiciones.append(Medicamento.laboratorio_titular.ilike(f"%{filtros.laboratorio_titular}%"))
        if filtros.nombre_comercial is not None:
            condiciones.append(Medicamento.nombre_comercial.ilike(f"%{filtros.nombre_comercial}%"))
        if filtros.nombre_generico is not None:
            condiciones.append(Medicamento.nombre_generico.ilike(f"%{filtros.nombre_generico}%"))
        if filtros.nomCom_NomGene:
            datos_medicamento = filtros.nomCom_NomGene.split()
            for dato in datos_medicamento:
                condiciones_nomCom_NomGene.append(Medicamento.nombre_comercial.ilike(f"%{dato}%"))
                condiciones_nomCom_NomGene.append(Medicamento.nombre_generico.ilike(f"%{dato}%"))
        if filtros.concentracion is not None:
            condiciones.append(Medicamento.concentracion.ilike(f"%{filtros.concentracion}%"))
        if filtros.forma_farmaceutica is not None:
            from sqlalchemy import func
            condiciones.append(func.lower(Medicamento.forma_farmaceutica) == filtros.forma_farmaceutica.lower())
        if filtros.presentacion is not None:
            condiciones.append(Medicamento.presentacion.ilike(f"%{filtros.presentacion}%"))
        
        if condiciones_nomCom_NomGene:
            query = query.where(or_(*condiciones_nomCom_NomGene).self_group())
            count = count.where(or_(*condiciones_nomCom_NomGene).self_group())
        
        if condiciones:
            query = query.where(and_(*condiciones))
            count = count.where(and_(*condiciones))
        
        total = await db.scalar(count)
        result = await db.execute(query)
        medicamentos = result.scalars().all()
        return {"medicamentos": [MedicamentoLeer.from_orm(medicamento) for medicamento in medicamentos], "total": total}