from sqlalchemy import String, Integer, ForeignKey, Text, func, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuario"
    # Aca van las columnas
    id_usuario: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(20), unique=True)
    password: Mapped[str] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(100), unique=True)
    telefono: Mapped[str | None] = mapped_column(String(20), unique=True)
    motivo_baja: Mapped[str | None] = mapped_column(Text)
    fecha_baja: Mapped[datetime | None]
    baja_por: Mapped[int | None] = mapped_column(Integer, ForeignKey("usuario.id_usuario"))
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.CURRENT_TIMESTAMP())
    creado_por: Mapped[int | None] = mapped_column(Integer, ForeignKey("usuario.id_usuario"))
    ultima_edicion: Mapped[datetime | None]
    editado_por: Mapped[int | None] = mapped_column(Integer, ForeignKey("usuario.id_usuario"))
    profesional: Mapped["Profesional"] = relationship(
        back_populates="usuario",
        cascade="all, delete-orphan",
        uselist=False
    )
    # Relacion a baja_por (1-1 o 1-M)
    usuario_baja: Mapped["Usuario"] = relationship(
        remote_side=[id_usuario],
        back_populates='dados_de_baja',
        foreign_keys=[baja_por]
    )

    # Usuarios dados de baja por usuario_baja 
    dados_de_baja: Mapped["Usuario"]  = relationship(
        back_populates='usuario_baja',
        foreign_keys=[baja_por]
    )

    # Relacion a creado_por (1-1 o 1-M)
    usuario_alta: Mapped["Usuario"] = relationship(
        remote_side=[id_usuario],
        back_populates='dados_de_alta',
        foreign_keys=[creado_por]
    )

    # Usuarios dados de alta por usuario_alta
    dados_de_alta: Mapped["Usuario"]  = relationship(
        back_populates='usuario_alta',
        foreign_keys=[creado_por]
    )

    # Relacion a editado_por (1-1 o 1-M)
    usuario_edicion: Mapped["Usuario"]  = relationship(
        remote_side=[id_usuario],
        back_populates='editados', 
        foreign_keys=[editado_por]
    )

    # Usuarios dados de alta por usuario_alta
    editados: Mapped["Usuario"]  = relationship(
        back_populates='usuario_edicion',
        foreign_keys=[editado_por]
    )
