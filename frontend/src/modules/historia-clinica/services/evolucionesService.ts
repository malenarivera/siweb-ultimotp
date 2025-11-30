import axios from 'axios';
import { OBTENER_EVOLUCIONES } from './historiaClinicaEndpoints';
import { EvolucionCompleta } from '../types/EvolucionCompleta';
import getToken from '@/globals/utils/getToken';

export async function fetchEvoluciones(id_usuario: string | number): Promise<EvolucionCompleta[]> {
  const response = await axios({
    method: OBTENER_EVOLUCIONES.METHOD,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    url: OBTENER_EVOLUCIONES.URL(id_usuario),
  });
  return response.data;
}

export default {
  fetchEvoluciones,
};
