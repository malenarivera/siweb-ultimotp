from sqlalchemy import String, Boolean, Date, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base
from datetime import datetime, date

class Receta(Base):
    __tablename__ = "receta"

     # Claves primarias y foráneas
    id_receta: Mapped[int] = mapped_column(primary_key=True, unique=True, nullable=False)
    id_evolucion: Mapped[int] = mapped_column(nullable=False)
    id_medicamento: Mapped[int] = mapped_column(nullable=False)
    id_profesional: Mapped[int] = mapped_column(nullable=False)
    # Datos recetas
    estado: Mapped[str] = mapped_column(String(50), nullable=False, default='Asignada')
    observaciones: Mapped[str] = mapped_column(String(200), nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )
