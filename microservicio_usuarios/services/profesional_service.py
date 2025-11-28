from schemas.profesional_schema import CrearPersonal, TipoPersonal, PersonalCreado, BusquedaPersonal, UnPersonal, EditarPersonal
from models.usuario import Usuario
from models.profesional import Profesional, Administrativo, Clinico
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import delete, select
from sqlalchemy.sql import func
from asyncpg.exceptions import CheckViolationError, UniqueViolationError
from datetime import date, datetime
from services.usuario_service import UsuarioService
from enum import Enum
from fastapi import HTTPException

class OrdenarPor(Enum):
     NOMBRE = "nombre"
     APELLIDO = "apellido"
     FECHA_CREACION = "fecha_creacion"

class ProfesionalService:

    @staticmethod
    def generarLegajo(tipoPersonal: str, id: int):
        legajo: str = ""
        match tipoPersonal:
            case tipoPersonal.PSICOLOGO:
                legajo = "PSC"
            case tipoPersonal.PSIQUIATRA:
                legajo = "PSQ"
            case tipoPersonal.ENFERMERO:
                legajo = "ENF"
            case tipoPersonal.SECRETARIA:
                legajo = "SEC"
            case tipoPersonal.DIRECTOR:
                legajo = "DIR"
            case tipoPersonal.COORDINADOR:
                legajo = "COO"
        legajo += f"-{str(id).zfill(4)}"
        return legajo

    @staticmethod
    def es_clinico(tipo: TipoPersonal) -> bool:
        return tipo in [TipoPersonal.ENFERMERO, TipoPersonal.PSICOLOGO, TipoPersonal.PSIQUIATRA]

    @staticmethod
    async def crear_profesional(input: CrearPersonal, db: AsyncSession, sembrado: bool = False, idDuenio: int | str = 1) -> ProfesionalCreado:
        profesional = input.model_dump()
        # Guardo los datos de las especializaciones
        matricula = profesional.pop("matricula")
        tipo = profesional.pop("tipo")
        if ProfesionalService.es_clinico(tipo) and not matricula:
                raise ValueError("Se debe indicar la matricula del profesional")
        # Creo y cargo al usuario base
        email = profesional.pop("email")
        telefono = profesional.pop("telefono")
        id_usuario = await UsuarioService.crear_usuario(db, profesional['nombre'], profesional['apellido'], email, telefono, sembrado, idDuenio)
        await UsuarioService.asignar_rol_auth0(id_usuario, tipo.value)
        # Creo un Legajo
        legajo = ProfesionalService.generarLegajo(tipo, id_usuario)
        # Cargo el profesional 
        profesional['id_usuario'] = id_usuario
        profesional['legajo'] = legajo
        profesional['genero'] = str(profesional['genero'].value)
        profesionalBD = Profesional(**profesional)
        try:
            db.add(profesionalBD)
            await db.commit()
            #3 si es enfermero, psicologo o psiquiatra cargar en Clinico, sino en Administrativo
            if ProfesionalService.es_clinico(tipo):
                await ProfesionalService.cargar_especializacion_clinico(id_usuario, matricula, tipo.value, db)
            else:
                await ProfesionalService.cargar_especializacion_administrativo(id_usuario, tipo.value, db)
            await db.commit()
            return PersonalCreado(id_usuario=profesionalBD.id_usuario)
        except IntegrityError as e:
            await db.rollback()
            await db.execute(delete(Usuario).where(Usuario.id_usuario == id_usuario))
            await db.commit()
            orig = e.orig 
            if isinstance(orig, UniqueViolationError):
                raise ValueError("Existe un dato duplicado")
            else:
                raise ValueError(f"Error de Base de Datos: {orig}")

    @staticmethod
    async def cargar_especializacion_clinico(id_usuario, matricula, tipo, db: AsyncSession):
        clinicoBD = Clinico(id_usuario=id_usuario, matricula=matricula, tipo=tipo)
        db.add(clinicoBD)
    
    @staticmethod
    async def cargar_especializacion_administrativo(id_usuario, tipo, db: AsyncSession):
        administrativoBD = Administrativo(id_usuario=id_usuario, rol=tipo)
        db.add(administrativoBD)

    @staticmethod
    async def buscar_profesional(
        db: AsyncSession,
        tipo: TipoPersonal | None = None,
        dni: str | None = None,
        nombre: str | None = None,
        apellido: str | None = None,
        genero: Genero | None = None,
        activo: bool | None = None,
        limit: int = 20,
        offset: int = 0,
        sortBy: OrdenarPor | None = None,
        ) -> list[BusquedaPersonal]:
        query = select(Profesional.id_usuario, Profesional.dni, Profesional.nombre, Profesional.apellido, Profesional.genero, func.to_char(Usuario.fecha_creacion, 'YYYY-MM-DD HH:SS').label('fecha_creacion')).join(Usuario, Profesional.usuario)
        if tipo:
            if ProfesionalService.es_clinico(tipo):
                query = query.add_columns(Clinico.tipo).join(Clinico, Profesional.clinico)
                query = query.where(Clinico.tipo == str(tipo.value))
            else:
                query = query.add_columns(Administrativo.rol.label('tipo')).join(Administrativo, Profesional.administrativo)
                query = query.where(Administrativo.rol == str(tipo.value)) 
        else:
            query = query.add_columns(func.coalesce(Clinico.tipo, Administrativo.rol).label('tipo')).join(Clinico, Profesional.clinico, isouter=True).join(Administrativo, Profesional.administrativo, isouter=True)
        if dni:
            query = query.where(Profesional.dni.ilike(f"%{dni}%"))
        if nombre:
            query = query.where(Profesional.nombre.ilike(f"%{nombre}%"))
        if apellido:
            query = query.where(Profesional.apellido.ilike(f"%{apellido}%"))
        if genero:
            query = query.where(Profesional.genero.ilike(f"%{str(genero.value)}%"))
        if activo is not None:
            if activo:
                query = query.where(Usuario.fecha_baja.is_(None))
            else:
                query = query.where(Usuario.fecha_baja.is_not(None))
        sort_map = {
            'nombre': Profesional.nombre,
            'apellido': Profesional.apellido,
            'fecha_creacion': Usuario.fecha_creacion
        }
        if sortBy:
            sort_col = sort_map.get(sortBy.value)
        else:
            sort_col = sort_map.get(Profesional.apellido)
        query = query.order_by(sort_col)
        query = query.limit(limit).offset(offset)
        result = await db.execute(query)
        return result.mappings().all()
     
    @staticmethod
    async def obtener_personal(id_usuario: int , db: AsyncSession) -> UnPersonal:
        query = select(Profesional, Usuario, func.coalesce(Clinico.tipo, Administrativo.rol).label('el_tipo'), Clinico.matricula).join(Usuario, Profesional.usuario).join(Clinico, Profesional.clinico, isouter=True).join(Administrativo, Profesional.administrativo, isouter=True)
        query = query.where(Usuario.id_usuario == id_usuario)
        result = await db.execute(query)
        result = result.mappings().first()
        if not result:
            raise ValueError("No existe personal con el id indicado")
        personal = {**result.Profesional.__dict__, **result.Usuario.__dict__, "tipo":result.el_tipo, "matricula":result.matricula}
        personal["baja"] = {
            "fecha": result.Usuario.fecha_baja,
            "id_usuario": result.Usuario.baja_por,
            "motivo": result.Usuario.motivo_baja
        }
        personal["alta"] = {
            "fecha": result.Usuario.fecha_creacion,
            "id_usuario": result.Usuario.creado_por
        }
        personal["edicion"] = {
            "fecha": result.Usuario.ultima_edicion,
            "id_usuario": result.Usuario.editado_por 
        }
        return personal

    @staticmethod
    async def editar_personal(id_usuario: int, cambios: EditarPersonal, db:AsyncSession, idDuenio: int | str) -> UnPersonal:
        query = select(Usuario).join(Profesional, Usuario.profesional)
        query = query.where(Usuario.id_usuario == id_usuario)
        result = await db.execute(query)
        result = result.mappings().first()
        if not result:
            raise HTTPException(
                status_code=404,
                detail="No existe personal con el id indicado"
            )
        elif result.Usuario.fecha_baja:
            raise HTTPException(
                status_code=403,
                detail="No se puede modificar: El personal ya fue dado de baja"
            )
        ahora = datetime.now()
        try: 
            # Modificamos componentes del usuario
            db = await UsuarioService.editar_usuario(db, id_usuario, ahora, cambios.email, cambios.telefono, idDuenio)
            # Modificamos componentes del profesional y sus especializaciones
            personal_a_modificar = await db.get(Profesional, id_usuario)
            if cambios.nombre is not None:
                personal_a_modificar.nombre = cambios.nombre 
            if cambios.apellido is not None:
                personal_a_modificar.apellido = cambios.apellido
            if cambios.fecha_nacimiento is not None:
                personal_a_modificar.fecha_nacimiento = cambios.fecha_nacimiento
            if cambios.genero is not None:
                personal_a_modificar.genero = cambios.genero.value
            
            if cambios.matricula is not None:
                especializacion_clinica = await db.get(Clinico, id_usuario)
                if especializacion_clinica:
                    especializacion_clinica.matricula = cambios.matricula

            await db.commit()
            return await ProfesionalService.obtener_personal(id_usuario, db)
        except ValueError as e:
            await db.rollback()
            raise HTTPException(
                status_code=422,
                detail=str(e)
            )
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=403,
                detail=f"Ocurrio un error en la base de datos: {e}"
            )