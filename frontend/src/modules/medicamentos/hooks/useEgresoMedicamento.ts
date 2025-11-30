import { useState } from "react";
import axios from "axios";
import errorHandler from "@/globals/utils/errorHandler";
import {
  REGISTRAR_EGRESO_MEDICAMENTO_ENDPOINT,
  RegistrarEgresoMedicamentoPayload,
} from "../services/registrarEgresoMedicamento";
import getToken from "@/globals/utils/getToken";

interface UseEgresoMedicamentoReturn {
  registrarEgresoMedicamento: (
    payload: RegistrarEgresoMedicamentoPayload
  ) => Promise<unknown>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  responseData: unknown;
  reset: () => void;
}

export const useEgresoMedicamento = (): UseEgresoMedicamentoReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseData, setResponseData] = useState<unknown>(null);

  const registrarEgresoMedicamento = async (
    payload: RegistrarEgresoMedicamentoPayload
  ) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const url = REGISTRAR_EGRESO_MEDICAMENTO_ENDPOINT.URL();
      const response = await axios({
        method: REGISTRAR_EGRESO_MEDICAMENTO_ENDPOINT.METHOD,
        url,
        headers: {
              Authorization: `Bearer ${getToken()}`,
            },
        data: payload
      });

      setResponseData(response.data);
      setIsSuccess(true);
      return response.data;
    } catch (err) {
      let message = "Error desconocido al registrar ingreso de medicamento";

      if (err instanceof Error && err.message === "La URL base de medicamentos no está configurada") {
        message = err.message;
      } else if (axios.isAxiosError(err)) {
        if (err.response?.data?.detail) {
          message = errorHandler(err.response.data.detail);
        } else if (err.message) {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      setIsSuccess(false);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsSuccess(false);
    setResponseData(null);
  };

  return {
    registrarEgresoMedicamento,
    isLoading,
    error,
    isSuccess,
    responseData,
    reset,
  };
};

export default useEgresoMedicamento;
