import os
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text


# ============================================================
# 1️⃣ CONFIGURATION
# ============================================================

# Example: postgresql+asyncpg://user:password@db:5432/mydatabase
DB_URL = os.getenv("DB_URL")
if not DB_URL:
    raise ValueError("Environment variable DB_URL is not set.")

# Parse database name and create admin URL for postgres
from urllib.parse import urlparse

url = urlparse(DB_URL)
DB_NAME = url.path.lstrip("/")
ADMIN_DB_URL = DB_URL.replace(DB_NAME, "postgres")  # connect to default 'postgres'


# ============================================================
# 2️⃣ CREATE DATABASE IF NOT EXISTS
# ============================================================

async def create_database_if_not_exists():
    admin_engine = create_async_engine(ADMIN_DB_URL, isolation_level="AUTOCOMMIT")

    async with admin_engine.begin() as conn:
        result = await conn.execute(
            text(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        )
        exists = result.scalar() is not None
        if not exists:
            await conn.execute(text(f'CREATE DATABASE "{DB_NAME}"'))
            print(f"✅ Database '{DB_NAME}' created!")


    await admin_engine.dispose()


# ============================================================
# 3️⃣ ASYNC ENGINE, SESSION, BASE
# ============================================================

engine = create_async_engine(DB_URL, echo=True, future=True)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass


# ============================================================
# 4️⃣ FASTAPI DEPENDENCY
# ============================================================

async def get_db():
    async with async_session() as session:
        yield session


# ============================================================
# 5️⃣ DATABASE INITIALIZATION
# ============================================================

async def init_db():
    # Ensure the database exists before creating tables
    await create_database_if_not_exists()
    async with engine.begin() as conn:
        from models import paciente, evolucion, sot, item_dm, diagnostico_multiaxial  # importar todos los modelos
        await conn.run_sync(Base.metadata.create_all)
        print("📦 Tables created successfully.")
    await seed_initial_data()


async def seed_initial_data():
    from sqlalchemy import select
    from models.item_dm import ItemDM
    from services.paciente_service import PacienteService
    from services.evolucion_service import EvolucionService
    from services.sot_service import SotService
    from schemas.paciente_schema import PacienteCrear, Genero
    from schemas.evolucion_schema import EvolucionCrear, EvolucionGrupalCrear
    from schemas.sot_schema import SotCrear

    # Define initial stock of ItemDM
    seed_items = [
        # Eje I
        {"id_item": "E1-001", "eje": 1, "descripcion": "Trastorno del estado de ánimo"},
        {"id_item": "E1-002", "eje": 1, "descripcion": "Trastorno de ansiedad"},
        {"id_item": "E1-003", "eje": 1, "descripcion": "Trastorno psicótico"},
        # Eje II
        {"id_item": "E2-001", "eje": 2, "descripcion": "Trastorno de personalidad límite"},
        {"id_item": "E2-002", "eje": 2, "descripcion": "Trastorno de personalidad antisocial"},
        # Eje III
        {"id_item": "E3-001", "eje": 3, "descripcion": "Condición médica general"},
        {"id_item": "E3-002", "eje": 3, "descripcion": "Enfermedad endocrina"},
        # Eje IV
        {"id_item": "E4-001", "eje": 4, "descripcion": "Problemas psicosociales"},
        {"id_item": "E4-002", "eje": 4, "descripcion": "Estrés laboral"},
        # Eje V
        {"id_item": "E5-001", "eje": 5, "descripcion": "Funcionamiento Global: leve"},
        {"id_item": "E5-002", "eje": 5, "descripcion": "Funcionamiento Global: moderado"},
    ]

    async with async_session() as session:
        # Cargamos primero los ITEMs del Diagnostico Multiaxial
        result = await session.execute(select(ItemDM.id_item))
        existing_ids = {row[0] for row in result.all()}
        to_create = [ItemDM(**it) for it in seed_items if it["id_item"] not in existing_ids]
        if to_create:
            session.add_all(to_create)
            await session.commit()
            # Cargamos Pacientes listos para usar
            sofia = await PacienteService.crear_paciente(PacienteCrear(
                dni="63245321",
                nombre="Sofia",
                apellido="Sosa",
                genero=Genero.MUJER,
                obra_social="ISSN",
                fecha_nacimiento="2009-03-25",
                fecha_ingreso="2025-08-11",
                domicilio="Calle Azul 224",
                email="sofiiso@gmail.com"
            ), session, True)
            clara = await PacienteService.crear_paciente(PacienteCrear(
                dni="47601147",
                nombre="Clara",
                apellido="Bravo",
                genero=Genero.MUJER,
                obra_social="SOSUNC",
                fecha_nacimiento="1999-10-14",
                fecha_ingreso="2025-10-10",
                domicilio="Barrio Santa Genoveva 207",
                email="cb.clara@gmail.com",
                telefono="2998971116"
            ), session, True)
            solomon = await PacienteService.crear_paciente(PacienteCrear(
                dni="43678551",
                nombre="Solomon",
                apellido="Ramirez",
                genero=Genero.HOMBRE,
                obra_social="SWISS MEDICAL",
                fecha_nacimiento="1999-11-24",
                fecha_ingreso="2025-05-02",
                domicilio="Barrio Confluencia Casa 5",
                email="soloelmascapo@hotmail.com"
            ), session, True)
            # Cargamos Evoluciones y SOTs listas para usar y jugar con las consultas
            await EvolucionService.crear_evolucion(sofia.id_usuario, EvolucionCrear(
                observacion="La adolescente fue traida por sus padres. Se negaba a responder o sus respuestas eran monosilabos.",
                id_item1="E1-001",
                id_item2="E2-002",
                id_item3="E3-001",
                id_item4="E4-001",
                id_item5="E5-001"
            ), session)
            await EvolucionService.crear_evolucion(clara.id_usuario, EvolucionCrear(
                observacion="Primer evolucion Generica con diagnostico multiaxial",
                id_item1="E1-001",
                id_item2="E2-001",
                id_item3="E3-001",
                id_item4="E4-001",
                id_item5="E5-001"
            ), session)
            await EvolucionService.crear_evolucion(clara.id_usuario, EvolucionCrear(
                observacion="Segunda evolucion Generica, ahora con diagnostico multiaxial",
                id_item1="E1-001",
                id_item2="E2-001",
                id_item3="E3-001",
                id_item4="E4-001",
                id_item5="E5-001"
            ), session)
            await EvolucionService.crear_evoluciones_grupales(EvolucionGrupalCrear(
                ids_usuario=[clara.id_usuario, solomon.id_usuario],
                observacion="Los pacientes se expresaron abiertamente aunque costo lograr naturalidad"
            ), session)
            await EvolucionService.crear_evolucion(clara.id_usuario, EvolucionCrear(
                observacion="Tercer evolucion Generica, nuevamente sin diagnostico multiaxial"
            ), session)
            await SotService.crear_sot(clara.id_usuario, SotCrear(
                motivo="Testing SOT",
                fecha="2025-10-31",
                hora="12:00",
                observacion="Esta es una prueba del SOT"
            ), session)
            await EvolucionService.crear_evolucion(clara.id_usuario, EvolucionCrear(
                observacion="Ultima evolucion Generica, con diagnostico multiaxial",
                id_item1="E1-002",
                id_item2="E2-002",
                id_item3="E3-002",
                id_item4="E4-002",
                id_item5="E5-002"
            ), session)
            await EvolucionService.crear_evolucion(solomon.id_usuario, EvolucionCrear(
                observacion="El muchacho vino por voluntad propia, ampliaremos"
            ), session)
            await SotService.crear_sot(sofia.id_usuario, SotCrear(
                motivo="Sofia queria hablar con alguien que, con sus palabras: sabia que la podia escuchar",
                fecha="2025-11-08",
                hora="15:03",
                observacion="Se desahogo de lo que le pasaba en el colegio. Se le explico la utilidad de las SOTs y se la invito a agendar una nueva sesion. Se la felicito por haberse abierto a una charla."
            ), session)
            print(f"🌱 Base de datos sembrada")
        else:
            print("🌱 Base de datos ya estaba sembrado; nada que hacer")
        

async def close_db():
    # YA NO BORRAMOS LA BD
    #admin_engine = create_async_engine(ADMIN_DB_URL, isolation_level="AUTOCOMMIT")
    #async with admin_engine.begin() as conn:
        # Disconnect all other sessions before dropping
    #    await conn.execute(text(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='{DB_NAME}'"))
    #    await conn.execute(text(f"DROP DATABASE IF EXISTS {DB_NAME}"))
    #await admin_engine.dispose()
    await engine.dispose()
    


# ============================================================
# 6️⃣ OPTIONAL: RUN INIT WHEN SCRIPT EXECUTES DIRECTLY
# ============================================================

if __name__ == "__main__":
    asyncio.run(init_db())
