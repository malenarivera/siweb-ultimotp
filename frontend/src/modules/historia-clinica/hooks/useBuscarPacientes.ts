import { useState } from 'react';
import axios from 'axios';
import { Paciente } from '../types/Paciente';
import { BUSCAR_PACIENTES_ENDPOINT, BuscarPacientesParams } from '../services/buscarPacientesEndpoint';
import errorHandler from '@/globals/utils/errorHandler';
import getToken from '@/globals/utils/getToken';

export interface UseBuscarPacientesReturn {
  buscarPacientes: (params: BuscarPacientesParams) => Promise<void>;
  pacientes: Paciente[];
  totalPacientes: number;
  //sortBy: string;
  //order: string;
  getTotalPages: (limit: number) => number;
  isLoading: boolean;
  error: string | null;
}

export const useBuscarPacientes = (): UseBuscarPacientesReturn => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  /*
  const [sortBy, setSortBy] = useState<string>("apellido");
  const [order, setOrder] = useState<string>("asc");
  */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarPacientes = async (params: BuscarPacientesParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        method: BUSCAR_PACIENTES_ENDPOINT.METHOD,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        url: BUSCAR_PACIENTES_ENDPOINT.URL(params),
      });

      // El backend devuelve un objeto con: { pacientes: [...], total: number, limit: number }
      const { pacientes: pacientesData, total } = response.data;
      
      setPacientes(pacientesData);
      setTotalPacientes(total);
    } catch (err) {
      console.error('Error al buscar pacientes:', err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(errorHandler(err.response.data.detail));
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al buscar pacientes');
      }
      setPacientes([]);
      setTotalPacientes(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPages = (limit: number): number => {
    if (limit <= 0 || totalPacientes === 0) return 0;
    const pages = Math.floor(totalPacientes / limit);
    return totalPacientes % limit !== 0 ? pages + 1 : pages;
  };

  return {
    buscarPacientes,
    pacientes,
    totalPacientes,
    //order,
    //sortBy,
    getTotalPages,
    isLoading,
    error,
  };
};

export default useBuscarPacientes;