from sqlalchemy import String, Integer, Text, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base

class ItemDM(Base):
    __tablename__ = "item_dm"

    id_item: Mapped[str] = mapped_column(String(50), primary_key=True)
    eje: Mapped[int] = mapped_column(Integer, nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    diagnostico_uno: Mapped[list["DiagnosticoMultiaxial"]] = relationship(
        back_populates="item_uno",
        foreign_keys="DiagnosticoMultiaxial.id_item1",
    )
    diagnostico_dos: Mapped[list["DiagnosticoMultiaxial"]] = relationship(
        back_populates="item_dos",
        foreign_keys="DiagnosticoMultiaxial.id_item2",
    )
    diagnostico_tres: Mapped[list["DiagnosticoMultiaxial"]] = relationship(
        back_populates="item_tres",
        foreign_keys="DiagnosticoMultiaxial.id_item3",
    )
    diagnostico_cuatro: Mapped[list["DiagnosticoMultiaxial"]] = relationship(
        back_populates="item_cuatro",
        foreign_keys="DiagnosticoMultiaxial.id_item4",
    )
    diagnostico_cinco: Mapped[list["DiagnosticoMultiaxial"]] = relationship(
        back_populates="item_cinco",
        foreign_keys="DiagnosticoMultiaxial.id_item5",
    )

    __table_args__ = (
        CheckConstraint(
            "eje >= 1 AND eje <= 5",
            name="check_eje_range"
        ),
    )

    def __repr__(self) -> str:
        return f"<ItemDM(id_item='{self.id_item}', eje={self.eje})>"
