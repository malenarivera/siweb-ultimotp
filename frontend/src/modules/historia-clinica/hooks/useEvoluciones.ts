import { useState, useEffect, useCallback } from 'react';
import { EvolucionCompleta } from '../types/EvolucionCompleta';
import { fetchEvoluciones } from '../services/evolucionesService';

export default function useEvoluciones(id_usuario?: string | number) {
  const [data, setData] = useState<EvolucionCompleta[] | null>(null);
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
      const res = await fetchEvoluciones(id_usuario);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.detail ? err.response.data.detail : err instanceof Error ? err.message : 'Error al obtener evoluciones');
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
