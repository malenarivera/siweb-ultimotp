/* REFERENCIA
{
  "observacion": "string",            // obligatorio
  "id_turno": "string|null",           // id del turno
  "id_item1": "string",           // id del item correspondiente al primer eje del diagnostico multiaxial
  "id_item2": "string",           //analogo a id_item1 pero con el segundo eje
  "id_item3": "string",          //analogo a id_item1 pero con el terce eje
  "id_item4": "string",          //analogo a id_item1 pero con el cuarto eje
  "id_item5": "string"          //analogo a id_item1 pero con el quinto eje

}
*/

export interface CargaEvolucion {
    observacion: string,
    id_item1: string,
    id_item2: string,
    id_item3: string,
    id_item4: string,
    id_item5: string,
}