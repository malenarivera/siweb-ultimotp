from models.ingreso_medicamento import Ingreso_Medicamento
from models.medicamento import Medicamento
from models.recetas import Receta
from schemas.ingreso_medicamento_schema import IngresoMedicamentoCrear, IngresoMedicamentoCreado, IngresoMedicamentoLeer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx
from core.auth import get_token

class IngresoMedicamentoService:
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
    async def registrar_ingreso_medicamento(input: IngresoMedicamentoCrear, db: AsyncSession, id_profesional: int) -> IngresoMedicamentoCreado:
        try:
            await IngresoMedicamentoService.buscar_datos_paciente(input.id_paciente)
        except ValueError as e:
            raise ValueError(f"El paciente con id {input.id_paciente} no existe")
        
        try:
            await IngresoMedicamentoService.buscar_datos_profesional(id_profesional)
        except ValueError as e:
            raise ValueError(f"El profesional con id {id_profesional} no existe")
        
        # Verificar que el medicamento existe
        result = await db.execute(select(Medicamento).where(Medicamento.id_medicamento == input.id_medicamento))
        medicamento = result.scalar_one_or_none()
        if medicamento is None:
            raise ValueError(f"El medicamento con id {input.id_medicamento} no existe")
        
        # Registrar el ingreso
        ingreso_medicamento_data = input.dict()
        ingreso_medicamento_data["id_profesional"] = id_profesional
        ingreso_medicamento = Ingreso_Medicamento(**ingreso_medicamento_data)
        db.add(ingreso_medicamento)
        
        # Actualizar el stock del medicamento (sumar la cantidad ingresada)
        medicamento.stock += input.cantidad
        
        await db.commit()
        await db.refresh(ingreso_medicamento)
        return IngresoMedicamentoCreado.from_orm(ingreso_medicamento)

        


