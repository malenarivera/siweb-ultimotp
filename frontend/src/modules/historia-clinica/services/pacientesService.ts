import axios from 'axios';
import { OBTENER_PACIENTE } from './historiaClinicaEndpoints';
import getToken from '@/globals/utils/getToken';

export async function fetchPaciente(id_usuario: string | number) {
  const response = await axios({
    method: OBTENER_PACIENTE.METHOD,
    headers: {
                Authorization: `Bearer ${getToken()}`,
    },
    url: OBTENER_PACIENTE.URL(id_usuario),
  });
  return response.data;
}

export default { fetchPaciente };