from sqlalchemy import String, Date, Time, Text, Integer, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base
from datetime import date, time, datetime


class Sot(Base):
    __tablename__ = "sot"

    id_sot: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_usuario_paciente: Mapped[int] = mapped_column(Integer, nullable=False)
    motivo: Mapped[str] = mapped_column(Text, nullable=False)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    hora: Mapped[time] = mapped_column(Time, nullable=False)
    observacion: Mapped[str] = mapped_column(Text, nullable=False)
    creado_por: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), nullable=False)
    motivo_modificado: Mapped[str | None] = mapped_column(Text, nullable=True)
    modificado_por: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fecha_modificacion: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
    modificado: Mapped[bool] = mapped_column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<Sot(id_sot={self.id_sot}, dni_paciente='{self.dni_paciente}', fecha='{self.fecha}')>"
