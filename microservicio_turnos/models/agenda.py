from beanie import Document
from datetime import datetime
from schemas.agenda_schema import HorarioMongo, PeriodoCongelado, Baja
# documentos embebidos se definen con BaseModel de Pydantic

# https://beanie-odm.dev/tutorial/defining-a-document/
class Agenda(Document):
    idProfesional: str
    horarios: list[HorarioMongo] | None = None
    periodosCongelados: list[PeriodoCongelado] | None = None
    idUsuario: str
    fecha: datetime = datetime.now()
    activa: bool = True
    baja: Baja | None = None

    class Settings: # Configurar el nombre de la coleccion de la BD
        name = "agenda"