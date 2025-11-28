from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os


# Create the async engine
engine = create_async_engine(os.getenv("DB_URL"), echo=True, future=True)

# Create a session factory
async_session = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
class Base(DeclarativeBase):
    pass

# Dependency for FastAPI routes
async def get_db():
    async with async_session() as session:
        yield session

# Database initialization (optional)
async def init_db():
    async with engine.begin() as conn:
        # Import all models here before creating tables
        from models import paciente
        await conn.run_sync(Base.metadata.create_all)

async def close_db():
    await engine.dispose()
