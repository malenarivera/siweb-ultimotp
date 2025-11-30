import { useState } from 'react';
import axios from 'axios';
import { CargaEvolucion } from '../types/CargaEvolucion';
import { CARGAR_EVOLUCION } from '../services/historiaClinicaEndpoints';
import errorHandler from '@/globals/utils/errorHandler';
import getToken from '@/globals/utils/getToken';


export interface UseItemsDMReturn {
  cargarEvolucion: (id_usuario: number, body: CargaEvolucion) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useCargarEvolucion = (): UseItemsDMReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEvolucion = async (id_usuario: number | string, body: CargaEvolucion)  => {
    //retiramos los inputs con ""
    Object.entries(body).forEach(([key, value]) => {
      if(!value)
        delete body[key];
    });
    setIsLoading(true);
    setError(null);
    console.log("vamos a cargar en la url: ", CARGAR_EVOLUCION.URL(id_usuario))
    let id_evolucion_cargada = null;
    try {
      const response = await axios({
        method: CARGAR_EVOLUCION.METHOD,
        url: CARGAR_EVOLUCION.URL(id_usuario),
        headers: {
                    Authorization: `Bearer ${getToken()}`,
        },
        data: body
      });
      id_evolucion_cargada = response.data.id_evolucion;
    } catch (err) {
      console.error('Error al cargar evolucion:', err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(errorHandler(err.response.data.detail));
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar evolucion');
      }
    } finally {
      setIsLoading(false);
    }
    return id_evolucion_cargada;
  };


  return {
    cargarEvolucion,
    isLoading,
    error,
  };
};

export default useCargarEvolucion;