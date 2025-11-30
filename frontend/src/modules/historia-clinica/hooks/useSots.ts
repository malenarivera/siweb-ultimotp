import { useState, useEffect, useCallback } from 'react';
import { fetchSots } from '../services/sotsService';

export default function useSots(id_usuario?: string | number) {
  const [data, setData] = useState<any[] | null>(null);
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
      const res = await fetchSots(id_usuario);
      // sort by creacion.fecha descending so newest first
      const sorted = Array.isArray(res) ? [...res].sort((a, b) => {
        const at = a?.creacion?.fecha ? Date.parse(String(a.creacion.fecha)) : 0;
        const bt = b?.creacion?.fecha ? Date.parse(String(b.creacion.fecha)) : 0;
        return bt - at;
      }) : res;
      setData(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener SOTs');
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
