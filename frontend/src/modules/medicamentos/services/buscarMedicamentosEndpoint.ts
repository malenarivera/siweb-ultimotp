import { BASE_URL_MEDICAMENTOS } from '@/globals/services/config';

export interface BuscarMedicamentosParams {
  nomCom_NomGene?: string;
  laboratorio_titular?: string;
  concentracion?: string;
  forma_farmaceutica?: string;
  presentacion?: string;
  limit?: number;
  page?: number;
  order?: string;
  sort?: string;
}

const buildQueryString = (params: BuscarMedicamentosParams): string => {
  const queryParams: string[] = [];
  
  if (params.nomCom_NomGene) queryParams.push(`nomCom_NomGene=${encodeURIComponent(params.nomCom_NomGene)}`);
  if (params.laboratorio_titular) queryParams.push(`laboratorio_titular=${encodeURIComponent(params.laboratorio_titular)}`);
  if (params.concentracion) queryParams.push(`concentracion=${encodeURIComponent(params.concentracion)}`);
  if (params.forma_farmaceutica) queryParams.push(`forma_farmaceutica=${encodeURIComponent(params.forma_farmaceutica)}`);
  if (params.presentacion) queryParams.push(`presentacion=${encodeURIComponent(params.presentacion)}`);
  if (params.limit) queryParams.push(`limit=${params.limit}`);
  if (params.page) queryParams.push(`page=${params.page}`);
  if (params.order) queryParams.push(`order=${encodeURIComponent(params.order)}`);
  if (params.sort) queryParams.push(`sort=${encodeURIComponent(params.sort)}`);
  
  return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
};

export const BUSCAR_MEDICAMENTOS_ENDPOINT = {
  URL: (params: BuscarMedicamentosParams) => `${BASE_URL_MEDICAMENTOS}/medicamentos/obtenerMedicamentos${buildQueryString(params)}`,
  METHOD: 'get' as const
};

export default BUSCAR_MEDICAMENTOS_ENDPOINT;

