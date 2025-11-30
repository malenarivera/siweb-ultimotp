// Configuración de las URLs base para todas las APIs
// En Next.js, las variables de entorno deben tener el prefijo NEXT_PUBLIC_ para estar disponibles en el cliente
// En tu archivo .env:
// NEXT_PUBLIC_BASE_URL_HISTORIA_CLINICA=http://localhost:8000
// NEXT_PUBLIC_BASE_URL_MEDICAMENTOS=http://localhost:8002
// NEXT_PUBLIC_BASE_URL_TURNOS=http://localhost:8001
// NEXT_PUBLIC_BASE_URL_PERSONAL=http://localhost:8003

declare const process: {
  env: {
    NEXT_PUBLIC_BASE_URL_HISTORIA_CLINICA?: string;
    NEXT_PUBLIC_BASE_URL_MEDICAMENTOS?: string;
    NEXT_PUBLIC_BASE_URL_TURNOS?: string;
    NEXT_PUBLIC_BASE_URL_PERSONAL?: string;
  };
};

export const BASE_URL_HISTORIA_CLINICA = process.env.NEXT_PUBLIC_BASE_URL_HISTORIA_CLINICA;
export const BASE_URL_MEDICAMENTOS = process.env.NEXT_PUBLIC_BASE_URL_MEDICAMENTOS;
export const BASE_URL_TURNOS = process.env.NEXT_PUBLIC_BASE_URL_TURNOS;
export const BASE_URL_PERSONAL = process.env.NEXT_PUBLIC_BASE_URL_PERSONAL;

