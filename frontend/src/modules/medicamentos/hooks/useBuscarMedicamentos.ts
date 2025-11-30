import { useState } from 'react';
import axios from 'axios';
import { Medicamento } from '../types/Medicamento';
import { BUSCAR_MEDICAMENTOS_ENDPOINT, BuscarMedicamentosParams } from '../services/buscarMedicamentosEndpoint';
import errorHandler from '@/globals/utils/errorHandler';
import sortData from '@/globals/utils/sortData';
import getToken from '@/globals/utils/getToken';

export interface UseBuscarMedicamentosReturn {
  buscarMedicamentos: (params: BuscarMedicamentosParams) => Promise<void>;
  medicamentos: Medicamento[];
  totalMedicamentos: number;
  getTotalPages: (limit: number) => number;
  isLoading: boolean;
  error: string | null;
}

export const useBuscarMedicamentos = (): UseBuscarMedicamentosReturn => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [totalMedicamentos, setTotalMedicamentos] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarMedicamentos = async (params: BuscarMedicamentosParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await axios({
        method: BUSCAR_MEDICAMENTOS_ENDPOINT.METHOD,
        headers: {
              Authorization: `Bearer ${getToken()}`,
            },
        url: BUSCAR_MEDICAMENTOS_ENDPOINT.URL(params)
      });

      const data = response.data;
      const requestedLimit = params.limit && params.limit > 0 ? params.limit : undefined;
      const requestedPage = params.page && params.page > 0 ? params.page : 1;

      if (Array.isArray(data)) {
        const sorted = sortData<Medicamento>(data, params.sort, params.order as 'asc' | 'desc');
        const paginated = requestedLimit
          ? sorted.slice((requestedPage - 1) * requestedLimit, requestedPage * requestedLimit)
          : sorted;

        setMedicamentos(paginated);
        setTotalMedicamentos(data.length);
      } else {
        // El backend devuelve un objeto con: { medicamentos: [...], total: number, limit: number }
        const {
          medicamentos: medicamentosData = [],
          total = 0,
          limit: serverLimit,
        } = data ?? {};

        const sorted = sortData<Medicamento>(medicamentosData, params.sort, params.order as 'asc' | 'desc');
        const effectiveLimit = requestedLimit ?? (typeof serverLimit === "number" ? serverLimit : undefined);
        const paginated = effectiveLimit
          ? sorted.slice((requestedPage - 1) * effectiveLimit, requestedPage * effectiveLimit)
          : sorted;

        setMedicamentos(paginated);
        setTotalMedicamentos(
          typeof total === "number" ? total : medicamentosData?.length ?? 0
        );
      }
    } catch (err) {
      console.error('Error al buscar medicamentos:', err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(errorHandler(err.response.data.detail));
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al buscar medicamentos');
      }
      setMedicamentos([]);
      setTotalMedicamentos(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPages = (limit: number): number => {
    if (limit <= 0 || totalMedicamentos === 0) return 0;
    const pages = Math.floor(totalMedicamentos / limit);
    return totalMedicamentos % limit !== 0 ? pages + 1 : pages;
  };

  return {
    buscarMedicamentos,
    medicamentos,
    totalMedicamentos,
    getTotalPages,
    isLoading,
    error,
  };
};

export default useBuscarMedicamentos;

