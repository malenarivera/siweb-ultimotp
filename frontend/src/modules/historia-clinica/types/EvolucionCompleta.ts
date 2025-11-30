/*
 REFERENCIA 
 class EvolucionCompleta(BaseModel):
    # Con datos listos para usar en el front
    id_usuario: int
    id_evolucion: int
    tipo: TipoEvolucion
    observacion: str
    id_turno: int | None = None
    diagnostico: DiagnosticoMultiaxialCompleto | None
    creacion: DatosCreacion
    erronea: DatosErronea | None = None
*/
import { DiagnosticoMultiaxialCompleto } from "./DiagnosticoMultiaxialCompleto"

interface DatosCreacion {
    nombre: string,
    id_usuario: number | string,
    fecha: Date
}

interface DatosErronea {
    nombre: string,
    id_usuario: number | string,
    fecha: Date,
    motivo: string
}

export interface EvolucionCompleta {
    id_usuario: number | string,
    id_evolucion: number | string,
    tipo: string,
    observacion: string,
    id_turno: number | string | null,
    diagnostico: DiagnosticoMultiaxialCompleto | null,
    creacion: DatosCreacion,
    erronea: DatosErronea | null
}