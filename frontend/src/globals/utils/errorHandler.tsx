import translate from "./translation";

export default function errorHandler(errorDetail: string) {
  //Define si traduce o no los mensajes de error 
  let mensaje = errorDetail
  if (errorDetail.includes("pydantic:")) {
    mensaje = ""
    errorDetail = errorDetail.split("pydantic:")[1];
    for (const item of errorDetail.split(";")) {
      let partes: string[] = item.split(":");
      let campo: string = partes[0];
      let error: string = partes[1];
      mensaje = `El campo de ${campo} contiene un error: `;
      mensaje+= translate(error);
    }
  }
  return mensaje;
}