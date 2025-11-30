import { useState } from "react";
import REGISTRAR_PACIENTE_ENDPOINT, { RegistrarPacienteData } from "../services/registrarPacienteEndpoint";
import errorHandler from '@/globals/utils/errorHandler';
import getToken from "@/globals/utils/getToken";

export function useRegistrarPaciente() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarPaciente = async (data: RegistrarPacienteData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mapear campos del frontend al backend (camelCase -> snake_case)
      const fieldMapping: { [key: string]: string } = {
        nombres: 'nombre',
        fechaNacimiento: 'fecha_nacimiento',
        fehcaNacimiento: 'fecha_nacimiento', // Typo del componente
        fechaIngreso: 'fecha_ingreso',
        obraSocial: 'obra_social'
      };
      
      // Construir objeto JSON con los campos mapeados
      const payload: { [key: string]: any } = {};
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Ignorar campos que no acepta el backend
          if (['fotoPerfil', 'nroSocio', 'calle', 'numero', 'piso', 'dpto'].includes(key)) {
            return;
          }
          
          const fieldName = fieldMapping[key] || key;
          
          // Normalizar género a minúsculas
          if (fieldName === 'genero') {
            payload[fieldName] = String(value).toLowerCase();
          } else {
            payload[fieldName] = value;
          }
        }
      });

      const response = await fetch(
        REGISTRAR_PACIENTE_ENDPOINT.URL(),
        {
          method: REGISTRAR_PACIENTE_ENDPOINT.METHOD,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar paciente');
      }

      const responseData = await response.json();
      setIsLoading(false);
      return responseData;

    } catch (error: any) {
      const errorMessage = errorHandler(error.message || error);
      setError(errorMessage);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    registrarPaciente,
    isLoading,
    error,
  };
}