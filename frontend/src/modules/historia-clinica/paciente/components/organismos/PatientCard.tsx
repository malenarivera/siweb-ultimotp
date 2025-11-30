"use client";

import { useState } from "react";
import PatientAvatar from "../atoms/PatientAvatar";
import PatientActions from "../moleculas/PatientActions";
import PatientInfoColumns from "../moleculas/PatientInfoColumns";
import ToggleCompactButton from "../atoms/ToggleCompactButton";

interface Props {
  t?: (key: string) => string;
  data?: any;
}

export default function PatientCard({ t, data }: Props) {
  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className={`bg-white shadow-sm rounded-lg border border-gray-800 ${isCompact ? 'px-6 py-0' : 'p-6'}`}>
      <div className="py-4 flex items-center justify-between">
        {isCompact ? (
          <div className="flex items-center gap-4">
            <PatientAvatar className="w-10 h-10" />
            <h2 className="text-2xl font-bold text-[var(--color-manzana)]">{data?.name || (t ? t('patient.name') : 'patient.name')}</h2>
          </div>
        ) : (
          <div />
        )}

        {isCompact ? (
          <ToggleCompactButton isCompact={isCompact} onToggle={() => setIsCompact(s => !s)} ariaLabel={isCompact ? 'Expandir tarjeta' : 'Colapsar tarjeta'} />
        ) : null}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 items-start transition-all duration-300 ease-in-out overflow-hidden ${isCompact ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
        <div className="col-span-1 flex flex-col items-start space-y-2">
          <PatientAvatar />
          <PatientActions editLabel={'Editar Datos'} />
        </div>

        <PatientInfoColumns data={data} isCompact={isCompact} onToggle={() => setIsCompact(s => !s)} />
      </div>
    </div>
  );
}
