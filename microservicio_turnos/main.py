from fastapi import FastAPI, status, HTTPException, Response
from core.database import init_db, close_db
from schemas.agenda_schema import CrearAgenda, AgendaCreada, CargarHorario, UnaAgenda, Congelar
from services.agenda_service import AgendaService
from schemas.turno_schema import CrearTurno, UnTurno, TurnoCreado, CrearEstado, EstadosTurno, CargarRecordatorio
from services.turno_service import TurnoService
from datetime import date, time
import locale

try:
    locale.setlocale(locale.LC_ALL, 'es_AR.UTF-8')
except locale.Error:
    locale.setlocale(locale.LC_ALL, 'es_AR')

app = FastAPI(
    title="API Turnos",
    version="0.1",
    descripcion="API de Turnos para la app CRZ"
)


@app.on_event("startup")
async def on_startup():
    await init_db()

@app.on_event("shutdown")
async def on_shutdown():
    await close_db()

@app.post("/turnos/agendas/{idAgenda}/congelar", summary="Congelar una Agenda", tags=["Agenda"], status_code=status.HTTP_200_OK)
async def congelar_agenda(idAgenda: str, input: Congelar):
    return await AgendaService.congelar_agenda(idAgenda, input)

@app.post("/turnos/agendas/{idAgenda}/descongelar", summary="Descongelar una Agenda", tags=["Agenda"], status_code=status.HTTP_200_OK)
async def descongelar_agenda(idAgenda: str, fechaInicio: date, fechaFin:date):
    return await AgendaService.descongelar_agenda(idAgenda, fechaInicio, fechaFin)

@app.post("/turnos/agendas", summary="Crear Agenda a un Profesional", tags=["Agenda"], status_code=status.HTTP_201_CREATED)
async def crear_agenda(input: CrearAgenda, response: Response) -> AgendaCreada:
    agenda = await AgendaService.crear_agenda(input)
    response.headers["Location"] = f'/turnos/agendas/{str(agenda.id)}'
    response.status_code = status.HTTP_201_CREATED
    return agenda

@app.patch("/turnos/agendas/{idAgenda}", summary="Cargar Horario a una Agenda", tags=["Agenda"], status_code=status.HTTP_200_OK)
async def cargar_franja_horaria(idAgenda: str, input: CargarHorario) -> UnaAgenda:
    return await AgendaService.cargar_franja_horaria(idAgenda, input)

@app.get ("/turnos/agendas/{idAgenda}", summary="Obtener Agendas", tags=["Agenda"], status_code=status.HTTP_200_OK)
async def obtener_agenda(idAgenda: str) -> UnaAgenda:
    return await AgendaService.obtener_agenda(idAgenda)

@app.get("/turnos/agendas", summary="Buscar Agendas", tags=["Agenda"], status_code=status.HTTP_200_OK)
async def buscar_agendas(idProfesional: str | None = None, activa: bool | None = None, limit: int = 20, offset: int = 0) -> UnaAgenda | list[UnaAgenda]:
    return await AgendaService.buscar_agendas(idProfesional, activa, limit, offset)

@app.delete("/turnos/agendas/{idAgenda}", summary="Desactivar Agenda", tags=["Agenda"], status_code=204)
async def desactivar_agenda(idAgenda: str):
    return await AgendaService.desactivar_agenda(idAgenda)

@app.post("/turnos/turno", summary="Reservar un Turno", tags=["Turno"])
async def crear_agenda(input: CrearTurno, response: Response) -> TurnoCreado:
    turno = await TurnoService.crear_turno(input)
    response.headers["Location"] = f'/turnos/turno/{turno.id}'
    response.status_code = status.HTTP_201_CREATED 
    return turno

@app.patch("/turnos/turno/{idTurno}", summary="Modificar el estado de un Turno", tags=["Turno"], status_code=200)
async def modificar_estado_turno(idTurno: str, input: CrearEstado) -> UnTurno:
    return await TurnoService.modificar_estado_turno(idTurno, input)

@app.get("/turnos/turno", summary="Buscar turnos", tags=["Turno"], status_code=200)
async def buscar_turnos(idProfesional: str | None = None, idPaciente: str | None = None, fechaDesde: date | None = None, fechaHasta: date | None = None, estado: EstadosTurno | None = None, offset: int = 0, limit: int = 20) -> list[UnTurno]:
    return await TurnoService.buscar_turnos(offset, limit, idProfesional, idPaciente, fechaDesde, fechaHasta, estado)

@app.get("/turnos/turno/{idTurno}", summary="Obtener Turno", tags=["Turno"], status_code=200)
async def obtener_turno(idTurno: str) -> UnTurno:
    return await TurnoService.obtener_turno(idTurno)

@app.post("/turnos/turno/{idTurno}/recordar-profesional", summary="Cargar Recordatorio al Profesional de un Turno", tags=["Turno"], status_code=200)
async def programar_recordatorio_a_profesional(idTurno: str, input: CargarRecordatorio):
    return await TurnoService.programar_recordatorio(idTurno, input, True)

@app.post("/turnos/turno/{idTurno}/recordar-paciente", summary="Cargar Recordatorio al Paciente de un Turno", tags=["Turno"], status_code=200)
async def programar_recordatorio_a_paciente(idTurno: str, input: CargarRecordatorio):
    return await TurnoService.programar_recordatorio(idTurno, input, False)

@app.post("/turnos/turno/{idTurno}/desactivar-recordatorio-profesional", summary="Desactivar el Recordatorio del Profesional de un Turno", tags=["Turno"], status_code=200)
async def desactivar_recordatorio(idTurno: str, fecha:date, hora:time):
    return await TurnoService.desactivar_recordatorio(idTurno, fecha, hora, True)

@app.post("/turnos/turno/{idTurno}/desactivar-recordatorio-paciente", summary="Desactivar el Recordatorio del Paciente de un Turno", tags=["Turno"], status_code=200)
async def desactivar_recordatorio(idTurno: str, fecha:date, hora:time):
    return await TurnoService.desactivar_recordatorio(idTurno, fecha, hora, False)
    