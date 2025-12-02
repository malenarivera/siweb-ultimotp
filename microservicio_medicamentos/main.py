from fastapi import FastAPI, status, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from schemas.receta_schema import RecetaCrear, RecetaCreada, RecetaLeer, EstadoRecetaActualizar
from schemas.ingreso_medicamento_schema import IngresoMedicamentoCrear, IngresoMedicamentoCreado
from schemas.egreso_medicamento_schema import EgresoMedicamentoCrear, EgresoMedicamentoCreado
from schemas.medicamento_schema import MedicamentoCrear, MedicamentoCreado, MedicamentoLeer, MedicamentoBuscar, ResultadoBusquedaMedicamentos
from services.receta_service import RecetaService
from services.egreso_medicamento_service import EgresoMedicamentoService
from services.ingreso_medicamento_service import IngresoMedicamentoService
from services.medicamento_service import MedicamentoService
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, init_db, close_db
from core.auth import verify_role, verify_role_is_in, get_user_id_authless

app = FastAPI(
    title="API Medicamentos",
    version="Merequetengue Edition",
    description="API de Medicamentos para la app CRZ"
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


@app.post("/medicamentos/receta/", summary="Cargar una Receta", tags=["Recetas"], status_code=status.HTTP_201_CREATED)
async def crear_receta(
    input: RecetaCrear, 
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends(verify_role("Psiquiatra"))  # Solo psiquiatras pueden crear recetas
) -> RecetaCreada:
    try:
        receta = await RecetaService.crear_receta(input, db)
        return receta
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/medicamentos/receta/buscarPorProfesional", summary="Buscar recetas por profesional", tags=["Recetas"])
async def buscar_recetas_por_profesional(
    idProfesional: int = Query(..., description="ID del profesional"),
    cantidadATraer: int = Query(..., description="Cantidad de recetas a traer"),
    estado: str | None = Query(None, description="Estado de la receta (opcional)"),
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends(verify_role_is_in(["Psicologo", "Psiquiatra", "Director", "Coordinador", "Enfermera"]))
) -> list[RecetaLeer]:
    try:
        recetas = await RecetaService.buscarReceta_por_profesional(
            id_profesional=idProfesional,
            cantidad_a_traer=cantidadATraer,
            db=db,
            estado=estado
        )
        return recetas
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.patch("/medicamentos/receta/{id_receta}/estado", summary="Actualizar estado de una receta", tags=["Recetas"])
async def actualizar_estado_receta(
    id_receta: int,
    estado_data: EstadoRecetaActualizar,
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends(verify_role("Psiquiatra"))  # Solo psiquiatras pueden actualizar recetas
) -> RecetaLeer:
    try:
        receta = await RecetaService.actualizar_estado_receta(
            id_receta=id_receta,
            estado=estado_data.estado,
            db=db
        )
        if receta is None:
            raise HTTPException(status_code=404, detail="Receta no encontrada")
        return receta
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/medicamentos/registrarEgreso", summary="Registrar egreso de medicamento", tags=["Egresos Medicamentos"])
async def registrar_egreso_medicamento(
    input: EgresoMedicamentoCrear, 
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends(verify_role("Enfermera"))  # Solo enfermeras pueden registrar egresos
) -> EgresoMedicamentoCreado:
    try:
        egreso_medicamento = await EgresoMedicamentoService.registrar_egreso_medicamento(input, db, get_user_id_authless(_token_payload))
        return egreso_medicamento
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        


@app.post("/medicamentos/registrarIngreso", summary="Registrar ingreso de medicamento", tags=["Ingresos Medicamentos"])
async def registrar_ingreso_medicamento(
    input: IngresoMedicamentoCrear, 
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends(verify_role("Enfermera"))  # Solo enfermeras pueden registrar ingresos
) -> IngresoMedicamentoCreado:
    try:
        ingreso_medicamento = await IngresoMedicamentoService.registrar_ingreso_medicamento(input, db, get_user_id_authless(_token_payload))
        return ingreso_medicamento
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/medicamentos/obtenerMedicamentos", summary="Obtener medicamentos", tags=["Medicamentos"])
async def obtener_medicamentos(
    laboratorio_titular: str | None = Query(None, description="Filtrar por laboratorio titular"),
    nombre_comercial: str | None = Query(None, description="Filtrar por nombre comercial"),
    nombre_generico: str | None = Query(None, description="Filtrar por nombre genérico"),
    nomCom_NomGene: str | None = Query(None, description="Filtrar por nombre comercial o genérico"),
    concentracion: str | None = Query(None, description="Filtrar por concentración"),
    forma_farmaceutica: str | None = Query(None, description="Filtrar por forma farmacéutica"),
    presentacion: str | None = Query(None, description="Filtrar por presentación"),
    limit: int = Query(20, description="Cantidad de resultados a devolver"),
    db: AsyncSession = Depends(get_db),
    _token_payload: dict = Depends(verify_role_is_in(["Psicologo", "Psiquiatra", "Director", "Coordinador", "Enfermera"]))
) -> ResultadoBusquedaMedicamentos:
    try:
        # Crear objeto de filtros
        filtros = MedicamentoBuscar(
            laboratorio_titular=laboratorio_titular,
            nombre_comercial=nombre_comercial,
            nombre_generico=nombre_generico,
            nomCom_NomGene=nomCom_NomGene,
            concentracion=concentracion,
            forma_farmaceutica=forma_farmaceutica,
            presentacion=presentacion
        )
        
        # Si no hay filtros, usar el método original
        if all(v is None for v in filtros.dict().values()):
            medicamentos = await MedicamentoService.obtener_medicamentos(db)
            return {"medicamentos": medicamentos, "total": len(medicamentos), "limit": limit}
        else:
            resultado = await MedicamentoService.buscar_medicamentos(filtros, db)
            return {**resultado, "limit": limit}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
