import { useState } from "react";
import REGISTRAR_PERSONAL_ENDPOINT, {RegistrarPersonalData}  from "../services/registrarPersonalEndpoint";
import errorHandler from '@/globals/utils/errorHandler';
import getToken from "@/globals/utils/getToken";

export function useRegistrarPersonal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarPersonal = async (data: RegistrarPersonalData) => {
    setIsLoading(true);
    setError(null);
    
    try {

      // Build payload matching backend's CrearPersonal schema
      const payload: Record<string, unknown> = {
        tipo: data.tipo,
        dni: data.dni,
        nombre: data.nombre,
        apellido: data.apellido,
        genero: data.genero,
      };

      if (data.matricula) payload.matricula = data.matricula;
      if (data.email) payload.email = data.email;
      if (data.telefono) payload.telefono = data.telefono;
      // fecha_nacimiento should be sent as YYYY-MM-DD or omitted
      if (data.fecha_nacimiento) {
        // If frontend stored an ISO datetime, take only the date part
        payload.fecha_nacimiento = String(data.fecha_nacimiento).slice(0, 10);
      }

      const response = await fetch(
        REGISTRAR_PERSONAL_ENDPOINT.URL(),
        {
          method: REGISTRAR_PERSONAL_ENDPOINT.METHOD,
          headers: {
            ...REGISTRAR_PERSONAL_ENDPOINT.headers,
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData)
        throw new Error(errorData.detail || 'Error al registrar personal');
      }

      const responseData = await response.json();
      return responseData;

    } catch (error: any) {
      const errorMessage = errorHandler(error?.message ?? String(error));
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registrarPersonal,
    isLoading,
    error,
  };
}