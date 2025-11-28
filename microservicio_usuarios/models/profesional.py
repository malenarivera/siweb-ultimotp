from sqlalchemy import String, ForeignKey, Integer, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from datetime import datetime, date

class Profesional(Base):
    __tablename__ = "profesional"
    # Aca van las columnas
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("usuario.id_usuario", ondelete="CASCADE"), autoincrement=False, primary_key=True)
    legajo: Mapped[str] = mapped_column(String(20), unique=True) # Lo genera el sistema
    dni: Mapped[str] = mapped_column(String(20), unique=True)
    nombre: Mapped[str] = mapped_column(String(100))
    apellido: Mapped[str] = mapped_column(String(100))
    fecha_nacimiento: Mapped[date | None]
    genero: Mapped[str] = mapped_column(String(20))
    foto_url: Mapped[str | None] = mapped_column(String(255))
    usuario: Mapped['Usuario'] = relationship(
        back_populates="profesional"
    )

    administrativo: Mapped["Administrativo"] = relationship(
        back_populates="profesional",
        cascade="all, delete-orphan",
        uselist=False
    )

    clinico: Mapped["Clinico"] = relationship(
        back_populates="profesional",
        cascade="all, delete-orphan",
        uselist=False
    )

    __table_args__ = (
        CheckConstraint("genero IN ('hombre', 'mujer', 'otro')", name="check_genero_valido"),
    )

class Administrativo(Base):
    __tablename__ = "administrativo"
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("profesional.id_usuario", ondelete="CASCADE"), autoincrement=False, primary_key=True)
    rol: Mapped[str]
    profesional: Mapped['Profesional'] = relationship(
        back_populates="administrativo"
    )
    __table_args__ = (
        CheckConstraint("rol IN ('secretaria', 'director', 'coordinador')", name="check_rol_valido"),
    )

class Clinico(Base):
    __tablename__ = "clinico"
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("profesional.id_usuario", ondelete="CASCADE"), autoincrement=False, primary_key=True)
    matricula: Mapped[str] = mapped_column(String(20), unique=True)
    tipo: Mapped[str]
    profesional: Mapped['Profesional'] = relationship(
        back_populates="clinico"
    )
    __table_args__ = (
        CheckConstraint("tipo IN ('psicologo', 'psiquiatra', 'enfermero')", name="check_tipo_valido"),
    )