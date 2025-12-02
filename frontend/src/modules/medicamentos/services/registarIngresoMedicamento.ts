import { BASE_URL_MEDICAMENTOS } from "@/globals/services/config";

export interface RegistrarIngresoMedicamentoPayload {
  id_medicamento: number;
  id_paciente: number;
  cantidad: number;
  motivo: string;
}

export const REGISTRAR_INGRESO_MEDICAMENTO_ENDPOINT = {
  URL: () => {
    if (!BASE_URL_MEDICAMENTOS) {
      throw new Error("La URL base de medicamentos no está configurada");
    }
    return `${BASE_URL_MEDICAMENTOS}/medicamentos/registrarIngreso`;
  },
  METHOD: "post" as const,
};

export default REGISTRAR_INGRESO_MEDICAMENTO_ENDPOINT;
