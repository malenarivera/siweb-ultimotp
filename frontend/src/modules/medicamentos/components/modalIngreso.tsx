"use client"

import { useState } from "react"
import Modal from "@/globals/components/moleculas/Modal"
import { Medicamento } from "@/modules/medicamentos/types/Medicamento"
import { MedicationMovementData } from "@/modules/medicamentos/types/MedicationMovement"
import { MedicationMovementForm } from "./MedicationMovementForm"

interface MedicationIntakeModalProps {
  medicamento: Medicamento
  onClose: () => void
  onSubmit: (medicamento: Medicamento, data: MedicationMovementData) => Promise<void>
}

export function MedicationIntakeModal({ medicamento, onClose, onSubmit }: MedicationIntakeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFormSubmit = async (data: MedicationMovementData) => {
    setError(null)

    // Validar campos
    if (data.id_paciente <= 0) {
      setError("Por favor ingresa un ID de paciente válido")
      return
    }
    if (data.cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0")
      return
    }
    if (!data.motivo.trim()) {
      setError("Por favor ingresa un motivo")
      return
    }

    setLoading(true)
    try {
      await onSubmit(medicamento, data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar el medicamento")
    } finally {
      setLoading(false)
    }
  }

  const hayStock = medicamento.stock > 0

  return (
    <Modal onClose={onClose} title="Ingreso de Medicamentos">
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 mb-4">
        <p className="font-semibold text-gray-900">{medicamento.nombre_comercial}</p>
        <p className="mt-1">
          <span className="font-medium">Nombre genérico:</span> {medicamento.nombre_generico}
        </p>
        <p className="mt-1">
          <span className="font-medium">Presentación:</span> {medicamento.presentacion}
        </p>
        <p className={hayStock ? "mt-1" : "mt-1 text-red-500"}>
          <span className="font-medium">Stock actual:</span> {medicamento.stock}
        </p>
      </div>

      <MedicationMovementForm
        onSubmit={handleFormSubmit}
        onCancel={onClose}
        loading={loading}
        error={error}
        submitButtonText="Registrar"
        cancelButtonText="Cancelar"
      />
    </Modal>
  )
}
