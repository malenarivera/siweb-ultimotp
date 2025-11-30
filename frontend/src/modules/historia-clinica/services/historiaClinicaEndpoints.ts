import { BASE_URL_HISTORIA_CLINICA } from './config';


export const OBTENER_ITEMS_DM = {
  URL: `${BASE_URL_HISTORIA_CLINICA}/items-dm`,
  METHOD: 'get' as const
};

export const CARGAR_EVOLUCION = {
  URL: (id_usuario: string | number) => `${BASE_URL_HISTORIA_CLINICA}/pacientes/${id_usuario}/evoluciones`,
  METHOD: 'post' as const
};

export const OBTENER_EVOLUCIONES = {
  URL: (id_usuario: string | number) => `${BASE_URL_HISTORIA_CLINICA}/pacientes/${id_usuario}/evoluciones`,
  METHOD: 'get' as const
};

export const OBTENER_SOTS = {
  URL: (id_usuario: string | number) => `${BASE_URL_HISTORIA_CLINICA}/pacientes/${id_usuario}/sots`,
  METHOD: 'get' as const
};

export const OBTENER_PACIENTE = {
  URL: (id_usuario: string | number) => `${BASE_URL_HISTORIA_CLINICA}/pacientes/${id_usuario}`,
  METHOD: 'get' as const
};

export const OBTENER_EVOLUCION = {
  URL: (id_usuario: string | number, id_evolucion: string | number) => `${BASE_URL_HISTORIA_CLINICA}/pacientes/${id_usuario}/evoluciones/${id_evolucion}`,
  METHOD: 'get' as const
}

export const MARCAR_ERRONEA = {
  URL: (id_usuario: string | number, id_evolucion: string | number) => `${BASE_URL_HISTORIA_CLINICA}/pacientes/${id_usuario}/evoluciones/${id_evolucion}/marcar-erronea`,
  METHOD: 'patch' as const
}

export const MARCAR_ERRONEA_SOT = {
  URL: (id_usuario: string | number, id_sot: string | number) => `${BASE_URL_HISTORIA_CLINICA}/pacientes/${id_usuario}/sots/${id_sot}/marcar-erronea`,
  METHOD: 'patch' as const
}