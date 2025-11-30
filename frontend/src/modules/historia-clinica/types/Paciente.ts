export interface Paciente {
    id_usuario: number;
    dni: string;
    apellido: string;
    nombre: string;
    genero: string;
    fecha_ingreso: string;
    [key: string]: any;
  }