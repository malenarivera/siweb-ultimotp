import React from "react";

interface ConfirmationModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  t?: (key: string) => string;
}

export default function ConfirmationModal({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!show) return null;

  return (
    <div id="confirmation-modal" className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h2>
        <p className="text-gray-700 mb-4 text-center">
          {message}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#69b594] text-white rounded-md hover:bg-[#5aa382] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#69b594]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
