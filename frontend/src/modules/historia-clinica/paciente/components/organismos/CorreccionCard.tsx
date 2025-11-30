"use client";

import { useState } from "react";
import ToggleCompactButton from "../atoms/ToggleCompactButton";

interface ApiData {
  marcada_erronea?: boolean;
  motivo_erronea?: string;
  marcada_erronea_por?: number;
  fecha_marcada_erronea?: string;
  fecha_creacion?: string;
  creada_por?: number;
}

interface Props {
  title?: string;
  content?: string;
  data?: ApiData;
  /** name of the person who marked it erroneous (resolved by caller) */
  markerName?: string;
  /** name of the creator/author (resolved by caller) */
  creatorName?: string;
}

export default function CorreccionCard({
  title = 'CORRECCIÓN',
  content = `La paciente no presentó mejoras, pero se mostró más abierta a la sesión ya que:\nLorem ipsum dolor sit amet consectetur adipiscing elit, iaculis quis nunc lectus mollis accumsan dis, cursus senectus scelerisque mus quisque erat. Blandit mattis porttitor faucibus mus dapibus dictum nam, pharetra nullam est convallis fermentum rhoncus tortor quisque, odio eu inceptos neque nostra laoreet. Bibendum dictumst sapien sollicitudin himenaeos commodo ac dictum, eleifend ultricies habitasse phasellus curabitur vestibulum, neque et accumsan mi nunc morbi.`,
  data,
  markerName,
  creatorName,
}: Props) {
  // only render when marked as erroneous
  if (!data?.marcada_erronea) return null;

  const [isCompact, setIsCompact] = useState(true);

  const createdAt = data?.fecha_creacion ? new Date(data.fecha_creacion) : undefined;
  const formattedCreatedAt = createdAt
    ? `${String(createdAt.getDate()).padStart(2, '0')}/${String(createdAt.getMonth() + 1).padStart(2, '0')}/${String(createdAt.getFullYear()).slice(-2)} ${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')} hs`
    : undefined;

  const markedAt = data?.fecha_marcada_erronea ? new Date(data.fecha_marcada_erronea) : undefined;
  const formattedMarkedAt = markedAt
    ? `${String(markedAt.getDate()).padStart(2, '0')}/${String(markedAt.getMonth() + 1).padStart(2, '0')}/${String(markedAt.getFullYear()).slice(-2)} ${String(markedAt.getHours()).padStart(2, '0')}:${String(markedAt.getMinutes()).padStart(2, '0')} hs`
    : undefined;

  const baseTitle = title.includes(' - ') ? title.split(' - ')[0] : title;
  let headerTitle = baseTitle;

  // For CorreccionCard the header should show who marked it (markerName) and when.
  // Fallback: if no markerName, show creatorName + createdAt as before.
  if (markerName) {
    headerTitle += ` - ${markerName}${formattedMarkedAt ? ` (${formattedMarkedAt})` : ''}`;
  } else if (creatorName) {
    headerTitle += ` - ${creatorName}${formattedCreatedAt ? ` (${formattedCreatedAt})` : ''}`;
  } else if (formattedMarkedAt) {
    headerTitle += ` - ${formattedMarkedAt}`;
  }

  return (
    <div className="mt-6 border rounded-md overflow-hidden relative ml-10 md:ml-12">
      {/* header - red tone */}
      <div className={`flex items-center justify-between bg-[var(--color-error)] text-black px-4 ${isCompact ? 'py-2' : 'py-3'}`}>
        <div className="font-semibold text-sm md:text-base">{headerTitle}</div>
        <div>
          <ToggleCompactButton variant="error" isCompact={isCompact} onToggle={() => setIsCompact(s => !s)} ariaLabel={isCompact ? 'Expandir' : 'Colapsar'} />
        </div>
      </div>

      {/* body - collapsible, shows motivo and who marked it */}
      <div className={`bg-white transition-all duration-300 ease-in-out overflow-hidden ${isCompact ? 'max-h-0 opacity-0 p-0' : 'max-h-[800px] opacity-100 p-4'}`}>
        <div className="prose prose-sm text-gray-800 whitespace-pre-line">{data?.motivo_erronea ?? content}</div>

        {/* marker info is shown in the header tab; nothing to render here */}
      </div>
    </div>
  );
}
