from models.turno import Turno
from models.agenda import Agenda
from schemas.turno_schema import CrearTurno, UnTurno, EstadosTurno, CrearEstado, Estado, CargarRecordatorio, Recordatorio
from datetime import date, datetime, time, timedelta
from beanie import operators as op
from bson import ObjectId
from fastapi import HTTPException

class TurnoService:

    @staticmethod
    def se_solapa(turno_existente: UnTurno, turno_a_reservar: CrearTurno) -> bool:
        inicio_del_turno_a_reservar = datetime.combine(turno_a_reservar.fechaReserva, turno_a_reservar.hora)
        fin_del_turno_a_reservar =  inicio_del_turno_a_reservar + timedelta(minutes=turno_a_reservar.duracion)

        inicio_turno = datetime.combine(turno_existente.fechaReserva, turno_existente.hora)
        fin_turno = inicio_turno + timedelta(minutes=turno_existente.duracion)

        return (inicio_del_turno_a_reservar >= inicio_turno
        and
        inicio_del_turno_a_reservar <= fin_turno) or (inicio_turno >= inicio_del_turno_a_reservar
        and
        inicio_turno <= fin_del_turno_a_reservar)

    @staticmethod
    async def crear_turno(input: CrearTurno) -> UnTurno:
        # Lo que falta es agregar restricciones segun si soy paciente y estoy sacando turno o si soy personal de la clinica y estoy agendando un turno, pero eso cuando ya tengamos la sesion
        agenda = await Agenda.find_one(Agenda.idProfesional == input.idProfesional)
        if not agenda:
            raise HTTPException(status_code=404, detail="El profesional no tiene una agenda.")
        if agenda.baja is not None:
            raise HTTPException(status_code=422, detail="La agenda del profesional esta desactivada.")
        if agenda.horarios is None:
            raise HTTPException(status_code=422, detail="El profesional no tiene horarios cargados para solicitar turnos.")
        if agenda.periodosCongelados is not None:
            for p in agenda.periodosCongelados:
                if p.fechaInicio <= input.fechaReserva and p.fechaFin >= input.fechaReserva and not p.activa:
                        raise HTTPException(status_code=422, detail="La agenda esta congelada en la fecha solicitada. No admite reserva de turnos.")
        # Verificar si la fecha y hora se encuentran dentro de una franja del profesional
        horario_a_analizar = None
        for h in agenda.horarios:
            if h.fechaInicio <= input.fechaReserva:
                if horario_a_analizar is None or horario_a_analizar.fechaInicio < h.fechaInicio:
                    horario_a_analizar = h # Siempre me quedo con el horario mas actual.

        dia_en_agenda = next((dia for dia in h.dias if dia.nro == input.fechaReserva.weekday()), None)
        if not dia_en_agenda:
           raise HTTPException(status_code=422, detail="El profesional no admite turnos en ese dia de la semana.") 
        if time.fromisoformat(dia_en_agenda.horaInicio) > input.hora or time.fromisoformat(dia_en_agenda.horaFin) < input.hora:
           raise HTTPException(status_code=422, detail="El turno no corresponde a la franja horaria del profesional.") 

        # Si no se especifica la duracion se usa la por defecto
        if input.duracion is None:
            input.duracion = h.duracionDefectoTurno 

        # Verificar si el paciente tiene turnos reservados en esa fecha y hora, para algun otro profesional
        turnos_paciente: list[UnTurno] = await TurnoService.buscar_turnos(
            offset=0,
            limit=1000,
            idProfesional=None,
            idPaciente=input.idPaciente,
            fechaDesde=input.fechaReserva,
            fechaHasta=input.fechaReserva,
            estado=None
        )
        for turno_p in turnos_paciente:
            if TurnoService.se_solapa(turno_p, input) and turno_p.estadoActual.estado not in [EstadosTurno.REPROGRAMADO, EstadosTurno.CANCELADO]:
                raise HTTPException(status_code=422, detail="El turno se solapa con otro turno del paciente")

        # Verificar si la hora del turno que quiero crear se solapa con otro turno del profesional
        turnos = await Turno.find(Turno.idAgenda == str(agenda.id) and Turno.fechaReserva == input.fechaReserva).to_list()
        for turno_en_agenda in turnos:
            turno = turno_en_agenda.model_dump()
            turno["id"] = str(turno["id"])
            turno["hora"] = time.fromisoformat(turno["hora"])
            turno = UnTurno(**turno)
            if TurnoService.se_solapa(turno, input) and turno.estadoActual.estado not in [EstadosTurno.REPROGRAMADO, EstadosTurno.CANCELADO]:
                raise HTTPException(status_code=422, detail="El turno se solapa con otro turno en la agenda")
        try:
            input = input.model_dump()
            hora = input.pop("hora").isoformat()
            turno = Turno(**input, hora = hora, idAgenda = str(agenda.id), idUsuario = "1") # hardcodeamos por ahora quien la crea
            await turno.insert()
            turno.id = str(turno.id)
            return turno
        except Exception as e:
            raise HTTPException(status_code=422, detail=str(e))

    @staticmethod
    async def buscar_turnos(offset: int, limit: int, idProfesional: str | None, idPaciente: str | None, fechaDesde: date | None, fechaHasta: date | None, estado: EstadosTurno | None) -> list[UnTurno]:
        if not idProfesional and not idPaciente:
            raise HTTPException(status_code=422, detail="Debe indicar al menos un paciente o un profesional")
        if not fechaDesde and not fechaHasta:
            raise HTTPException(status_code=422, detail="Debe indicar al menos la fecha inicio o fecha fin de la busqueda")
        
        if idProfesional:
            # Primero obtengo la agenda para hacer el match en los turnos
            agenda = await Agenda.find_one(Agenda.idProfesional == idProfesional)
            if not agenda:
                raise HTTPException(status_code=404, detail="El profesional indicado no existe o no tiene una agenda cargada")
            turnos = Turno.find(Turno.idAgenda == str(agenda.id))
        else:
            turnos = Turno.find_all()
        if idPaciente:
            turnos = turnos.find(Turno.idPaciente == idPaciente)
        if fechaDesde:
            turnos = turnos.find(Turno.fechaReserva >= fechaDesde)
        if fechaHasta:
            turnos = turnos.find(Turno.fechaReserva <= fechaHasta)
        if estado:
            turnos = turnos.find(Turno.estadoActual.estado == estado)
        # Ordenamos por fecha ASC por defecto
        turnos = turnos.sort([("fechaReserva", 1), ("hora", 1)]) #1 es ASC
        turnos = await turnos.skip((offset * limit)).limit(limit).to_list()
        resultado = []
        for turno in turnos:
            el_turno = turno.model_dump()
            el_turno["hora"] = time.fromisoformat(turno.hora)
            el_turno["id"] = str(turno.id)
            resultado.append(UnTurno(**el_turno))
        return resultado

    @staticmethod
    async def modificar_estado_turno(idTurno: str, input: CrearEstado) -> UnTurno:
        turno = await Turno.get(ObjectId(idTurno))
        if not turno:
            raise HTTPException(status_code=404, detail="No existe el turno indicado")
        if turno.estadoActual.estado is not EstadosTurno.PENDIENTE:
            raise HTTPException(status_code=422, detail="El turno ya cambio de estado")
        if turno.estadoActual.estado is input.estado:
            raise HTTPException(status_code=422, detail="El cambio de estado es identico al estado actual")
        if datetime.now() < datetime.combine(turno.fechaReserva, time.fromisoformat(turno.hora)) and input.estado in [EstadosTurno.ATENDIDO, EstadosTurno.AUSENTE]:
            raise HTTPException(status_code=422, detail=f'El estado {input.estado.value} es incompatible antes de la fecha del turno')
        estado_nuevo = Estado(**input.model_dump(), idUsuario = "1", fecha = datetime.now())
        turno.estadoAnterior = turno.estadoActual
        turno.estadoActual = estado_nuevo
        await turno.save()
        return await obtener_turno(idTurno)

    @staticmethod
    async def obtener_turno(idTurno: str) -> UnTurno:
        turno = await Turno.get(ObjectId(idTurno))
        if not turno:
            raise HTTPException(status_code=404, detail="No existe el turno indicado")
        turno = turno.model_dump()
        turno["id"] = str(turno["id"])
        return turno

    @staticmethod
    async def programar_recordatorio(idTurno: str, input: CargarRecordatorio, alProfesional: bool):
        turno = await Turno.get(ObjectId(idTurno))
        if not turno:
            raise HTTPException(status_code=404, detail="No existe el turno indicado")
        if turno.fechaReserva < input.fecha:
            raise HTTPException(status_code=422, detail="No se puede crear un recordatorio luego de la fecha del turno")
        if datetime.combine(turno.fechaReserva, time.fromisoformat(turno.hora)) < datetime.combine(input.fecha, input.hora) + timedelta(minutes=120):
            raise HTTPException(status_code=422, detail="El recordatorio debe crearse con almenos dos horas de anticipacion")
        if turno.estadoActual.estado != EstadosTurno.PENDIENTE:
            raise HTTPException(status_code=422, detail=f'El turno no se llevara a cabo, tiene estado {turno.estadoActual.estado.value}')
        if alProfesional:
            agenda = await Agenda.get(ObjectId(turno.idAgenda))
            idUsuarioRecibe:str = agenda.idProfesional
        else:
            idUsuarioRecibe:str = turno.idPaciente
        # Faltaria conectar con el MS De usuarios para verificar si el el usuario posee cargado el medio donde recibir la notificacion
        carga = input.model_dump()
        carga["idUsuarioRecibe"] = idUsuarioRecibe
        carga["hora"] = carga["hora"].isoformat()
        turno.recordatorios.append(Recordatorio(**carga))
        await turno.save()
        return {}
    
    @staticmethod
    async def desactivar_recordatorio(idTurno: str, fecha: date, hora: time, alProfesional: bool):
        turno = await Turno.get(ObjectId(idTurno))
        if not turno:
            raise HTTPException(status_code=404, detail="No existe el turno indicado")
        if not turno.recordatorios:
            raise HTTPException(status_code=404, detail="El turno no tiene recordatorios.")
        encontro = False
        for recordatorio in turno.recordatorios:
            if recordatorio.fecha == fecha and time.fromisoformat(recordatorio.hora) == hora:
                if (alProfesional and recordatorio.idUsuarioRecibe != turno.idPaciente) or (not alProfesional and recordatorio.idUsuarioRecibe == turno.idPaciente):
                        #es recordatorio del profesional
                        if not recordatorio.activo:
                            #ya estaba desactivado
                            raise HTTPException(status_code=422, detail="El recordatorio ya estaba desactivado.")  
                        recordatorio.activo = False
                        encontro = True
        if not encontro:
            raise HTTPException(status_code=404, detail="No existen recordatorios para los filtros solicitados.")
        await turno.save()
        return {}
        
