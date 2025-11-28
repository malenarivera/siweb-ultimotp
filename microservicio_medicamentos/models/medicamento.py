from sqlalchemy import String, Boolean, Date, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base
from datetime import datetime, date

class Medicamento(Base):
    __tablename__ = "medicamento"

     # Datos medicamento
    id_medicamento: Mapped[int] = mapped_column(primary_key=True, unique=True, nullable=False)
    laboratorio_titular: Mapped[str | None] = mapped_column(String(200))
    nombre_comercial: Mapped[str] = mapped_column(String(150), nullable=False)
    nombre_generico: Mapped[str] = mapped_column(String(250), nullable=False)
    concentracion: Mapped[str] = mapped_column(String(50), nullable=False)
    forma_farmaceutica: Mapped[str] = mapped_column(String(100), nullable=False)
    presentacion: Mapped[str] = mapped_column(String(150), nullable=False)
    stock: Mapped[int] = mapped_column(nullable=False, default=0)
    fecha_creacion: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False)
    

