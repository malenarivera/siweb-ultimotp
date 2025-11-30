from models.evolucion import Evolucion
from models.paciente import Paciente
from models.item_dm import ItemDM
from models.diagnostico_multiaxial import DiagnosticoMultiaxial
from schemas.evolucion_schema import EvolucionCrear, EvolucionLeida, EvolucionGrupalCrear, EvolucionGrupalRespuesta, EvolucionGrupalFallida, EvolucionCompleta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload 
from datetime import datetime
from fastapi import HTTPException
from core.auth import get_token
import httpx

class EvolucionService:

    @staticmethod
    async def buscar_datos_basicos_usuario(id_usuario: int):
        # Datos basicos: id, nombre completo
        # Primero verifico si es admin
        async with httpx.AsyncClient() as client:
            response = await client.get(f'http://usuarios:8003/personal/usuario_base/es_admin/{id_usuario}') 
            if response.status_code != 200:
                raise ValueError(response.json()['detail'])
            r = response.json()
            if r['admin']:
                datos = {
                    "nombre_completo": "Administrador",
                    "id_usuario": id_usuario
                }
            else:
                headers = {"Authorization": f"Bearer {get_token()}"}
                response = await client.get(f'http://usuarios:8003/personal/{id_usuario}', headers=headers) 
                if response.status_code != 200:
                    raise ValueError(response.json()['detail'])
                r = response.json()
                datos = {
                    "nombre_completo": f'{r['nombre']} {r['apellido']}',
                    "id_usuario": id_usuario
                }
            return datos

    @staticmethod
    async def listar_evoluciones(
        id_usuario: int,
        db: AsyncSession,
        limit: int = 20,
        page: int = 1,
        from_date: datetime = None,
        to_date: datetime = None,
        tipo: str = None,
        sort: str = "fecha_creacion",
        order: str = "desc"
    ) -> list[EvolucionCompleta]:
        from sqlalchemy import and_, desc, asc
        query = select(Evolucion).options(selectinload(Evolucion.diagnostico))
        query = query.where(Evolucion.id_usuario == id_usuario)
        if from_date:
            query = query.where(Evolucion.fecha_creacion >= from_date)
        if to_date:
            query = query.where(Evolucion.fecha_creacion <= to_date)
        if tipo:
            query = query.where(Evolucion.tipo == tipo)
        sort_column = Evolucion.fecha_creacion if sort == "fecha_creacion" else Evolucion.id_evolucion
        query = query.order_by(asc(sort_column) if order == "asc" else desc(sort_column))
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        result = await db.execute(query)
        evoluciones = result.scalars().all()
        lista_evoluciones = []
        items_dm_bd = {}
        profesionales_bd = {}
        for e in evoluciones:
            # Busco los usuarios involucrados en las cargas y marcadas erroenas,
            # Estos usuarios por logica del negocio si o si seran profesionales (o bien admin)
            # si los datos ya se recolectaron de la BD, no los vuelvo a buscar
            if e.creada_por not in profesionales_bd:
                profesionales_bd[e.creada_por] = await EvolucionService.buscar_datos_basicos_usuario(e.creada_por)
            datos_creacion = {
                "nombre": profesionales_bd[e.creada_por]['nombre_completo'],
                "id_usuario": profesionales_bd[e.creada_por]['id_usuario'],
                "fecha": e.fecha_creacion
            }

            if e.marcada_erronea:
                if e.marcada_erronea_por not in profesionales_bd:
                    profesionales_bd[e.marcada_erronea_por] = await EvolucionService.buscar_datos_basicos_usuario(e.marcada_erronea_por)
                datos_erronea = {
                    "nombre": profesionales_bd[e.marcada_erronea_por]['nombre_completo'],
                    "id_usuario": profesionales_bd[e.marcada_erronea_por]['id_usuario'],
                    "fecha": e.fecha_marcada_erronea,
                    "motivo": e.motivo_erronea
                }
            else:
                datos_erronea = None
            # Busco los items del diagnostico, si ya estan los datos recolectados de la BD, no los busco
            if e.id_diagnostico_multiaxial:
                for item in [e.diagnostico.id_item1, e.diagnostico.id_item2, e.diagnostico.id_item3, e.diagnostico.id_item4, e.diagnostico.id_item5]:
                    if item not in items_dm_bd:
                        #voy a la BD a buscarlo
                        result = await db.execute(select(ItemDM).where(ItemDM.id_item == item))
                        datos_item = result.scalar_one_or_none()
                        items_dm_bd[item] = {
                            "id_item": item,
                            "eje": datos_item.eje,
                            "descripcion": datos_item.descripcion
                        }
                
                if e.diagnostico.creado_por not in profesionales_bd:
                    profesionales_bd[e.diagnostico.creado_por] = await EvolucionService.buscar_datos_basicos_usuario(e.diagnostico.creado_por)
                    datos_creacion = {
                        "nombre": profesionales_bd[e.diagnostico.creado_por]['nombre_completo'],
                        "id_usuario": profesionales_bd[e.diagnostico.creado_por]['id_usuario'],
                        "fecha": e.fecha_creacion
                    }

                diagnostico = {
                    "id_diagnostico_multiaxial": e.id_diagnostico_multiaxial,
                    "creacion": datos_creacion,
                    "item_1": items_dm_bd[e.diagnostico.id_item1],
                    "item_2": items_dm_bd[e.diagnostico.id_item2],
                    "item_3": items_dm_bd[e.diagnostico.id_item3],
                    "item_4": items_dm_bd[e.diagnostico.id_item4],
                    "item_5": items_dm_bd[e.diagnostico.id_item5]
                }
            else:
                diagnostico = None
            evolucion = {
                **e.__dict__,
                "creacion": datos_creacion,
                "erronea": datos_erronea,
                "diagnostico": diagnostico
            }
            lista_evoluciones.append(EvolucionCompleta(**evolucion))
        return lista_evoluciones

    # NUEVO 10/11
    @staticmethod
    async def obtener_evolucion(
        id_usuario: int,
        id_evolucion: int,
        db: AsyncSession
    ) -> EvolucionCompleta:
        query = select(Evolucion).options(selectinload(Evolucion.diagnostico))
        query = query.where(Evolucion.id_usuario == id_usuario)
        query = query.where(Evolucion.id_evolucion == id_evolucion)
        result = await db.execute(query) 
        e = result.scalar_one_or_none()
        if e is None:
            raise HTTPException(status_code=404, detail="Evolucion no encontrada")

        items_dm_bd = {}
        profesionales_bd = {}
        if e.creada_por not in profesionales_bd:
            profesionales_bd[e.creada_por] = await EvolucionService.buscar_datos_basicos_usuario(e.creada_por)
        datos_creacion = {
            "nombre": profesionales_bd[e.creada_por]['nombre_completo'],
            "id_usuario": profesionales_bd[e.creada_por]['id_usuario'],
            "fecha": e.fecha_creacion
        }

        if e.marcada_erronea:
            if e.marcada_erronea_por not in profesionales_bd:
                profesionales_bd[e.marcada_erronea_por] = await EvolucionService.buscar_datos_basicos_usuario(e.marcada_erronea_por)
            datos_erronea = {
                "nombre": profesionales_bd[e.marcada_erronea_por]['nombre_completo'],
                "id_usuario": profesionales_bd[e.marcada_erronea_por]['id_usuario'],
                "fecha": e.fecha_marcada_erronea,
                "motivo": e.motivo_erronea
            }
        else:
            datos_erronea = None
        # Busco los items del diagnostico, si ya estan los datos recolectados de la BD, no los busco
        if e.id_diagnostico_multiaxial:
            for item in [e.diagnostico.id_item1, e.diagnostico.id_item2, e.diagnostico.id_item3, e.diagnostico.id_item4, e.diagnostico.id_item5]:
                if item not in items_dm_bd:
                    #voy a la BD a buscarlo
                    result = await db.execute(select(ItemDM).where(ItemDM.id_item == item))
                    datos_item = result.scalar_one_or_none()
                    items_dm_bd[item] = {
                        "id_item": item,
                        "eje": datos_item.eje,
                        "descripcion": datos_item.descripcion
                    }
            
            if e.diagnostico.creado_por not in profesionales_bd:
                profesionales_bd[e.diagnostico.creado_por] = await EvolucionService.buscar_datos_basicos_usuario(e.diagnostico.creado_por)
                datos_creacion = {
                    "nombre": profesionales_bd[e.diagnostico.creado_por]['nombre_completo'],
                    "id_usuario": profesionales_bd[e.diagnostico.creado_por]['id_usuario'],
                    "fecha": e.fecha_creacion
                }

            diagnostico = {
                "id_diagnostico_multiaxial": e.id_diagnostico_multiaxial,
                "creacion": datos_creacion,
                "item_1": items_dm_bd[e.diagnostico.id_item1],
                "item_2": items_dm_bd[e.diagnostico.id_item2],
                "item_3": items_dm_bd[e.diagnostico.id_item3],
                "item_4": items_dm_bd[e.diagnostico.id_item4],
                "item_5": items_dm_bd[e.diagnostico.id_item5]
            }
        else:
            diagnostico = None
        evolucion = {
            **e.__dict__,
            "creacion": datos_creacion,
            "erronea": datos_erronea,
            "diagnostico": diagnostico
        }
        return EvolucionCompleta(**evolucion)

    @staticmethod
    async def marcar_erronea_con_dni(dni_paciente: str, id_evolucion: int, motivo_erronea: str | None, marcada_erronea_por: int, db: AsyncSession):
        result = await db.execute(select(Evolucion).where(Evolucion.id_evolucion == id_evolucion, Evolucion.dni_paciente == dni_paciente))
        evolucion = result.scalar_one_or_none()
        if evolucion is None:
            return None
        evolucion.marcada_erronea = True
        evolucion.motivo_erronea = motivo_erronea
        evolucion.marcada_erronea_por = marcada_erronea_por
        await db.commit()
        await db.refresh(evolucion)
        return evolucion

    async def marcar_erronea_con_id_usuario(id_usuario: int, id_evolucion: int, motivo_erronea: str | None, db: AsyncSession, idDuenio: int | str = 1):
        result = await db.execute(select(Evolucion).where(Evolucion.id_evolucion == id_evolucion, Evolucion.id_usuario == id_usuario))
        evolucion = result.scalar_one_or_none()
        if evolucion is None:
            return None
        if evolucion.marcada_erronea:
            raise HTTPException(status_code=400, detail='La evolución ya fue marcada como erronea.')
        # Solo el creador puede marcarla como erronea
        if evolucion.creada_por != idDuenio:
            raise HTTPException(status_code=403, detail='Solo el creador de la evolucion puede marcarla como erronea')
        evolucion.marcada_erronea = True
        evolucion.motivo_erronea = motivo_erronea
        evolucion.fecha_marcada_erronea = datetime.now()
        evolucion.marcada_erronea_por = idDuenio
        await db.commit()
        #await db.refresh(evolucion)
        #return evolucion
        # Agregado para obtener los datos limpios y listos para el frontend
        return await EvolucionService.obtener_evolucion(id_usuario, id_evolucion, db)

    @staticmethod
    async def crear_evolucion(id_usuario: int, input: EvolucionCrear, db: AsyncSession, idDuenio: int | str = 1): #-> EvolucionLeida:
        # Validar que el paciente exista
        result = await db.execute(select(Paciente).where(Paciente.id_usuario == id_usuario))
        paciente = result.scalar_one_or_none()
        if paciente is None:
            
            raise ValueError("El paciente indicado no existe")
        # Determinar si se debe crear un nuevo DM o usar el más reciente
        id_diagnostico_multiaxial = None
        
        # Verificar si hay al menos un id_item
        items_provistos = [input.id_item1, input.id_item2, input.id_item3, input.id_item4, input.id_item5]
        tiene_items = any(item is not None for item in items_provistos)
        
        if tiene_items:
            # Validar que TODOS los items estén provistos si se provee alguno
            if not all(item is not None for item in items_provistos):
                raise ValueError("Si se proporciona algún id_item, deben proporcionarse los 5 items")
            
            # Crear nuevo DiagnosticoMultiaxial
            from services.diagnostico_multiaxial_service import DiagnosticoMultiaxialService
            from schemas.diagnostico_multiaxial_schema import DiagnosticoMultiaxialCrear
            
            dm_input = DiagnosticoMultiaxialCrear(
                id_item1=input.id_item1,
                id_item2=input.id_item2,
                id_item3=input.id_item3,
                id_item4=input.id_item4,
                id_item5=input.id_item5,
                creado_por=idDuenio
            )
            id_diagnostico_multiaxial = await DiagnosticoMultiaxialService.crear_diagnostico(dm_input, db)
        #LARA: Comente el else para que si no quiere cargar un DM, deje ese campo vacio.
        #else:
            # Buscar el DM más reciente del paciente al que se le quiere cargar el diagnostico
            #from sqlalchemy import desc
            #result = await db.execute(
            #    select(DiagnosticoMultiaxial)
            #    .join(Evolucion, DiagnosticoMultiaxial.evolucion)
            #    .where(Evolucion.id_usuario == id_usuario)
            #    .order_by(desc(DiagnosticoMultiaxial.fecha_creacion))
            #    .limit(1)
            #)
            #dm_reciente = result.scalar_one_or_none()
            #if dm_reciente:
            #    id_diagnostico_multiaxial = dm_reciente.id_diagnostico_multiaxial
        
        # Crear evolución sin los campos id_item (no pertenecen al modelo)
        evolucion_data = input.dict(exclude={'id_item1', 'id_item2', 'id_item3', 'id_item4', 'id_item5'})
        evolucion_data["id_usuario"] = id_usuario
        if id_diagnostico_multiaxial:
            evolucion_data["id_diagnostico_multiaxial"] = id_diagnostico_multiaxial
        evolucion_data["creada_por"] = idDuenio # hardcodeado por ahora
        evolucion_data["tipo"] = "individual" # este endpoint solo carga individual
        
        evolucion = Evolucion(**evolucion_data)
        db.add(evolucion)
        await db.commit()
        await db.refresh(evolucion)
        #return EvolucionLeida.from_orm(evolucion) Devolvemos unicamente el ID
        return {"id_evolucion": evolucion.id_evolucion}

    @staticmethod
    async def crear_evoluciones_grupales(input: EvolucionGrupalCrear, db: AsyncSession, idDuenio: int | str = 1) -> EvolucionGrupalRespuesta:
        from datetime import datetime
        from models.paciente import Paciente
        creadas_models: list[Evolucion] = []
        fallidas: list[EvolucionGrupalFallida] = []
        now = datetime.utcnow()

        # Las evoluciones grupales NO tienen DM asociado
        # Traer todos los DNIs existentes en una sola query
        from sqlalchemy import select as _select
        result = await db.execute(_select(Paciente.id_usuario).where(Paciente.id_usuario.in_(input.ids_usuario)))
        existentes = {row[0] for row in result.all()}

        for id_usuario in input.ids_usuario:
            if id_usuario not in existentes:
                fallidas.append(EvolucionGrupalFallida(id_usuario=id_usuario, motivo="Paciente no encontrado"))
                continue
            evolucion = Evolucion(
                id_usuario=id_usuario,
                observacion=input.observacion,
                #id_turno=None,
                tipo="grupal",
                creada_por=idDuenio,
                fecha_creacion=now,
                #id_diagnostico_multiaxial=None
            )
            db.add(evolucion)
            creadas_models.append(evolucion)

        # Si ninguna válida, no hacemos commit con inserts vacíos
        if creadas_models:
            await db.commit()
            for e in creadas_models:
                await db.refresh(e)

        return EvolucionGrupalRespuesta(
            creadas=[EvolucionLeida.from_orm(e) for e in creadas_models],
            fallidas=fallidas
        )
    
    @staticmethod
    async def marcar_erronea(id_evolucion: int, motivo_erronea: str | None, marcada_erronea_por: int, db: AsyncSession):
        result = await db.execute(select(Evolucion).where(Evolucion.id_evolucion == id_evolucion))
        evolucion = result.scalar_one_or_none()
        if evolucion is None:
            return None
        evolucion.marcada_erronea = True
        evolucion.motivo_erronea = motivo_erronea
        evolucion.marcada_erronea_por = marcada_erronea_por
        await db.commit()
        await db.refresh(evolucion)
        return evolucion
