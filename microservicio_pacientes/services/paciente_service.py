from models.paciente import Paciente
from schemas.paciente_schema import PacienteCrear, PacienteCreado, PacienteEditar, UnPaciente, PacienteBaja, Genero
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
import httpx
from datetime import date
from fastapi import HTTPException
from core.auth import get_token

class PacienteService:
    @staticmethod
    async def set_foto_url(id_usuario: int, foto_url: str, db: AsyncSession):
        result = await db.execute(select(Paciente).where(Paciente.id_usuario == id_usuario))
        paciente = result.scalar_one_or_none()
        if paciente is None:
            return None
        paciente.foto_url = foto_url
        await db.commit()
        await db.refresh(paciente)
        return paciente.foto_url

    @staticmethod
    async def get_foto_url(id_usuario: int, db: AsyncSession):
        result = await db.execute(select(Paciente).where(Paciente.id_usuario == id_usuario))
        paciente = result.scalar_one_or_none()
        if paciente is None:
            return None
        return paciente.foto_url

    @staticmethod
    async def delete_foto_url(id_usuario: int, db: AsyncSession):
        result = await db.execute(select(Paciente).where(Paciente.id_usuario == id_usuario))
        paciente = result.scalar_one_or_none()
        if paciente is None:
            return None
        paciente.foto_url = None
        await db.commit()
        await db.refresh(paciente)
        return True
    
    @staticmethod
    #async
    async def crear_usuario(nombre: str, apellido: str, telefono: str, email:str, sembrado: bool = False) -> int:
        input = {
            "nombre": nombre,
            "apellido": apellido,
            "telefono": telefono,
            "email": email,
            "sembrado": sembrado
        }
        print(f'voy a usuarios con el token: {get_token()}')
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {get_token()}"}
            response = await client.post('http://usuarios:8003/personal/usuario_base', json=input, headers=headers) 
            if response.status_code != 201:
                raise ValueError(response.json()['detail'])
            r = response.json()
            return r['id_usuario']

    @staticmethod
    async def crear_paciente(input: PacienteCrear, db: AsyncSession, sembrado: bool = False) -> PacienteCreado:
        # Convertir los datos del schema, convirtiendo el Enum a string
        datos = input.dict()
        # Nos hablamos con el MS de usuarios para crearlo y vincular el ID
        id_usuario = await PacienteService.crear_usuario(nombre=datos['nombre'], apellido=datos['apellido'], telefono=datos['telefono'], email=datos['email'], sembrado=sembrado)
        # Datos propios de paciente
        datos.pop("telefono")
        datos.pop("email")
        datos['genero'] = datos['genero'].value  # Convertir Enum a string
        paciente = Paciente(**datos, id_usuario = id_usuario)
        db.add(paciente)
        await db.commit()
        await db.refresh(paciente)
        return PacienteCreado(id_usuario=paciente.id_usuario)

    @staticmethod
    async def actualizar_datos_paciente_usuario(id_usuario: int, email: str | None, telefono: str | None):
        input = {
            "telefono": telefono,
            "email": email
        }
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {get_token()}"}
            response = await client.patch(f'http://usuarios:8003/personal/usuario_base/{id_usuario}', headers=headers, json=input) 
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=response.json()['detail'])
            r = response.json()
            return r

    @staticmethod
    async def update_paciente(id_usuario: int, input: PacienteEditar, db: AsyncSession):
        result = await db.execute(select(Paciente).where(Paciente.id_usuario == id_usuario))
        paciente = result.scalar_one_or_none()
        if paciente is None:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        # Primero realizamos los cambios en usuario
        datos_paciente = input.dict()
        email = datos_paciente.pop("email")
        telefono = datos_paciente.pop("telefono")
        datos_usuario = await PacienteService.actualizar_datos_paciente_usuario(id_usuario, email, telefono)
        # Actualizar los campos del paciente
        for field, value in input.dict().items():
            if value is not None:
                if field == 'genero':
                    value = value.value  # Convertir Enum a string
                setattr(paciente, field, value)
        await db.commit()
        await db.refresh(paciente)
        return {**(paciente.__dict__), **datos_usuario}

    @staticmethod
    async def delete_paciente(id_usuario: int, input: PacienteBaja, db: AsyncSession):
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {get_token()}"}
            response = await client.request('DELETE', f'http://usuarios:8003/personal/usuario_base/{id_usuario}', headers=headers, json={"motivo": input.motivo}) 
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=response.json()['detail'])
            r = response.json()
            return r


    @staticmethod
    async def get_paciente_por_dni(dni: str, db: AsyncSession):
        result = await db.execute(select(Paciente).where(Paciente.dni == dni))
        paciente = result.scalar_one_or_none()
        return paciente

    @staticmethod
    async def buscar_datos_usuario_paciente(id_usuario: int):
        # Volver
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {get_token()}"}
            response = await client.get(f'http://usuarios:8003/personal/usuario_base/{id_usuario}', headers=headers) 
            if response.status_code != 200:
                raise ValueError(response.json()['detail'])
            r = response.json()
            return r

    @staticmethod
    async def get_paciente_por_id(id_usuario: int, db: AsyncSession):
        result = await db.execute(select(Paciente).where(Paciente.id_usuario == id_usuario))
        paciente = result.scalar_one_or_none()
        if paciente is None:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        # Ahora buscamos los datos del usuario
        usuario = await PacienteService.buscar_datos_usuario_paciente(id_usuario)
        #dato_paciente = dict(paciente)['Paciente']
        return {**paciente.__dict__, **usuario}

    @staticmethod
    async def buscar_pacientes(
        db: AsyncSession,
        #nombre: str | None = None,
        #apellido: str | None = None,
        nom_ap_dni: str | None = None,
        anio_ingreso_desde: int | None = None,
        anio_ingreso_hasta: int | None = None,
        genero: Genero | None = None,
        limit: int = 20,
        page: int = 1,
        order: str = "asc",
        sort: str | None = None,
    ):
        from sqlalchemy import and_, or_, func, cast, Integer, asc, desc
        # Clamp limit to [1,20]
        if limit is None or limit <= 0:
            limit = 20
        elif limit > 20:
            limit = 20
        if page < 1:
            page = 1
        offset = (page - 1) * limit
        query = select(Paciente)
        count = select(func.count()).select_from(Paciente)
        conditions = []
        condiciones_datos_basicos = []
        #if nombre:
        #    nombre = nombre.strip()
        #    if nombre:
        #        conditions.append(Paciente.nombre.ilike(f"%{nombre}%"))
        #if apellido:
        #    apellido = apellido.strip()
        #    if apellido:
        #        conditions.append(Paciente.apellido.ilike(f"%{apellido}%"))
        if nom_ap_dni:
             datos_basicos_persona = nom_ap_dni.split()
             for dato in datos_basicos_persona:
                condiciones_datos_basicos.append(Paciente.nombre.ilike(f"%{dato}%"))
                condiciones_datos_basicos.append(Paciente.apellido.ilike(f"%{dato}%"))
                condiciones_datos_basicos.append(Paciente.dni.ilike(f"%{dato}%"))
        if anio_ingreso_desde:
            conditions.append(cast(func.extract('year', Paciente.fecha_ingreso), Integer) >= anio_ingreso_desde)
        if anio_ingreso_hasta:
            conditions.append(cast(func.extract('year', Paciente.fecha_ingreso), Integer) <= anio_ingreso_hasta)
        if genero:
            genero = genero.value
            conditions.append(Paciente.genero == genero)
        if condiciones_datos_basicos:
            query = query.where(or_(*condiciones_datos_basicos).self_group())
            count = count.where(or_(*condiciones_datos_basicos).self_group())
        if conditions:
            query = query.where(and_(*conditions))
            count = count.where(and_(*conditions))
        total = await db.scalar(count)
        # Mapear sort a columnas reales (nombres en español)
        sort_map = {
            'nombre': Paciente.nombre,
            'apellido': Paciente.apellido,
            'fecha_ingreso': Paciente.fecha_ingreso,
            #'fecha_nacimiento': Paciente.fecha_nacimiento,
        }
        sort_col = sort_map.get(sort, Paciente.apellido)
        if order == "asc":
            query = query.order_by(asc(sort_col))
        else:
            query = query.order_by(desc(sort_col))
        query = query.offset(offset).limit(limit)
        result = await db.execute(query)
        return {"pacientes": result.scalars().all(), "total": total}

    @staticmethod
    async def refresh(db: AsyncSession):
        # Elimino de la BD
        stmt = delete(Paciente).where(Paciente.id_usuario > 10)
        result = await db.execute(stmt)
        await db.commit()
        return {"resultado": "ok"}