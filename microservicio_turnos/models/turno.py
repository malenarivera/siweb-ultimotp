from beanie import Document
from datetime import date, datetime
from schemas.turno_schema import Estado, Recordatorio, EstadosTurno

class Turno(Document):
    idAgenda: str
    fechaReserva: date
    hora: str # Mongo no trabaja con el tipo Time de Python
    idPaciente: str
    duracion: int
    idUsuario: str # carga
    fecha: datetime = datetime.now()# carga
    estadoActual: Estado = Estado(estado=EstadosTurno.PENDIENTE, idUsuario="1") #hardcodeado por ahora
    estadoAnterior: Estado | None = None
    recordatorios: list[Recordatorio] = []
    
    class Settings: # Configurar el nombre de la coleccion de la BD
        name = "turno"