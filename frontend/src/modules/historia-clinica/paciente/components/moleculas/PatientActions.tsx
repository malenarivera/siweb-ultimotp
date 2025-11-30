"use client";

import { Edit } from "lucide-react";

interface Props {
  onEdit?: () => void;
  editLabel?: string;
}

export default function PatientActions({ onEdit, editLabel = "Editar Datos" }: Props) {
  return (
    <div className="flex flex-col items-start space-y-2">
      <button onClick={onEdit} className="inline-flex items-center gap-2 bg-[var(--color-manzana)] text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-150">
        {editLabel}
        <Edit className="w-4 h-4 text-current" />
      </button>
    </div>
  );
}
