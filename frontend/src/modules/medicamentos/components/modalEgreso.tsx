"use client"

import { useState } from "react"
import Modal from "@/globals/components/moleculas/Modal"
import { Medicamento } from "@/modules/medicamentos/types/Medicamento"
import { MedicationMovementData } from "@/modules/medicamentos/types/MedicationMovement"
import { MedicationMovementForm } from "./MedicationMovementForm"

interface MedicationWithdrawalModalProps {
  medicamento: Medicamento
  onClose: () => void
  onSubmit: (medicamento: Medicamento, data: MedicationMovementData) => Promise<void>
}

export function MedicationWithdrawalModal({ medicamento, onClose, onSubmit }: MedicationWithdrawalModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hayStock = medicamento.stock > 0

  const handleFormSubmit = async (data: MedicationMovementData) => {
    setError(null)

    // Validar campos
    if (data.id_paciente <= 0) {
      setError("Por favor ingresa un ID de paciente válido")
      return
    }
    if (data.id_profesional <= 0) {
      setError("Por favor ingresa un ID de profesional válido")
      return
    }
    if (data.cantidad <= 0 || data.cantidad > medicamento.stock) {
      setError("La cantidad debe ser mayor a 0 y menor al stock actual")
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

  return (
    <Modal onClose={onClose} title="Egreso de Medicamentos">
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
        isDisabled={!hayStock}
        submitButtonText="Registrar"
        cancelButtonText="Cancelar"
      />
    </Modal>
  )
}
