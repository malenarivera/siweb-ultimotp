from models.egreso_medicamento import Egreso_Medicamento
from models.medicamento import Medicamento
from models.recetas import Receta
from schemas.egreso_medicamento_schema import EgresoMedicamentoCrear, EgresoMedicamentoCreado, EgresoMedicamentoLeer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import httpx
from core.auth import get_token

class EgresoMedicamentoService:
    @staticmethod
    async def buscar_datos_paciente(id_paciente: int):
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {get_token()}"}
            response = await client.get(f'http://pacientes:8000/pacientes/{id_paciente}', headers=headers)
            if response.status_code != 200:
                raise ValueError(response.json()['detail'])
            r = response.json()
            return r

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
    async def registrar_egreso_medicamento(input: EgresoMedicamentoCrear, db: AsyncSession, id_profesional: int) -> EgresoMedicamentoCreado:
        # Verificar que el paciente existe (si se proporciona)
        if input.id_paciente is not None:
            try:
                await EgresoMedicamentoService.buscar_datos_paciente(input.id_paciente)
            except ValueError as e:
                raise ValueError(f"El paciente con id {input.id_paciente} no existe")
        
        # Verificar que el profesional existe
        try:
            await EgresoMedicamentoService.buscar_datos_profesional(id_profesional)
        except ValueError as e:
            raise ValueError(f"El profesional con id {id_profesional} no existe")
        
        # Verificar que el medicamento existe
        result = await db.execute(select(Medicamento).where(Medicamento.id_medicamento == input.id_medicamento))
        medicamento = result.scalar_one_or_none()
        if medicamento is None:
            raise ValueError(f"El medicamento con id {input.id_medicamento} no existe")
        
        # Verificar que hay suficiente stock
        if medicamento.stock < input.cantidad:
            raise ValueError(f"Stock insuficiente. Stock disponible: {medicamento.stock}, cantidad solicitada: {input.cantidad}")
        
        # Verificar que la receta existe si se proporciona un id_receta
        if input.id_receta is not None:
            result = await db.execute(select(Receta).where(Receta.id_receta == input.id_receta))
            receta = result.scalar_one_or_none()
            if receta is None:
                raise ValueError(f"La receta con id {input.id_receta} no existe")
        
        # Registrar el egreso
        egreso_medicamento_data = input.dict()
        egreso_medicamento_data["id_profesional"] = id_profesional
        egreso_medicamento = Egreso_Medicamento(**egreso_medicamento_data)
        db.add(egreso_medicamento)
        
        # Actualizar el stock del medicamento (restar la cantidad egresada)
        medicamento.stock -= input.cantidad
        
        await db.commit()
        await db.refresh(egreso_medicamento)
        return EgresoMedicamentoCreado.from_orm(egreso_medicamento)


