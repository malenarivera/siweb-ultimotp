import { useState } from 'react';
import axios from 'axios';
import { ItemDM } from '../types/ItemDM';
import { OBTENER_ITEMS_DM } from '../services/historiaClinicaEndpoints';
import errorHandler from '@/globals/utils/errorHandler';
import getToken from '@/globals/utils/getToken';


export interface UseItemsDMReturn {
  obtenerItemsDM: () => Promise<ItemDM[]>;
  itemsDM: ItemDM[];
  isLoading: boolean;
  error: string | null;
}

export const useObtenerItemsDM = (): UseItemsDMReturn => {
  const [itemsDM, setItemsDM] = useState<ItemDM[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerItemsDM = async () => {
    setIsLoading(true);
    setError(null);
    let itemsDM: ItemDM[] = []
    try {
      const response = await axios({
        method: OBTENER_ITEMS_DM.METHOD,
        headers: {
              Authorization: `Bearer ${getToken()}`,
            },
        url: OBTENER_ITEMS_DM.URL
      });
      itemsDM = response.data;
    } catch (err) {
      console.error('Error al obtener los Items del diagnostico multiaxial:', err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(errorHandler(err.response.data.detail));
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al obtener los Items del Diagnostico Multiaxial');
      }
      itemsDM = []
    } finally {
      setIsLoading(false);
    }
    setItemsDM(itemsDM);
    return itemsDM;
  };


  return {
    obtenerItemsDM,
    itemsDM,
    isLoading,
    error,
  };
};

export default useObtenerItemsDM;