from sqlalchemy import String, Boolean, Date, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from datetime import datetime, date
from typing import List

class Paciente(Base):
    __tablename__ = "paciente"

     # Claves primarias y foráneas
    dni: Mapped[str] = mapped_column(String(20), primary_key=True, unique=True, nullable=False)
    id_usuario: Mapped[int] = mapped_column(unique=True, nullable=False)

    # Datos personales
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    genero: Mapped[str] = mapped_column(String(20), nullable=False)
    obra_social: Mapped[str | None] = mapped_column(String(100))
    fecha_nacimiento: Mapped[date | None] = mapped_column(Date)
    fecha_ingreso: Mapped[date | None] = mapped_column(Date)

    # Contacto y administración
    domicilio: Mapped[str | None] = mapped_column(String(255))
    #telefono: Mapped[str | None] = mapped_column(String(20))
    #email: Mapped[str | None] = mapped_column(String(100))

    # Perfil
    #foto_url: Mapped[str | None] = mapped_column(String(255))

    evolucion: Mapped[list['Evolucion']] = relationship(
        back_populates="paciente"
    )

    def __repr__(self) -> str:
        return f"<Paciente(dni='{self.dni}', nombre='{self.nombre}', apellido='{self.apellido}')>"
