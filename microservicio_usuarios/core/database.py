import os
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from contextlib import asynccontextmanager
from fastapi import Depends


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
        else:
            #await conn.execute(text(f'DROP DATABASE "{DB_NAME}"'))
            #await conn.execute(text(f'CREATE DATABASE "{DB_NAME}"'))
            print(f"⚠️ Database '{DB_NAME}' already exists.")
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
        try:
            yield session
        finally:
            await session.close()


# ============================================================
# 5️⃣ DATABASE INITIALIZATION
# ============================================================

async def poblar_con_datos_base(session: AsyncSession):
    from services.profesional_service import ProfesionalService
    from schemas.profesional_schema import CrearPersonal, TipoPersonal, Genero
    # Llenamos con usuarios
    # Alejandro 
    await ProfesionalService.crear_profesional(CrearPersonal(
        tipo=TipoPersonal.DIRECTOR,
        dni="16732288",
        nombre="Alejandro",
        apellido="Funes",
        genero=Genero.HOMBRE,
        fecha_nacimiento="1970-11-02",
        email="alejandro.f.funes@gmail.com",
        telefono="2993288674"
    ), session, True)
    # Dinora
    await ProfesionalService.crear_profesional(CrearPersonal(
        tipo=TipoPersonal.COORDINADOR,
        dni="19025855",
        nombre="Dinora",
        apellido="Diaz",
        genero=Genero.MUJER,
        fecha_nacimiento="1973-02-13",
        email="didiaz73@yahoo.com.ar",
        telefono="2994337658"
    ), session, True)
    # Maria
    await ProfesionalService.crear_profesional(CrearPersonal(
        tipo=TipoPersonal.SECRETARIA,
        dni="33124453",
        nombre="Maria Fernanda",
        apellido="Gutierrez",
        genero=Genero.MUJER,
        fecha_nacimiento="1993-03-25",
        email="mfgutierrez@gmail.com",
        telefono="2994549579"
    ), session, True)
    # Tomas
    await ProfesionalService.crear_profesional(CrearPersonal(
        tipo=TipoPersonal.PSICOLOGO,
        dni="38923127",
        nombre="Tomas",
        apellido="Peretti",
        matricula="96967",
        genero=Genero.HOMBRE,
        fecha_nacimiento="1997-09-05",
        email="tomiii97@gmail.com",
        telefono="299555896"
    ), session, True)
    # Noemi
    await ProfesionalService.crear_profesional(CrearPersonal(
        tipo=TipoPersonal.ENFERMERO,
        dni="28543673",
        nombre="Noemi",
        apellido="Gomez",
        matricula="21005",
        genero=Genero.MUJER,
        fecha_nacimiento="1980-06-18",
        telefono="2997896543",
        email="noecorazon@hotmail.com"
    ), session, True)
    # Jorge
    await ProfesionalService.crear_profesional(CrearPersonal(
        tipo=TipoPersonal.PSIQUIATRA,
        dni="21706543",
        nombre="Jorge",
        apellido="Soto",
        matricula="67882",
        genero=Genero.HOMBRE,
        fecha_nacimiento="1977-10-02",
        telefono="2993908055",
        email="jsotopsiq@gmail.com"
    ), session, True)

async def init_db():
    # Ensure the database exists before creating tables
    await create_database_if_not_exists()
    global engine, async_session
    engine = create_async_engine(DB_URL, echo=True, future=True)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with engine.begin() as conn:
        from models.usuario import Usuario
        from models.profesional import Profesional

        await conn.run_sync(Base.metadata.create_all)
        print("📦 Tables created successfully.")
    async with async_session() as session:
        result = await session.execute(text("SELECT * FROM usuario LIMIT 1"))
        exists = result.scalar() is not None
        if not exists:
            await session.execute(text("INSERT INTO usuario(username, password) VALUES ('admin', 'admin')"))
            await poblar_con_datos_base(session)
            await session.commit()

async def close_db():
    await engine.dispose()


# ============================================================
# 6️⃣ OPTIONAL: RUN INIT WHEN SCRIPT EXECUTES DIRECTLY
# ============================================================

if __name__ == "__main__":
    asyncio.run(init_db())