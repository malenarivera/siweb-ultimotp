"use client";

import ToggleCompactButton from "../atoms/ToggleCompactButton";

interface PatientData {
  name?: string;
  dni?: string;
  sexo?: string;
  nacimiento?: string;
  obraSocial?: string;
  ingreso?: string;
  domicilio?: string;
  telefono?: string;
  email?: string;
}

interface Props {
  data?: PatientData;
  isCompact?: boolean;
  onToggle?: () => void;
}

export default function PatientInfoColumns({ data, isCompact, onToggle }: Props) {
  const d = data || {} as PatientData;

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-0">
        <h2 className="text-3xl font-semibold text-[#7fb77a]">{d.name || ''}</h2>
        {/* Show toggle in expanded view (when not compact) */}
        {!isCompact ? (
          <ToggleCompactButton isCompact={!!isCompact} onToggle={onToggle ?? (() => {})} ariaLabel={isCompact ? 'Expandir tarjeta' : 'Colapsar tarjeta'} />
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
        <div>
          {d.dni ? <p className="mb-1"><strong>DNI</strong> {d.dni}</p> : null}
          {d.sexo ? <p className="mb-1">{d.sexo}</p> : null}
          {d.nacimiento ? <p className="mb-1">{d.nacimiento}</p> : null}
        </div>

        <div className="text-gray-600">
          {d.obraSocial ? <p className="mb-1"><strong>Obra Social:</strong> {d.obraSocial}</p> : null}
          {d.ingreso ? <p className="mb-1"><strong>Ingreso:</strong> {d.ingreso}</p> : null}
          {d.domicilio ? <p className="mb-1"><strong>Domicilio:</strong> {d.domicilio}</p> : null}
          {d.telefono ? <p className="mb-1"><strong>Teléfono:</strong> {d.telefono}</p> : null}
          {d.email ? <p className="mb-1"><strong>E-mail:</strong> {d.email}</p> : null}
        </div>
      </div>
    </div>
  );
}
