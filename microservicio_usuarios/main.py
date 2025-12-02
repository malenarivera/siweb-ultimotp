from fastapi import FastAPI, status, Depends, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from schemas.profesional_schema import CrearPersonal, PersonalCreado, BusquedaPersonal, TipoPersonal, Genero, UnPersonal, DetalleBaja, EditarPersonal
from schemas.usuario_schema import CargarUsuarioBase, UnUsuario, EditarUsuarioBase, DesactivarUsuarioBase
from services.profesional_service import ProfesionalService, OrdenarPor
from services.usuario_service import UsuarioService
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, init_db, close_db
from datetime import datetime
from core.auth import get_user_rol, get_user_id, verify_token, verify_role, verify_role_is_in, get_user_id_authless

app = FastAPI(
    title="API Usuarios",
    version="0.1",
    description="API de Personal para la app CRZ"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_seeded = False 

@app.on_event("startup")
async def startup_event():
    await init_db()
    global db_seeded
    db_seeded = True

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

@app.get("/health") # para que los otros microservicios esperen a que la carga a la BD se haya hecho
async def health():
    if db_seeded:
        return {"status": "ok"}
    else:
        return {"status": "seeding"}, 503

@app.post("/personal/", summary="Cargar Personal de la Clinica", tags=["Personal"])
async def crear_personal(input: CrearPersonal,  response: Response, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Coordinador", "Director"])))) -> PersonalCreado:
    try:
        personal = await ProfesionalService.crear_profesional(input, db, False, get_user_id_authless(_token_payload))
        response.headers["Location"] = f"/personal/{personal.id_usuario}"
        response.status_code = 201
        return personal
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/personal", summary="Buscar Personal de la Clinica", tags=["Personal"], status_code=200)
async def buscar_personal(
    db: AsyncSession = Depends(get_db),
    tipo: TipoPersonal | None = None,
    dni: str | None = None,
    nombre: str | None = None,
    apellido: str | None = None,
    genero: Genero | None = None,
    activo: bool | None = None,
    limit: int = 20,
    offset: int = 0,
    sortBy: OrdenarPor | None = None,
    _token_payload: dict = Depends((verify_role_is_in(["Coordinador", "Director", "Psiquiatra", "Enfermera"])))
) -> list[BusquedaPersonal]:
    personal = await ProfesionalService.buscar_profesional(
        db=db,
        tipo=tipo,
        dni=dni,
        nombre=nombre,
        apellido=apellido,
        genero=genero,
        activo=activo,
        limit=limit,
        offset=offset,
        sortBy=sortBy
    )
    return personal

#interno
@app.get("/personal/usuario_base/es_admin/{id_usuario}", include_in_schema=False, status_code=200)
async def es_admin(id_usuario: int, db:AsyncSession = Depends(get_db)):
    esAdmin = await UsuarioService.usuario_es_admin(db, id_usuario)
    return {"admin": esAdmin}

@app.post("/personal/usuario_base", include_in_schema=False, status_code=201)
async def crear_usuario(input: CargarUsuarioBase, db:AsyncSession = Depends(get_db), _token_payload: dict = Depends(verify_role("Secretaria"))) -> PersonalCreado:
    print(f"Mis IDS: {get_user_id_authless(_token_payload)} o {get_user_id(_token_payload)}")
    id = await UsuarioService.crear_usuario(db, input.nombre, input.apellido, input.email, input.telefono, input.sembrado, get_user_id_authless(_token_payload))
    await UsuarioService.asignar_rol_auth0(id, input.rol)
    return {"id_usuario": id}

@app.get("/personal/usuario_base/{id_usuario}", include_in_schema=False, status_code=200)
async def obtener_usuario(id_usuario: int, db:AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Director", "Psiquiatra", "Psicologo", "Coordinador", "Enfermera", "Paciente"])))) -> UnUsuario:
    try:
        return await UsuarioService.obtener_usuario(db, id_usuario)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/personal/usuario_base/{id_usuario}", include_in_schema=False, status_code=200)
async def modificar_usuario(id_usuario: int, input: EditarUsuarioBase, db:AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Director"])))) -> UnUsuario:
    try:
        return await UsuarioService.editar_usuario_y_devolver(db, id_usuario, datetime.now(), input.email, input.telefono, get_user_id_authless(_token_payload))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/personal/usuario_base/{id_usuario}", include_in_schema=False, status_code=200)
async def desactivar_usuario(id_usuario: int, input: DesactivarUsuarioBase, db:AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Secretaria", "Director"])))):
    await UsuarioService.desactivar_usuario(id_usuario, input.motivo, db, get_user_id_authless(_token_payload))
    return {}


@app.get("/personal/{id_usuario}", summary="Obtener Personal por ID", tags=["Personal"], status_code=200)
async def obtener_personal(id_usuario: int, db: AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Coordinador", "Director", "Psicologo", "Psiquiatra", "Enfermera", "Secretaria"])))) -> UnPersonal:
    try:
        personal = await ProfesionalService.obtener_personal(id_usuario, db)
        return personal
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# Para Testing
@app.delete("/personal/refresh_users", summary="Vuelve al estado inicial del sembrado, eliminando usuarios de la BD y de Auth0", tags=["Testing"], status_code=200)
async def refresh(db:AsyncSession = Depends(get_db)):
    return await UsuarioService.refresh(db)
    
@app.delete("/personal/{id_usuario}", summary="Dar de baja a un Personal", tags=["Personal"], status_code=204)
async def dar_de_baja_personal(id_usuario: int, motivo: DetalleBaja, db:AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Coordinador", "Director"])))):
    dado_de_daja = await UsuarioService.desactivar_usuario_personal(id_usuario, motivo.motivo, db, get_user_id_authless(_token_payload))
    return {}

@app.patch("/personal/{id_usuario}", summary="Modificar datos de un Personal", tags=["Personal"], status_code=200)
async def modificar_personal(id_usuario: int, input: EditarPersonal, db:AsyncSession = Depends(get_db), _token_payload: dict = Depends((verify_role_is_in(["Coordinador", "Director"])))) -> UnPersonal:
    return await ProfesionalService.editar_personal(id_usuario, input, db, get_user_id_authless(_token_payload))

@app.get("/test-tokes")
def test_token(token_payload: dict = Depends(verify_token)):
    #'auth0|11'
    return {"id": get_user_id(token_payload), "rol": get_user_rol(token_payload)}