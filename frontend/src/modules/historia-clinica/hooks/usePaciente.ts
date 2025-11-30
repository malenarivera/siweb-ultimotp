import { useState, useEffect, useCallback } from 'react';
import { fetchPaciente } from '../services/pacientesService';

export default function usePaciente(id_usuario?: string | number) {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (id_usuario === undefined || id_usuario === null) {
      setData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPaciente(id_usuario);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.response.data.detail : 'Error al obtener paciente');
    } finally {
      setIsLoading(false);
    }
  }, [id_usuario]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    reload: load,
    setData,
  } as const;
}
