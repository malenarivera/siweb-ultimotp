import axios from 'axios';
import { OBTENER_SOTS } from './historiaClinicaEndpoints';
import getToken from '@/globals/utils/getToken';

export async function fetchSots(id_usuario: string | number) {
  const response = await axios({
    method: OBTENER_SOTS.METHOD,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    url: OBTENER_SOTS.URL(id_usuario),
  });
  return response.data;
}

export default { fetchSots };
