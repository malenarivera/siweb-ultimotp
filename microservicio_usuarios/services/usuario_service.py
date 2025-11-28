from models.usuario import Usuario
from models.profesional import Profesional
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, select, null, delete, text
from fastapi import HTTPException
import httpx
from core.auth import get_roleid, get_mgmt_api, _get_auth0_config

class UsuarioService:

    @staticmethod
    def generar_username(nombre: str, apellido:str):
        hoy = date.today()
        username: str = nombre[:3].lower() + apellido[:3].lower() + f"{hoy.day:02d}{hoy.month:02d}"
        return username

    @staticmethod
    async def cargar_usuario_en_auth0(id: str, email: str, password: str, username: str, name: str, surname: str, phone_number: str | None):
        input = {
            "email": email,
            "email_verified": True,
            "verify_email": False,
            "user_id": str(id),
            "password": password,
            "connection": "Username-Password-Authentication",
            "username": username,
            "given_name": name,
            "family_name": surname,
            "name": f'{name} {surname}',
        }
        AUTH0_DOMAIN, _ = _get_auth0_config()
        headers = {"Authorization": f"Bearer {get_mgmt_api()}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(f'https://{AUTH0_DOMAIN}/api/v2/users', json=input, headers=headers) 
            if response.status_code != 200 and response.status_code != 201:
                print(f'error en auth0: {response.json()}')
                print(f'my token: {get_mgmt_api()}')
                raise HTTPException(
                    status_code=400,
                    detail=f'error en auth0... mi key: {get_mgmt_api()}'
                )
            r = response.json()
            print(f'auth0 salio bien: ${r}')
            return r

    @staticmethod
    async def asignar_rol_auth0(id_usuario: str, rol: str):
        roles_id = []
        roles_id.append(get_roleid(rol.lower()))
        input = {
            "roles": roles_id,
        }
        AUTH0_DOMAIN, _ = _get_auth0_config()
        headers = {"Authorization": f"Bearer {get_mgmt_api()}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(f'https://{AUTH0_DOMAIN}/api/v2/users/auth0|{id_usuario}/roles', json=input, headers=headers) 
            if response.status_code != 204:
                print(f'error en auth0: {response.json()}')
                raise HTTPException(
                    status_code=400,
                    detail="Error en auth0..."
                )
            print(f'auth0 rol salio bien:')
            return {}

    @staticmethod
    async def crear_usuario(db: AsyncSession, nombre:str, apellido:str, email:str | None = None, telefono:str | None = None, sembrado: bool = False, idDuenio: int | str = 1):
        username = UsuarioService.generar_username(nombre, apellido)
        if not email:
            raise HTTPException(
                status_code=400,
                detail="Es obligatorio el email"
            )
        usuario = {
            "email": email,
            "telefono": telefono,
            "username": username,
            "password": username,
            "fecha_creacion": datetime.now(),
            "creado_por": idDuenio
        }
        usuarioBD = Usuario(**usuario)
        db.add(usuarioBD)
        await db.commit()
        await db.refresh(usuarioBD)

        # Cargar tambien en auth0
        if not sembrado:
            await UsuarioService.cargar_usuario_en_auth0(usuarioBD.id_usuario, email, username, username, nombre, apellido, telefono)
        return usuarioBD.id_usuario

    @staticmethod
    async def desactivar_usuario(id_usuario: int, motivo: str, db: AsyncSession, idDuenio: int | str = 1) -> bool:
        query = select(Usuario)
        query = query.where(Usuario.id_usuario == id_usuario)
        result = await db.execute(query)
        result = result.mappings().first()
        if not result:
            raise HTTPException(
                status_code=404,
                detail="No existe usuario con el id indicado"
            )
        usuario_a_dar_baja = await db.get(Usuario, id_usuario)
        usuario_a_dar_baja.baja_por = idDuenio
        usuario_a_dar_baja.fecha_baja = datetime.now()
        usuario_a_dar_baja.motivo_baja = motivo
        await db.commit()
        return True

    @staticmethod
    async def desactivar_usuario_personal(id_usuario: int, motivo: str, db: AsyncSession, idDuenio: int | str = 1) -> bool:
        query = select(Usuario).join(Profesional, Usuario.profesional)
        query = query.where(Usuario.id_usuario == id_usuario)
        result = await db.execute(query)
        result = result.mappings().first()
        if not result:
            raise HTTPException(
                status_code=404,
                detail="No existe personal con el id indicado"
            )
        usuario_a_dar_baja = await db.get(Usuario, id_usuario)
        usuario_a_dar_baja.baja_por = idDuenio
        usuario_a_dar_baja.fecha_baja = datetime.now()
        usuario_a_dar_baja.motivo_baja = motivo
        await db.commit()
        return True
    
    @staticmethod
    async def editar_usuario_y_devolver(db: AsyncSession, id_usuario: int, fecha: datetime, email:str | None, telefono:str | None, idDuenio: int | str = 1) -> UnUsuario:
        usuario_a_modificar = await db.get(Usuario, int(id_usuario))
        usuario_a_modificar.editado_por = idDuenio
        usuario_a_modificar.ultima_edicion = fecha
        if email == "" and telefono == "":
            raise ValueError("No se puede dejar el email y el telefono vacios. Al menos uno debe mantener un valor")
        if email is not None:
            if email == "":
                if telefono is None and usuario_a_modificar.telefono == None:
                    raise ValueError("Se quiere eliminar el email pero el personal no contiene telefono. Debe tener almenos una forma de contacto.")
                usuario_a_modificar.email = null()
            else:
                usuario_a_modificar.email = email
        if telefono is not None:
            if telefono == "":
                if email is None and usuario_a_modificar.email == None:
                    raise ValueError("Se quiere eliminar el telefono pero el personal no contiene email. Debe tener almenos una forma de contacto.")
                usuario_a_modificar.telefono = null()
            else:
                usuario_a_modificar.telefono = telefono
        await db.commit()
        await db.refresh(usuario_a_modificar)
        usuario = usuario_a_modificar.__dict__
        usuario["alta"] = {
            "fecha": usuario["fecha_creacion"],
            "id_usuario": usuario["creado_por"],
        }
        usuario["baja"] = {
            "fecha": usuario["fecha_baja"],
            "id_usuario": usuario["baja_por"],
            "motivo": usuario["motivo_baja"]
        }
        usuario["edicion"] = {
            "fecha": usuario["ultima_edicion"],
            "id_usuario": usuario["editado_por"]
        }
        return usuario

    @staticmethod
    async def editar_usuario(db: AsyncSession, id_usuario: int, fecha: datetime, email:str | None, telefono:str | None, idDuenio: int | str = 1):
        usuario_a_modificar = await db.get(Usuario, id_usuario)
        usuario_a_modificar.editado_por = idDuenio # hardcodeado por ahora
        usuario_a_modificar.ultima_edicion = fecha
        if email == "" and telefono == "":
            raise ValueError("No se puede dejar el email y el telefono vacios. Al menos uno debe mantener un valor")
        if email is not None:
            if email == "":
                if telefono is None and usuario_a_modificar.telefono == None:
                    raise ValueError("Se quiere eliminar el email pero el personal no contiene telefono. Debe tener almenos una forma de contacto.")
                usuario_a_modificar.email = null()
            else:
                usuario_a_modificar.email = email
        if telefono is not None:
            if telefono == "":
                if email is None and usuario_a_modificar.email == None:
                    raise ValueError("Se quiere eliminar el telefono pero el personal no contiene email. Debe tener almenos una forma de contacto.")
                usuario_a_modificar.telefono = null()
            else:
                usuario_a_modificar.telefono = telefono
        return db

    @staticmethod
    async def obtener_usuario(db: AsyncSession, id_usuario: int):
        query = select(Usuario).where(Usuario.id_usuario == id_usuario)
        result = await db.execute(query)
        result = result.mappings().first()
        if not result:
            raise HTTPException(
                status_code=404,
                detail="No existe usuario con el id indicado"
            )
        datos = dict(result)['Usuario']
        datos.alta = {
            "fecha": datos.fecha_creacion,
            "id_usuario": datos.creado_por,
        }
        datos.baja = {
            "fecha": datos.fecha_baja,
            "id_usuario": datos.baja_por,
            "motivo": datos.motivo_baja
        }
        datos.edicion = {
            "fecha": datos.ultima_edicion,
            "id_usuario": datos.editado_por
        }
        return datos

    @staticmethod
    async def usuario_es_admin(db: AsyncSession, id_usuario: int):
        query = select(Usuario).where(Usuario.id_usuario == id_usuario)
        result = await db.execute(query)
        result = result.scalar_one_or_none()
        if not result:
            raise HTTPException(
                status_code=404,
                detail="No existe usuario con el id indicado"
            )
        return result.username == "admin"

    @staticmethod
    async def refresh(db: AsyncSession):
        # Elimino de la BD
        stmt = delete(Usuario).where(Usuario.id_usuario > 10).returning(Usuario.id_usuario)
        result = await db.execute(stmt)
        deleted_ids = [row.id_usuario for row in result]
        # Resetear autoincremental
        await db.execute(text('ALTER SEQUENCE usuario_id_usuario_seq RESTART WITH 11'))
        await db.commit()
        # Elimino posibles pacientes
        async with httpx.AsyncClient() as client:
                response = await client.delete(f'http://pacientes:8000/pacientes/refresh') 
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=400,
                        detail='error al resetear usuarios pacientes'
                    )
        # Elimino de Auth0
        AUTH0_DOMAIN, _ = _get_auth0_config()
        headers = {"Authorization": f"Bearer {get_mgmt_api()}"}
        for id in deleted_ids:
            async with httpx.AsyncClient() as client:
                response = await client.delete(f'https://{AUTH0_DOMAIN}/api/v2/users/auth0|{id}', headers=headers) 
                if response.status_code != 204:
                    print(f'error en auth0: {response.json()}')
                    raise HTTPException(
                        status_code=400,
                        detail="Error en auth0..."
                    )
                print(f'auth0 delete salio bien:')
        return {"resultado": "ok"}
        