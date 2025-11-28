from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Annotated
from enum import Enum
from datetime import date, datetime
from typing import Literal
from schemas.usuario_schema import Alta, Baja, Edicion

class CrearPersonal(BaseModel):
     tipo: TipoPersonal
     dni: Annotated[str, StringConstraints(strip_whitespace=True, min_length=7, max_length=20)]
     nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
     apellido: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
     matricula: str | None = None
     genero: Genero
     fecha_nacimiento: date | None = None
     email: EmailStr | None = None
     telefono: str | None = None

     model_config = {
        "json_schema_extra": {
            "example": 
               """
               {
                    "nombre": "Martin",
                    "apellido": "Salvatierra",
                    "tipo": "psiquiatra",
                    "matricula": "PAC123",
                    "dni": "22505432",
                    "genero": "hombre",
                    "fecha_nacimiento": "1991-11-27",
                    "telefono": "2991115421"
               }
               """
        }
    }

class PersonalCreado(BaseModel):
     id_usuario: int
     model_config = {
        "json_schema_extra": {
            "example": {
               "id_usuario": 2
            }
        }
    }

class BusquedaPersonal(BaseModel):

     id_usuario: int
     tipo: TipoPersonal
     dni: str
     nombre: str
     apellido: str
     genero: Genero
     #activo: bool | None = None
     fecha_creacion: datetime
     model_config = {
          "json_schema_extra": {
               "example": 
                    {
                    "id_usuario": 1,
                    "tipo": "enfermero",
                    "dni": "38112342",
                    "nombre": "Marina",
                    "apellido": "Moran",
                    "genero": "mujer",
                    "fecha_creacion": "2025-10-20 05:22"
                    }
          }
     }

class UnPersonal(BaseModel):
     id_usuario: int
     legajo: str
     tipo: TipoPersonal
     dni: str
     nombre: str
     apellido: str
     matricula: str | None = None
     genero: Genero
     fecha_nacimiento: date | None = None
     email: EmailStr | None = None
     telefono: str | None = None
     foto_url: str | None = None
     alta: Alta
     baja: Baja | None = None
     edicion: Edicion | None = None
     model_config = {
          "json_schema_extra": {
               "example": {
                    "id_usuario": 1,
                    "legajo": "COO-0001",
                    "tipo": "coordinador",
                    "dni": "12300456",
                    "nombre": "Dinora",
                    "apellido": "Aguilar",
                    "matricula": None,
                    "genero": "mujer",
                    "fecha_nacimiento": "1972-08-02",
                    "email": "dinora@hotmail.com",
                    "telefono": None,
                    "foto_url": None,
                    "alta": {
                         "fecha": "2025-10-19T19:15:16.005265",
                         "id_usuario": None
                    },
                    "baja": {
                         "fecha": None,
                         "id_usuario": None,
                         "motivo": None
                    }
               }
          }
     }

class DetalleBaja(BaseModel):
     motivo: str 
     model_config = {
        "json_schema_extra": {
            "example": {
               "motivo": "Dado de Baja por renuncia"
            }
        }
    }

class EditarPersonal(BaseModel):
     nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)] | None = None 
     apellido: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)] | None = None
     fecha_nacimiento: date | None = None
     genero: Genero | None = None
     matricula: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)] | None = None
     email: EmailStr | Literal[""] | None = None
     telefono: Annotated[str, StringConstraints(strip_whitespace=True, min_length=8, max_length=20)] | Literal[""] | None = None
     model_config = {
          "json_schema_extra": {
               "example":
                    {
                    "email": "marina.moran@crz.com",
                    "telefono": "2994355433",
                    "genero": "otro",
                    }
          }
     }


class TipoPersonal(Enum):
     PSICOLOGO = "psicologo"
     PSIQUIATRA = "psiquiatra"
     ENFERMERO = "enfermero"
     SECRETARIA = "secretaria"
     DIRECTOR = "director"
     COORDINADOR = "coordinador"

class Genero(Enum):
     MUJER = "mujer"
     HOMBRE = "hombre"
     OTRO = "otro"