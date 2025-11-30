import { useState } from 'react';
import axios from 'axios';
import { EvolucionCompleta } from '../types/EvolucionCompleta';
import { OBTENER_EVOLUCION } from '../services/historiaClinicaEndpoints';
import errorHandler from '@/globals/utils/errorHandler';
import getToken from '@/globals/utils/getToken';


export interface UseEvolucionReturn {
  obtenerEvolucion: (id_usuario: number | string, id_evolucion: number | string) => Promise<EvolucionCompleta | null>;
  evolucion: EvolucionCompleta | null;
  isLoading: boolean;
  error: string | null;
}

export const useObtenerEvolucion = (): UseEvolucionReturn => {
  const [evolucion, setEvolucion] = useState<EvolucionCompleta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerEvolucion = async (id_usuario: number | string, id_evolucion: number | string) => {
    setIsLoading(true);
    setError(null);
    let evolucion: EvolucionCompleta | null = null;
    try {
      const response = await axios({
        method: OBTENER_EVOLUCION.METHOD,
        headers: {
              Authorization: `Bearer ${getToken()}`,
            },
        url: OBTENER_EVOLUCION.URL(id_usuario, id_evolucion)
      });
      evolucion = response.data;
    } catch (err) {
      console.error('Error al obtener la evolucion:', err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(errorHandler(err.response.data.detail));
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al obtener la evolucion');
      }
    } finally {
      setIsLoading(false);
    }
    setEvolucion(evolucion);
    return evolucion;
  };


  return {
    obtenerEvolucion,
    evolucion,
    isLoading,
    error,
  };
};

export default useObtenerEvolucion;