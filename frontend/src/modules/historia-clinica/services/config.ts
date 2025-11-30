// Configuración de la URL base para la API de Historia Clínica
// En Next.js, las variables de entorno deben tener el prefijo NEXT_PUBLIC_ para estar disponibles en el cliente
// En tu archivo .env: NEXT_PUBLIC_BASE_URL_HISTORIA_CLINICA=http://localhost:8000
declare const process: {
  env: {
    NEXT_PUBLIC_BASE_URL_HISTORIA_CLINICA?: string;
  };
};

export const BASE_URL_HISTORIA_CLINICA = process.env.NEXT_PUBLIC_BASE_URL_HISTORIA_CLINICA;

