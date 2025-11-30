import { useState } from "react";
import axios from "axios";
import errorHandler from "@/globals/utils/errorHandler";
import {
  REGISTRAR_INGRESO_MEDICAMENTO_ENDPOINT,
  RegistrarIngresoMedicamentoPayload,
} from "../services/registarIngresoMedicamento";

interface UseIngresoMedicamentoReturn {
  registrarIngresoMedicamento: (
    payload: RegistrarIngresoMedicamentoPayload
  ) => Promise<unknown>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  responseData: unknown;
  reset: () => void;
}

export const useIngresoMedicamento = (): UseIngresoMedicamentoReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseData, setResponseData] = useState<unknown>(null);

  const registrarIngresoMedicamento = async (
    payload: RegistrarIngresoMedicamentoPayload
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

      const url = REGISTRAR_INGRESO_MEDICAMENTO_ENDPOINT.URL();
      const response = await axios({
        method: REGISTRAR_INGRESO_MEDICAMENTO_ENDPOINT.METHOD,
        url,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    registrarIngresoMedicamento,
    isLoading,
    error,
    isSuccess,
    responseData,
    reset,
  };
};

export default useIngresoMedicamento;
