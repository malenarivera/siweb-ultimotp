from pymongo import AsyncMongoClient
from beanie import init_beanie
from models.agenda import Agenda
from models.turno import Turno
import os

client: AsyncMongoClient | None = None

async def init_db():
    global client
    client = AsyncMongoClient(os.getenv('DB_URL')) # Crear un cliente que se conecta al gestor. Lee la URL del gestor cargada como variable de entorno (indicada en docker-compose)
    await init_beanie(
        database=client["turnos"],
        document_models=[Agenda, Turno]
    )

async def close_db():
    client.close()