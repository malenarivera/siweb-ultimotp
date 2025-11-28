from sqlalchemy import Integer, String, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from datetime import datetime
from typing import Optional, List

class DiagnosticoMultiaxial(Base):
    __tablename__ = "diagnostico_multiaxial"

    id_diagnostico_multiaxial: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_item1: Mapped[str] = mapped_column(String(50), ForeignKey("item_dm.id_item"), nullable=False)
    id_item2: Mapped[str] = mapped_column(String(50), ForeignKey("item_dm.id_item"), nullable=False)
    id_item3: Mapped[str] = mapped_column(String(50), ForeignKey("item_dm.id_item"), nullable=False)
    id_item4: Mapped[str] = mapped_column(String(50), ForeignKey("item_dm.id_item"), nullable=False)
    id_item5: Mapped[str] = mapped_column(String(50), ForeignKey("item_dm.id_item"), nullable=False)
    creado_por: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), nullable=False)
    evolucion: Mapped[list["Evolucion"]] = relationship(back_populates="diagnostico")
    item_uno: Mapped["ItemDM"] = relationship(
        back_populates="diagnostico_uno",
        foreign_keys=[id_item1],
    )
    item_dos: Mapped["ItemDM"] = relationship(
        back_populates="diagnostico_dos",
        foreign_keys=[id_item2],
    )
    item_tres: Mapped["ItemDM"] = relationship(
        back_populates="diagnostico_tres",
        foreign_keys=[id_item3],
    )
    item_cuatro: Mapped["ItemDM"] = relationship(
        back_populates="diagnostico_cuatro",
        foreign_keys=[id_item4],
    )
    item_cinco: Mapped["ItemDM"] = relationship(
        back_populates="diagnostico_cinco",
        foreign_keys=[id_item5],
    )

    def __repr__(self) -> str:
        return f"<DiagnosticoMultiaxial(id={self.id_diagnostico_multiaxial}, creado_por={self.creado_por})>"
