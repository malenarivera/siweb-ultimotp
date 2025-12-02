import { BASE_URL_MEDICAMENTOS } from "@/globals/services/config";

export interface RegistrarEgresoMedicamentoPayload {
  id_medicamento: number;
  id_paciente: number;
  cantidad: number;
  motivo: string;
}

export const REGISTRAR_EGRESO_MEDICAMENTO_ENDPOINT = {
  URL: () => {
    if (!BASE_URL_MEDICAMENTOS) {
      throw new Error("La URL base de medicamentos no está configurada");
    }
    return `${BASE_URL_MEDICAMENTOS}/medicamentos/registrarEgreso`;
  },
  METHOD: "post" as const,
};

export default REGISTRAR_EGRESO_MEDICAMENTO_ENDPOINT;
