"use client";

import { useState } from "react";
import ToggleCompactButton from "../atoms/ToggleCompactButton";
import MarkAsErroneousButton from "../atoms/MarkAsErroneousButton";

interface ApiData {
  id_item1?: string;
  id_item2?: string;
  id_item3?: string;
  id_item4?: string;
  id_item5?: string;
  id_diagnostico_multiaxial?: number;
  creado_por?: number;
  fecha_creacion?: string;
}

interface Props {
  title?: string;
  data?: ApiData;
  /** resolved name of the creator (fetched by caller) */
  creatorName?: string;
}

export default function MultiaxialCard({
  title = 'MULTIAXIAL - Psicólogo Carlos Acuña (29/11/24 09:21 hs)',
  data,
  creatorName,
}: Props) {
  const [isCompact, setIsCompact] = useState(true);
  // Multiaxial diagnostics cannot be marked as erroneous per new requirement.

  const items = [data?.id_item1, data?.id_item2, data?.id_item3, data?.id_item4, data?.id_item5].filter(Boolean) as string[];

  const createdAt = data?.fecha_creacion ? new Date(data.fecha_creacion) : undefined;

  // format as dd/MM/yy HH:mm hs
  const formattedCreatedAt = createdAt
    ? `${String(createdAt.getDate()).padStart(2, '0')}/${String(createdAt.getMonth() + 1).padStart(2, '0')}/${String(createdAt.getFullYear()).slice(-2)} ${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')} hs`
    : undefined;

  // build a single header title that includes creator name and date to avoid duplicates
  const baseTitle = title.includes(' - ') ? title.split(' - ')[0] : title;
  const headerTitle = creatorName
    ? `${baseTitle} - ${creatorName}${formattedCreatedAt ? ` (${formattedCreatedAt})` : ''}`
    : title;

  return (
    <div className="mt-6 border rounded-md overflow-hidden relative ml-0">
      {/* top tab/header */}
      <div className={`flex items-center justify-between bg-[var(--color-manzana)] text-black px-4 ${isCompact ? 'py-2' : 'py-3'}`}>
        <div className="font-semibold text-sm md:text-base">{headerTitle}</div>
        <div>
          <ToggleCompactButton isCompact={isCompact} onToggle={() => setIsCompact(s => !s)} ariaLabel={isCompact ? 'Expandir' : 'Colapsar'} />
        </div>
      </div>

      {/* content - animate collapse/expand like PatientCard (max-height + opacity) */}
      <div className={`bg-white transition-all duration-300 ease-in-out overflow-hidden ${isCompact ? 'max-h-0 opacity-0 p-0' : 'max-h-[800px] opacity-100 p-4'}`}>
        <div className="mb-3 flex items-center gap-2">
          <h4 className="font-medium">Diagnóstico Multiaxial</h4>
          <span className="inline-block w-5 h-5 rounded-full bg-gray-200 text-center text-sm">i</span>
        </div>

        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((text, i) => (
              <div key={i} className="bg-rose-100 px-4 py-3 rounded text-sm">{text}</div>
            ))
          ) : (
            // fallback example rows when no data provided
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-rose-100 px-4 py-3 rounded text-sm">EJE {i + 1} — datos no disponibles</div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          {/* Marcado deshabilitado para diagnósticos multiaxiales por decisión de producto */}
        </div>
      </div>
    </div>
  );
}
