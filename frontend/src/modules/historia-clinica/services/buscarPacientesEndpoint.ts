import { BASE_URL_HISTORIA_CLINICA } from '@/globals/services/config';

export interface BuscarPacientesParams {
  nom_ap_dni?: string;
  anio_ingreso_desde?: string;
  anio_ingreso_hasta?: string;
  genero?: string;
  limit?: number;
  page?: number;
  order?: string;
  sort?: string;
}

const buildQueryString = (params: BuscarPacientesParams): string => {
  const queryParams: string[] = [];
  
  if (params.nom_ap_dni) queryParams.push(`nom_ap_dni=${encodeURIComponent(params.nom_ap_dni)}`);
  if (params.anio_ingreso_desde) queryParams.push(`anio_ingreso_desde=${encodeURIComponent(params.anio_ingreso_desde)}`);
  if (params.anio_ingreso_hasta) queryParams.push(`anio_ingreso_hasta=${encodeURIComponent(params.anio_ingreso_hasta)}`);
  if (params.genero) queryParams.push(`genero=${encodeURIComponent(params.genero)}`);
  if (params.limit) queryParams.push(`limit=${params.limit}`);
  if (params.page) queryParams.push(`page=${params.page}`);
  if (params.order) queryParams.push(`order=${encodeURIComponent(params.order)}`);
  if (params.sort) queryParams.push(`sort=${encodeURIComponent(params.sort)}`);
  
  return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
};

export const BUSCAR_PACIENTES_ENDPOINT = {
  URL: (params: BuscarPacientesParams) => `${BASE_URL_HISTORIA_CLINICA}/pacientes${buildQueryString(params)}`,
  METHOD: 'get' as const
};

export default BUSCAR_PACIENTES_ENDPOINT;

