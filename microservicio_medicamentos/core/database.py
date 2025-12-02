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
        else:
            # No borrar la base de datos si ya existe para preservar los datos
            # await conn.execute(text(f'DROP DATABASE "{DB_NAME}"'))
            # await conn.execute(text(f'CREATE DATABASE "{DB_NAME}"'))
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
        yield session


# ============================================================
# 5️⃣ DATABASE INITIALIZATION
# ============================================================

async def init_db():
    # Ensure the database exists before creating tables
    await create_database_if_not_exists()

    async with engine.begin() as conn:
        from models import medicamento, ingreso_medicamento, egreso_medicamento, recetas
        await conn.run_sync(Base.metadata.create_all)
        print("📦 Tables created successfully.")
    
    # Cargar medicamentos desde CSV si el archivo existe
    await cargar_medicamentos_iniciales()


async def close_db():
    await engine.dispose()


async def cargar_medicamentos_iniciales():
    """Carga medicamentos desde CSV al inicializar la base de datos"""
    import csv
    import os
    from models.medicamento import Medicamento
    
    archivo_csv = "/app/medicamentos.csv"
    
    # Verificar si el archivo existe
    if not os.path.exists(archivo_csv):
        print(f"⚠️ No se encontró el archivo CSV en {archivo_csv}, omitiendo carga inicial")
        return
    
    # Verificar si ya hay medicamentos cargados
    async with async_session() as session:
        from sqlalchemy import select, func
        result = await session.execute(select(func.count()).select_from(Medicamento))
        count = result.scalar()
        
        if count > 0:
            return
    
    # Cargar medicamentos desde CSV
    print(f"📥 Cargando medicamentos desde {archivo_csv}...")
    medicamentos_cargados = 0
    
    try:
        async with async_session() as session:
            async with session.begin():
                with open(archivo_csv, 'r', encoding='utf-8') as file:
                    csv_reader = csv.DictReader(file)
                    
                    for row in csv_reader:
                        medicamento = Medicamento(
                            laboratorio_titular=row.get('laboratorio_titular'),
                            nombre_comercial=row['nombre_comercial'],
                            nombre_generico=row['nombre_generico'],
                            concentracion=row['concentracion'],
                            forma_farmaceutica=row['forma_farmaceutica'],
                            presentacion=row['presentacion'],
                            stock=0
                        )
                        session.add(medicamento)
                        medicamentos_cargados += 1
                
            print(f"✅ {medicamentos_cargados} medicamentos cargados exitosamente desde CSV")
    except Exception as e:
        print(f"❌ Error al cargar medicamentos desde CSV: {str(e)}")


# ============================================================
# 6️⃣ OPTIONAL: RUN INIT WHEN SCRIPT EXECUTES DIRECTLY
# ============================================================

if __name__ == "__main__":
    asyncio.run(init_db())
