import { BASE_URL_HISTORIA_CLINICA } from '@/globals/services/config';

export interface RegistrarPacienteData {
  dni: string;
  fechaIngreso: string;
  genero: string;
  nombres: string;
  fehcaNacimiento: string;
  apellido: string;
  obraSocial?: string;
  nroSocio?: string;
  calle?: string;
  numero?: string;
  piso?: string;
  dpto?: string;
  telefono: string;
  email: string;
  fotoPerfil?: File | null;
}

export const REGISTRAR_PACIENTE_ENDPOINT = {
  URL: () => `${BASE_URL_HISTORIA_CLINICA}/pacientes/`,
  METHOD: 'post' as const,
  headers: {
    Accept: 'application/json',
    // No incluimos Content-Type porque FormData lo establece automáticamente
  },
};

export default REGISTRAR_PACIENTE_ENDPOINT;