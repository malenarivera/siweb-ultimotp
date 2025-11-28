from sqlalchemy import String, Integer, Boolean, Text, TIMESTAMP, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from datetime import datetime

class Evolucion(Base):
    __tablename__ = "evolucion"

    id_evolucion: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    #dni_paciente: Mapped[str] = mapped_column(String(20), ForeignKey("paciente.dni"), nullable=False)
    id_usuario: Mapped[int] = mapped_column(Integer, ForeignKey("paciente.id_usuario"), nullable=False)
    observacion: Mapped[str] = mapped_column(Text, nullable=False)
    id_turno: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tipo: Mapped[str] = mapped_column(String, nullable=False)
    marcada_erronea: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fecha_marcada_erronea: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), nullable=True)
    motivo_erronea: Mapped[str | None] = mapped_column(Text)
    marcada_erronea_por: Mapped[int | None] = mapped_column(Integer)
    creada_por: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), nullable=False)
    id_diagnostico_multiaxial: Mapped[int | None] = mapped_column(Integer, ForeignKey("diagnostico_multiaxial.id_diagnostico_multiaxial"), nullable=True)
    paciente: Mapped['Paciente'] = relationship(
        back_populates="evolucion"
    )
    diagnostico: Mapped['DiagnosticoMultiaxial'] = relationship(
        back_populates="evolucion"
    )

    __table_args__ = (
        CheckConstraint(
            "tipo IN ('individual', 'grupal')",
            name="check_tipo_evolucion"
        ),
    )

    def __repr__(self) -> str:
        return f"<Evolucion(id_evolucion={self.id_evolucion}, dni_paciente='{self.dni_paciente}', tipo='{self.tipo}')>"
