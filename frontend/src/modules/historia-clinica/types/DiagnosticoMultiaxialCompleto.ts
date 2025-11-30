/*
Referencia

class DiagnosticoMultiaxialCompleto(BaseModel):
    # Con datos listos para usar en el front
    id_diagnostico_multiaxial: int
    creacion: DatosCreacion
    item_1: ItemDMBase
    item_2: ItemDMBase
    item_3: ItemDMBase
    item_4: ItemDMBase
    item_5: ItemDMBase

*/

import { ItemDM } from "./ItemDM"

interface DatosCreacion {
    nombre: string,
    id_usuario: number | string,
    fecha: Date
}

export interface DiagnosticoMultiaxialCompleto {
    id_diagnostico_multiaxial: number | string,
    creacion: DatosCreacion,
    item_1: ItemDM,
    item_2: ItemDM,
    item_3: ItemDM,
    item_4: ItemDM,
    item_5: ItemDM
}