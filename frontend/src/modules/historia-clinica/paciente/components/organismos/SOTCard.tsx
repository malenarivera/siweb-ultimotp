"use client";

import { useState } from "react";
import ToggleCompactButton from "../atoms/ToggleCompactButton";
import CorreccionCard from "./CorreccionCard";
import MarkAsErroneousButton from "../atoms/MarkAsErroneousButton";
import Modal from '@/globals/components/moleculas/Modal';
import MarcarErronea from './FormMarcarErronea';

interface ApiData {
  motivo?: string;
  dni_profesional?: string;
  fecha?: string; // yyyy-mm-dd
  hora?: string; // hh:mm:ss(.ms)Z
  observacion?: string;
  id_sot?: number;
  creado_por?: number;
  fecha_creacion?: string; // ISO
  creacion?: {
    nombre?: string;
    id_usuario?: number | string;
    fecha?: string;
  };
  dni_paciente?: string;
  motivo_modificado?: string;
  modificado_por?: number;
  fecha_modificacion?: string; // ISO
  modificado?: boolean;
}

interface Props {
  title?: string;
  data?: ApiData;
  /** Resolved professional name (caller resolves from dni_profesional or creado_por) */
  professionalName?: string;
  /** name of the creator/author (resolved by caller) */
  creatorName?: string;
}

export default function SOTCard({
  title = 'SOT',
  data,
  professionalName,
  creatorName,
}: Props) {
  const [isCompact, setIsCompact] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const idEntity = data?.id_sot;
  const onMarcarErronea = () => {
    if (!idEntity) {
      alert('ID de SOT no disponible');
      return;
    }
    setShowModal(true);
  }

  // use creation metadata from API: data.creacion.{nombre, fecha}
  const createdAt = data?.creacion?.fecha ? new Date(data.creacion.fecha) : undefined;
  const formattedCreatedAt = createdAt
    ? `${String(createdAt.getDate()).padStart(2, '0')}/${String(createdAt.getMonth() + 1).padStart(2, '0')}/${String(createdAt.getFullYear()).slice(-2)} ${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')} hs`
    : undefined;

  const baseTitle = title.includes(' - ') ? title.split(' - ')[0] : title;
  const creator = creatorName ?? data?.creacion?.nombre;
  const headerTitle = creator
    ? `${baseTitle} - ${creator}${formattedCreatedAt ? ` (${formattedCreatedAt})` : ''}`
    : title;

  // event datetime (fecha + hora)
  let eventDate: Date | undefined;
  if (data?.fecha) {
    try {
      // combine fecha and hora if hora exists, otherwise parse fecha only
      const iso = data.hora ? `${data.fecha}T${data.hora}` : data.fecha;
      eventDate = new Date(iso);
    } catch (e) {
      eventDate = undefined;
    }
  }

  const formattedEventAt = eventDate
    ? `${String(eventDate.getDate()).padStart(2, '0')}/${String(eventDate.getMonth() + 1).padStart(2, '0')}/${String(eventDate.getFullYear()).slice(-2)} ${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')} hs`
    : undefined;

  return (
    <>
      <div className="mt-6 border rounded-md overflow-hidden relative ml-6 md:ml-8">
        {/* header */}
        <div className={`flex items-center justify-between bg-[var(--color-manzana)] text-black px-4 ${isCompact ? 'py-2' : 'py-3'}`}>
          <div className="font-semibold text-sm md:text-base">{headerTitle}</div>
          <div>
            <ToggleCompactButton isCompact={isCompact} onToggle={() => setIsCompact(s => !s)} ariaLabel={isCompact ? 'Expandir' : 'Colapsar'} />
          </div>
        </div>

        {/* body */}
        <div className={`bg-white transition-all duration-300 ease-in-out overflow-hidden ${isCompact ? 'max-h-0 opacity-0 p-0' : 'max-h-[800px] opacity-100 p-4'}`}>
          <div className="prose prose-sm text-gray-800">
            {/* motivo + fecha/hora del acontecimiento */}
            {data?.motivo && (
              <div className="mb-2 whitespace-pre-line"><span className="font-bold">Motivo:</span> {data.motivo}</div>
            )}
            {formattedEventAt && (
              <div className="text-sm text-gray-600 mb-2"><span className="font-bold">Acontecimiento:</span> {formattedEventAt}</div>
            )}

            {/* observacion */}
            <div className="whitespace-pre-line">{data?.observacion ?? ''}</div>
          </div>

          <div className="mt-6 flex justify-end">
            <MarkAsErroneousButton onClick={onMarcarErronea} ariaLabel="Marcar como Erróneo" />
          </div>
          {showModal && idEntity && (
            <Modal title="Marcar SOT como Erróneo" onClose={() => setShowModal(false)}>
              <MarcarErronea id_usuario={9} id_evolucion={idEntity} evoluciones={[]} setEvoluciones={() => {}} goBack={() => setShowModal(false)} entityKind="sot" />
            </Modal>
          )}
        </div>
      </div>

      {/* If modified, render a CorreccionCard using mapped fields from the SOT API */}
      {data?.modificado && (
        <CorreccionCard
          data={{
            marcada_erronea: true,
            motivo_erronea: data.motivo_modificado,
            marcada_erronea_por: data.modificado_por,
            fecha_marcada_erronea: data.fecha_modificacion,
            fecha_creacion: data.fecha_creacion,
            creada_por: data.creado_por,
          }}
          // markerName / creatorName should be resolved by the caller where possible
        />
      )}
    </>
  );
}
