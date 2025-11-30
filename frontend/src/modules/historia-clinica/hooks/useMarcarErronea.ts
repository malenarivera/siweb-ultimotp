import { useState } from 'react';
import axios from 'axios';
import { MARCAR_ERRONEA, MARCAR_ERRONEA_SOT } from '../services/historiaClinicaEndpoints';
import errorHandler from '@/globals/utils/errorHandler';
import { EvolucionCompleta } from '../types/EvolucionCompleta';
import getToken from '@/globals/utils/getToken';

export interface UseMarcarErronea {
  marcarErronea: (id_usuario: number | string, id_evolucion: number | string, body: {
    motivo_erronea: string
  }) => Promise<EvolucionCompleta | null>;
  
  marcarErroneaSOT: (id_usuario: number | string, id_sot: number | string, body: {
    motivo_erronea: string
  }) => Promise<any | null>;
  isLoading: boolean;
  error: string | null;
}

export const useMarcarErronea = (): UseMarcarErronea => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const marcarErronea = async (id_usuario: number | string, id_evolucion: number | string, 
    body: {
        motivo_erronea: string
    })  => {
    // remove empty string fields safely
    const payload: Partial<{ motivo_erronea: string }> = {};
    if (body.motivo_erronea) payload.motivo_erronea = body.motivo_erronea;
    setIsLoading(true);
    setError(null);
    console.log("vamos a cargar en la url: ", MARCAR_ERRONEA.URL(id_usuario, id_evolucion))
    let evolucion = null;
    try {
      const response = await axios({
        method: MARCAR_ERRONEA.METHOD,
        url: MARCAR_ERRONEA.URL(id_usuario, id_evolucion),
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        data: payload
      });
      evolucion = response.data;
    } catch (err) {
      console.error('Error al marcar como erronea la evolucion:', err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(errorHandler(err.response.data.detail));
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al marcar como erronea evolucion');
      }
    } finally {
      setIsLoading(false);
    }
    return evolucion;
  };

  const marcarErroneaSOT = async (id_usuario: number | string, id_sot: number | string,
    body: { motivo_erronea: string }) => {
    const payload: Partial<{ motivo_erronea: string }> = {};
    if (body.motivo_erronea) payload.motivo_erronea = body.motivo_erronea;
    setIsLoading(true);
    setError(null);
    let result = null;
    try {
      const response = await axios({
        method: MARCAR_ERRONEA_SOT.METHOD,
        url: MARCAR_ERRONEA_SOT.URL(id_usuario, id_sot),
        headers: {
              Authorization: `Bearer ${getToken()}`,
            },
        data: payload,
      });
      result = response.data;
    } catch (err) {
      console.error('Error al marcar SOT como erronea:', err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(errorHandler(err.response.data.detail));
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al marcar como erronea SOT');
      }
    } finally {
      setIsLoading(false);
    }
    return result;
  };


  return {
    marcarErronea,
    marcarErroneaSOT,
    isLoading,
    error,
  };
};

export default useMarcarErronea;