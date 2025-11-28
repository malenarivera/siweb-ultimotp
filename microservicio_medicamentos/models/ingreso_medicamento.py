from sqlalchemy import String, Boolean, Date, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base
from datetime import datetime, date

class Ingreso_Medicamento(Base):
    __tablename__ = "ingreso_medicamento"

     # Datos ingreso medicamento
    id_ingreso: Mapped[int] = mapped_column(primary_key=True, unique=True, nullable=False)
    id_medicamento: Mapped[int] = mapped_column(nullable=False)
    id_paciente: Mapped[int] = mapped_column(nullable=False)
    id_profesional: Mapped[int] = mapped_column(nullable=False)
    cantidad: Mapped[int] = mapped_column(nullable=False)
    motivo: Mapped[str] = mapped_column(String(100), nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False)
    


