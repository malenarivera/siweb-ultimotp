from models.agenda import Agenda
from schemas.agenda_schema import CrearAgenda, AgendaCreada, CargarHorario, HorarioMongo, Baja, Congelar, PeriodoCongelado
from datetime import date, datetime
from beanie import operators as op
from bson import ObjectId
from fastapi import HTTPException

class AgendaService:

    @staticmethod
    async def crear_agenda(input: CrearAgenda) -> AgendaCreada:
        existe = await Agenda.find_one(Agenda.idProfesional == input.idProfesional)
        if existe:
            raise HTTPException(status_code=400, detail="Ya existe una agenda con ese profesional")
        
        try:
            agenda = Agenda(**input.model_dump(), idUsuario = "1") # hardcodeamos por ahora quien la crea
            await agenda.insert()
            agenda.id = str(agenda.id)
            return agenda
        except Exception as e:
            raise HTTPException(status_code=422, detail=str(e))

    @staticmethod
    async def cargar_franja_horaria(idAgenda: str, input: CargarHorario) -> UnaAgenda:
        existe = await Agenda.get(ObjectId(idAgenda))
        if not existe:
            raise HTTPException(status_code=404, detail="No existe una agenda con el id indicado")
        # Verifico si la agenda esta dada de baja, en ese caso no se puede cargar una franja
        if existe.baja is not None:
            raise HTTPException(status_code=422, detail="La agenda esta dada de baja")
        # Verifico si se indico una fecha, de no haber se define la fecha de hoy
        if not input.fechaInicio:
            input["fechaInicio"] = date.today()
        horarios_a_cargar = input.model_dump()

        # Verifico que no se carguen mas de 7 dias de la semana
        cant_dias = len(horarios_a_cargar["dias"])
        if cant_dias == 0:
            raise HTTPException(status_code=422, detail="Debe cargar el horario de al menos un dia de la semana")
        if cant_dias > 7:
            raise HTTPException(status_code=422, detail="No se puede cargar mas de 7 dias, verifique si un dia de la semana esta repetido")
        dias_cargados = [] # para verificar dias repetidos
        for i in range(cant_dias):
            # Mongo no puede cargar TIME de python, se convierte a string. Luego, la inversa se hara con time.fromisoformat(xxx)
            horarios_a_cargar["dias"][i]["horaInicio"] = horarios_a_cargar["dias"][i]["horaInicio"].isoformat()
            horarios_a_cargar["dias"][i]["horaFin"] = horarios_a_cargar["dias"][i]["horaFin"].isoformat()
            if horarios_a_cargar["dias"][i]["nro"] not in dias_cargados:
                dias_cargados.append(horarios_a_cargar["dias"][i]["nro"])
            else:
                raise HTTPException(status_code=422, detail=f'Se repite el dia {horarios_a_cargar["dias"][i]["nro"]}')
        horarios_a_cargar = HorarioMongo(**horarios_a_cargar, idUsuario="1")# hardcodeado hasta obtener id del usuario de la sesion 
        # Si horarios es nulo lo convierto en array vacio
        if existe.horarios is None:
            await existe.update({"$set": {"horarios": []}})
        else:
            # Si la fecha a partir de la cual se aplica la franja ya existe, se actualizan los datos
            await existe.update(
                op.Pull({"horarios": {"fechaInicio": input.fechaInicio}})
            )
        await existe.update(op.AddToSet({"horarios": horarios_a_cargar}))
        agenda_cargada = (await Agenda.get(ObjectId(idAgenda))).model_dump()
        agenda_cargada["id"] = str(agenda_cargada["id"])
        return agenda_cargada

    @staticmethod
    async def buscar_agendas(idProfesional: str, activa: bool, limit: int, offset: int) -> UnaAgenda | list[UnaAgenda]:
        # el Sort se agregara cuando se incorporen los microservicios
        if idProfesional:
            #ignora el limit y offset
            agenda = await Agenda.find_one(Agenda.idProfesional == idProfesional)
            if not agenda:
                raise HTTPException(status_code=400, detail="No existe una agenda con ese profesional")
            agenda.id = str(agenda.id)
            return agenda
        if activa is not None:
            if activa:
                agendas = Agenda.find(Agenda.baja == None)
            else:
                agendas = Agenda.find(Agenda.baja != None)
        else:
            agendas = Agenda.find({})
        agendas = await agendas.skip((offset * limit)).limit(limit).to_list()
        for agenda in agendas:
            agenda.id = str(agenda.id)
        return agendas

    @staticmethod
    async def desactivar_agenda(idAgenda: str):
        agenda = await Agenda.get(ObjectId(idAgenda))
        if not agenda:
            raise HTTPException(status_code=404, detail="No existe una agenda con el id indicado")
        if agenda.baja is not None:
            raise HTTPException(status_code=422, detail="La agenda ya esta desactivada")
        else:
            datos_baja = Baja(idUsuario = "1", fecha = datetime.now()) # hardcodeamos con 1 de momento
            agenda.baja = datos_baja
            await agenda.save()
        return {}

    @staticmethod
    async def congelar_agenda(idAgenda: str, input: Congelar):
        agenda = await Agenda.get(ObjectId(idAgenda))
        if not agenda:
            raise HTTPException(status_code=404, detail="No existe una agenda con el id indicado")
        if agenda.baja is not None:
            raise HTTPException(status_code=422, detail="La agenda esta desactivada")
        datos_congelar = PeriodoCongelado(**input.model_dump(), idUsuario = "1", fecha = datetime.now()) # hardcodeamos con 1 de momento
        # Si periodosCongelados es nulo lo convierto en array vacio
        if agenda.periodosCongelados is None:
            await agenda.update({"$set": {"periodosCongelados": []}})
        await agenda.update(op.AddToSet({"periodosCongelados": datos_congelar}))
        return {}

    @staticmethod
    async def descongelar_agenda(idAgenda: str, fechaInicio: date, fechaFin:date):
        agenda = await Agenda.get(ObjectId(idAgenda))
        if not agenda:
            raise HTTPException(status_code=404, detail="No existe una agenda con el id indicado")
        if agenda.baja is not None:
            raise HTTPException(status_code=422, detail="La agenda esta desactivada")
        if agenda.periodosCongelados is None:
            raise HTTPException(status_code=422, detail="La agenda no tiene periodos congelados para descongelar")

        agenda = await Agenda.find_one(
            {
                "_id": ObjectId(idAgenda),
                "periodosCongelados": {
                    "$elemMatch": {
                        "fechaInicio": fechaInicio,
                        "fechaFin": fechaFin
                    }
                }
            }
        )

        if not agenda:
            raise HTTPException(status_code=404, detail="La agenda no tiene un periodo congelado en las fechas indicadas")

        for p in agenda.periodosCongelados:
            if p.fechaInicio == fechaInicio and p.fechaFin == fechaFin:
                if not p.activa:
                    raise HTTPException(status_code=422, detail="El periodo indicado de la agenda ya fue previamente descongelado")
                p.activa = False
                break

        await agenda.save()
        return {}

    @staticmethod
    async def obtener_agenda(idAgenda: str) -> UnaAgenda:
        agenda = await Agenda.get(ObjectId(idAgenda))
        if not agenda:
            raise HTTPException(status_code=404, detail="No existe la agenda indicada.")
        agenda = agenda.model_dump()
        agenda["id"] = str(agenda["id"])
        return agenda