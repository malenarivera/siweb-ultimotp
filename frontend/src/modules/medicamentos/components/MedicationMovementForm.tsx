"use client"

import { useState } from "react"
import VirtualKeyboard from "@/globals/components/organismos/VirtualKeyboard"
import { useVirtualKeyboard } from "@/globals/hooks/useVirtualKeyboard"
import { MedicationMovementData } from "@/modules/medicamentos/types/MedicationMovement"

interface MedicationMovementFormProps {
  onSubmit: (data: MedicationMovementData) => Promise<void>
  onCancel: () => void
  loading: boolean
  error: string | null
  isDisabled?: boolean
  submitButtonText?: string
  cancelButtonText?: string
}

export function MedicationMovementForm({
  onSubmit,
  onCancel,
  loading,
  error,
  isDisabled = false,
  submitButtonText = "Registrar",
  cancelButtonText = "Cancelar",
}: MedicationMovementFormProps) {
  const [formData, setFormData] = useState<MedicationMovementData>({
    id_paciente: 0,
    id_profesional: 0,
    cantidad: 0,
    motivo: "",
  })

  const numericFields = ["id_paciente", "id_profesional", "cantidad"]

  const {
    showVirtualKeyboard,
    setShowVirtualKeyboard,
    activeInput,
    insertText,
    deleteText,
    clearField,
    openKeyboardForField,
  } = useVirtualKeyboard({ formData, setFormData })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validar que solo se ingresen números en campos numéricos
    if (numericFields.includes(name) && value !== "" && !/^\d+$/.test(value)) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "id_paciente" || name === "cantidad" || name === "id_profesional"
          ? Number.parseInt(value) || 0
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const KeyboardIcon = ({ fieldName }: { fieldName: string }) => (
    <button
      type="button"
      onClick={() => openKeyboardForField(fieldName)}
      className="ml-2 p-1 text-sm text-gray-500 hover:text-[#5fa6b4] focus:outline-none focus:ring-2 focus:ring-[#5fa6b4] rounded inline-flex items-center"
      aria-label="Abrir teclado virtual"
      title="Abrir teclado virtual"
    >
      ⌨️
    </button>
  )

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* ID Paciente */}
          <div>
            <label htmlFor="id_paciente" className="block text-sm font-semibold text-gray-700 mb-2">
              ID Paciente
            </label>
            <div className="flex items-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="id_paciente"
                name="id_paciente"
                value={formData.id_paciente || ""}
                onChange={handleChange}
                placeholder="8"
                disabled={isDisabled}
                className={
                  "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors" +
                  (isDisabled ? " disabled:bg-gray-200 disabled:cursor-not-allowed" : "")
                }
                required
              />
              {!isDisabled && <KeyboardIcon fieldName="id_paciente" />}
            </div>
          </div>

          {/* ID Profesional */}
          <div>
            <label htmlFor="id_profesional" className="block text-sm font-semibold text-gray-700 mb-2">
              ID Profesional
            </label>
            <div className="flex items-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="id_profesional"
                name="id_profesional"
                value={formData.id_profesional || ""}
                onChange={handleChange}
                placeholder="3"
                disabled={isDisabled}
                className={
                  "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors" +
                  (isDisabled ? " disabled:bg-gray-200 disabled:cursor-not-allowed" : "")
                }
                required
              />
              {!isDisabled && <KeyboardIcon fieldName="id_profesional" />}
            </div>
          </div>
        </div>

        {/* Cantidad */}
        <div>
          <label htmlFor="cantidad" className="block text-sm font-semibold text-gray-700 mb-2">
            Cantidad
          </label>
          <div className="flex items-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="cantidad"
              name="cantidad"
              value={formData.cantidad || ""}
              onChange={handleChange}
              placeholder="5"
              disabled={isDisabled}
              className={
                "w-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors" +
                (isDisabled ? " disabled:bg-gray-200 disabled:cursor-not-allowed" : "")
              }
              required
            />
            {!isDisabled && <KeyboardIcon fieldName="cantidad" />}
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label htmlFor="motivo" className="block text-sm font-semibold text-gray-700 mb-2">
            Motivo
          </label>
          <textarea
            id="motivo"
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            placeholder="Describe el motivo..."
            rows={4}
            disabled={isDisabled}
            className={
              "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors resize-none" +
              (isDisabled ? " disabled:bg-gray-200 disabled:cursor-not-allowed" : "")
            }
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            type="submit"
            disabled={loading || isDisabled}
            className={
              "flex-1 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors" +
              (isDisabled ? " disabled:bg-gray-200 disabled:cursor-not-allowed" : "")
            }
          >
            {loading ? "Registrando..." : submitButtonText}
          </button>
        </div>
      </form>

      {/* Teclado Virtual */}
      <VirtualKeyboard
        showKeyboard={showVirtualKeyboard}
        setShowKeyboard={setShowVirtualKeyboard}
        activeInput={activeInput}
        isNumericField={activeInput ? numericFields.includes(activeInput) : false}
        onInsertText={insertText}
        onDeleteText={deleteText}
        onClearField={clearField}
      />
    </>
  )
}

