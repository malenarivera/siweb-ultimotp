"use client";

import { useState } from "react";
import ToggleCompactButton from "../atoms/ToggleCompactButton";

interface Props {
  title?: string;
  recetaNumber?: string;
  content?: string;
  vence?: string;
}

export default function RecetaCard({
  title = 'RECETA - Psiquiatra Pablo Rojas (20/11/24 16:23 hs)',
  recetaNumber = '#1234',
  content = 'Tranquilitina x2',
  vence = '18/11/24',
}: Props) {
  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className="mt-6 border rounded-md overflow-hidden relative ml-10 md:ml-12">
      {/* header - green tone */}
      <div className={`flex items-center justify-between bg-[var(--color-manzana)] text-black px-4 ${isCompact ? 'py-2' : 'py-3'}`}>
        <div className="font-semibold text-sm md:text-base">{title}</div>
        <div>
          <ToggleCompactButton isCompact={isCompact} onToggle={() => setIsCompact(s => !s)} ariaLabel={isCompact ? 'Expandir' : 'Colapsar'} />
        </div>
      </div>

      {/* body - expanded by default */}
      <div className={`bg-white transition-all duration-300 ease-in-out overflow-hidden ${isCompact ? 'max-h-0 opacity-0 p-0' : 'max-h-[800px] opacity-100 p-4'}`}>
        <div className="flex items-start justify-between w-full">
          <div>
            <div className="font-semibold">Receta médica {recetaNumber}</div>
            <div className="mt-2 text-sm text-gray-800">{content}</div>
          </div>

          <div className="text-sm text-gray-500">Vence: <span className="font-medium text-gray-700">{vence}</span></div>
        </div>

        <div className="mt-6">
          <button className="inline-flex items-center gap-2 bg-[var(--color-manzana)] text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:bg-[var(--color-primary)] transition-colors duration-150">
            Actualizar Receta
          </button>
        </div>
      </div>
    </div>
  );
}
