from fastapi import FastAPI, status, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from schemas.paciente_schema import PacienteCrear, PacienteCreado, PacienteEditar, UnPacienteUsuario, UnPaciente, PacienteBaja, Genero, ResultadoBusqueda
from schemas.evolucion_schema import EvolucionCrear, EvolucionLeida, EvolucionMarcarErronea, EvolucionGrupalCrear, EvolucionGrupalRespuesta, EvolucionCompleta
from schemas.sot_schema import SotCrear, SotLeida, SotActualizar, SotCompleta
from schemas.item_dm_schema import ItemDMLeida
from schemas.diagnostico_multiaxial_schema import DiagnosticoMultiaxialCrear, DiagnosticoMultiaxialLeida
from services.paciente_service import PacienteService
from services.evolucion_service import EvolucionService
from services.sot_service import SotService
from services.item_dm_service import ItemDMService
from services.diagnostico_multiaxial_service import DiagnosticoMultiaxialService

from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, init_db, close_db
from core.auth import verify_role, verify_role_is_in, get_user_id_authless

app = FastAPI(
    title="API Pacientes",
    version="0.1",
    description="API de Pacientes para la app CRZ"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

# Errores mas amigables
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    mensajes = "pydantic:"
    for error in exc.errors(): 
        mensajes = mensajes + ";" + error.pop('loc')[1] + ":" + error.pop('msg')
    return JSONResponse(content=jsonable_encoder({"detail": mensajes}), status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

@app.post("/pacientes/", summary="Cargar un Paciente", tags=["Pacientes"], status_code=status.HTTP_201_CREATED)
# Solo Secretarias pueden
async def crear_paciente(input: PacienteCrear, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends(verify_role("Secretaria"))) -> PacienteCreado:
    try:
        paciente = await PacienteService.crear_paciente(input, db)
        return paciente
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Nuevo endpoint GET para obtener paciente por id usuario
@app.get("/pacientes/{id_usuario}", summary="Obtener un Paciente por su ID de Usuario", tags=["Pacientes"])
async def get_paciente(id_usuario: int, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra", "Director", "Coordinador", "Enfermera", "Secretaria"])))) -> UnPacienteUsuario:
    return await PacienteService.get_paciente_por_id(id_usuario, db)

@app.delete("/pacientes/refresh", summary="Resetear pacientes en entorno testing", include_in_schema=False, status_code=200)
async def refresh(db: AsyncSession = Depends(get_db)):
    return await PacienteService.refresh(db)

@app.delete("/pacientes/{id_usuario}", summary="Dar de baja un Paciente por su ID de usuario", tags=["Pacientes"])
async def dar_de_baja_paciente(id_usuario: int, input: PacienteBaja, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Director"])))):
    return await PacienteService.delete_paciente(id_usuario, input, db)
    

# Nuevo endpoint PUT para actualizar paciente por Id Usuario
@app.put("/pacientes/{id_usuario}", summary="Actualizar (parcial o totalmente) un Paciente", tags=["Pacientes"])
async def update_paciente(id_usuario: int, input: PacienteEditar, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Director"])))) -> UnPacienteUsuario:
    paciente = await PacienteService.update_paciente(id_usuario, input, db)
    return paciente

# Endpoint para crear una nueva evolución
@app.post("/pacientes/{id_usuario}/evoluciones", summary="Registrar una Evolución", tags=["Evoluciones"], status_code=status.HTTP_201_CREATED)
async def crear_evolucion(id_usuario: int, input: EvolucionCrear, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra"])))):
    try:
        evolucion = await EvolucionService.crear_evolucion(id_usuario, input, db, get_user_id_authless(_token_payload))
        return evolucion
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Endpoint PATCH para marcar una evolución como errónea
@app.patch("/pacientes/{id_paciente}/evoluciones/{id_evolucion}/marcar-erronea", summary="Marcar evolución como errónea", tags=["Evoluciones"], response_model=EvolucionCompleta)
async def marcar_evolucion_erronea(id_paciente: int, id_evolucion: int, input: EvolucionMarcarErronea, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra"])))):
    evolucion = await EvolucionService.marcar_erronea_con_id_usuario(
        id_paciente,
        id_evolucion,
        input.motivo_erronea,
        db,
        get_user_id_authless(_token_payload)
    )
    if evolucion is None:
        raise HTTPException(status_code=404, detail="Evolución no encontrada o el DNI no coincide")
    return evolucion

# Endpoint GET para listar evoluciones de un paciente con filtros y paginación
from typing import List
from datetime import datetime
from typing import Any


@app.get("/pacientes/{id_usuario}/evoluciones", summary="Listar evoluciones de un paciente", tags=["Evoluciones"])
async def listar_evoluciones(
    id_usuario: int,
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    page: int = 1,
    fromDate: datetime = None,
    toDate: datetime = None,
    tipo: str = None,
    sort: str = "fecha_creacion",
    order: str = "desc",
    _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra", "Coordinador", "Director"])))

) -> list[EvolucionCompleta]:
    # Verificar que el paciente exista antes de listar evoluciones
    try:
        paciente = await PacienteService.get_paciente_por_id(id_usuario, db)
    except HTTPException:
        # Propagar HTTPException lanzada por el servicio (por ejemplo 404)
        raise
    if paciente is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    evoluciones = await EvolucionService.listar_evoluciones(
        id_usuario,
        db,
        limit,
        page,
        fromDate,
        toDate,
        tipo,
        sort,
        order
    )
    return evoluciones

# NUEVO ENDPOINT para obtener una evolucion por ID
@app.get("/pacientes/{id_usuario}/evoluciones/{id_evolucion}", summary="Obtener una evolucion de un paciente", tags=["Evoluciones"])
async def obtener_evolucion(
    id_usuario: int,
    id_evolucion: int,
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra", "Coordinador", "Director"])))
) -> EvolucionCompleta:
    # Verificar que el paciente exista y devolver detalle claro si no
    try:
        paciente = await PacienteService.get_paciente_por_id(id_usuario, db)
    except HTTPException:
        raise
    if paciente is None:
        raise HTTPException(status_code=404, detail=f"Paciente {id_usuario} no encontrado")

    evolucion = await EvolucionService.obtener_evolucion(
        id_usuario,
        id_evolucion,
        db
    )
    if evolucion is None:
        raise HTTPException(status_code=404, detail=f"Evolución {id_evolucion} no encontrada para el paciente {id_usuario}")
    return evolucion

@app.get("/pacientes/{id_usuario}/sots", summary="Listar SOTs de un paciente", tags=["SOT"])
async def listar_sots(
    id_usuario: int,
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    page: int = 1,
    fromDate: datetime = None,
    toDate: datetime = None,
    order: str = "desc",
    _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra", "Coordinador", "Director"])))
) -> list[SotCompleta]:
    # Verificar que el paciente exista antes de listar SOTs
    try:
        paciente = await PacienteService.get_paciente_por_id(id_usuario, db)
    except HTTPException:
        # Propagar HTTPException lanzada por el servicio (por ejemplo 404)
        raise
    if paciente is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    sots = await SotService.listar_sots(
        id_usuario,
        db,
        limit,
        page,
        fromDate,
        toDate,
        order
    )
    return sots

# Endpoints para foto de paciente
from fastapi import Body


#@app.post("/pacientes/{id_usuario}/foto", summary="Actualizar foto de paciente", tags=["Pacientes"])
#async def set_foto_paciente(id_usuario: int, foto_url: str = Body(...), db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Director"])))):
#    url = await PacienteService.set_foto_url(id_usuario, foto_url, db)
#    if url is None:
#        raise HTTPException(status_code=404, detail="Paciente no encontrado")
#    return {"foto_url": url}

#@app.get("/pacientes/{id_usuario}/foto", summary="Obtener foto de paciente", tags=["Pacientes"])
#async def get_foto_paciente(id_usuario: int, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Psicologo", "Psiquiatra", "Enfermera", "Coordinador", "Director", "Paciente"])))):
#    url = await PacienteService.get_foto_url(id_usuario, db)
#    if url is None:
#        raise HTTPException(status_code=404, detail="Paciente no encontrado o sin foto")
#    return {"foto_url": url}

#@app.delete("/pacientes/{id_usuario}/foto", summary="Eliminar foto de paciente", tags=["Pacientes"])
#async def delete_foto_paciente(id_usuario: int, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Director"])))):
#    ok = await PacienteService.delete_foto_url(id_usuario, db)
#    if not ok:
#        raise HTTPException(status_code=404, detail="Paciente no encontrado")
#    return {"detail": "Foto eliminada"}

# Endpoint para crear un SOT asociado a un paciente
@app.post("/pacientes/{id_usuario}/sots", summary="Registrar un SOT", tags=["SOT"], response_model=SotLeida, status_code=status.HTTP_201_CREATED)
async def crear_sot(
    id_usuario: int,
    input: SotCrear,
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra"])))
):
    try:
        sot = await SotService.crear_sot(id_usuario, input, db, get_user_id_authless(_token_payload))
        return sot
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint para crear evoluciones grupales
from typing import List as _List

@app.post("/evoluciones/grupal", summary="Crear evoluciones grupales", tags=["Evoluciones"], response_model=EvolucionGrupalRespuesta, status_code=status.HTTP_201_CREATED)
async def crear_evoluciones_grupales(
    input: EvolucionGrupalCrear,
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends(verify_role_is_in(["Psicologo", "Psiquiatra"]))
):
    
    resp = await EvolucionService.crear_evoluciones_grupales(input, db, get_user_id_authless(_token_payload))
    return resp

@app.put("/pacientes/{id_usuario}/sots/{id_sot}", summary="Actualizar un SOT", tags=["SOT"], response_model=SotLeida)
async def actualizar_sot(
    id_usuario: int,
    id_sot: int,
    input: SotActualizar,
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra", "Director"])))
):
    # Verificar que el paciente exista antes de actualizar el SOT
    try:
        paciente = await PacienteService.get_paciente_por_id(id_usuario, db)
    except HTTPException:
        raise
    if paciente is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    sot = await SotService.actualizar_sot(id_usuario, id_sot, input, db, get_user_id_authless(_token_payload))
    return sot

# Endpoint GET para búsqueda de pacientes
@app.get("/pacientes", summary="Buscar pacientes", tags=["Pacientes"])
async def buscar_pacientes(
    db: AsyncSession = Depends(get_db),
    #nombre: str | None = None,
    #apellido: str | None = None,
    nom_ap_dni: str | None = None,
    anio_ingreso_desde: int | None = None,
    anio_ingreso_hasta: int | None = None,
    genero: Genero | None = None,
    limit: int = 20,
    page: int = 1,
    order: str = "asc",
    sort: str | None = None,
    _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Psicologo", "Psiquiatra", "Coordinador", "Director"])))
) -> ResultadoBusqueda:
    pacientes = await PacienteService.buscar_pacientes(
        db=db,
        #nombre=nombre,
        #apellido=apellido,
        nom_ap_dni=nom_ap_dni,
        anio_ingreso_desde=anio_ingreso_desde,
        anio_ingreso_hasta=anio_ingreso_hasta,
        genero=genero,
        limit=limit,
        page=page,
        order=order,
        sort=sort,
    )
    return {**pacientes, "limit": limit}



# Endpoint para listar items DM
@app.get("/items-dm", summary="Listar Items DM", tags=["ItemDM"], response_model=_List[ItemDMLeida])
async def listar_items_dm(db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Psicologo", "Psiquiatra"])))):
    items = await ItemDMService.listar_items(db)
    return items

# Endpoints para diagnósticos multiaxiales

# No se usan?
#@app.get("/diagnosticos-multiaxiales", summary="Listar Diagnósticos Multiaxiales", tags=["DiagnosticoMultiaxial"], response_model=_List[DiagnosticoMultiaxialLeida])
#async def listar_diagnosticos_multiaxiales(db: AsyncSession = Depends(get_db)):
#    diagnosticos = await DiagnosticoMultiaxialService.listar_diagnosticos(db)
#    return diagnosticos

#@app.post("/diagnosticos-multiaxiales", summary="Crear Diagnóstico Multiaxial", tags=["DiagnosticoMultiaxial"], response_model=DiagnosticoMultiaxialLeida, status_code=status.HTTP_201_CREATED)
#async def crear_diagnostico_multiaxial(
#    input: DiagnosticoMultiaxialCrear,
#    db: AsyncSession = Depends(get_db)
#):
#    try:
#        diagnostico = await DiagnosticoMultiaxialService.crear_diagnostico(input, db)
#        return diagnostico
#    except Exception as e:
#        raise HTTPException(status_code=400, detail=str(e))
