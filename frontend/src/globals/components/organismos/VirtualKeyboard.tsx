import { useTranslations } from "@/globals/hooks/useTranslations";
import { useState, useEffect } from "react";

interface VirtualKeyboardProps {
  showKeyboard: boolean;
  setShowKeyboard: (show: boolean) => void;
  activeInput: string | null;
  isNumericField?: boolean;
  onInsertText: (text: string) => void;
  onDeleteText: () => void;
  onClearField: () => void;
}

export default function VirtualKeyboard({
  showKeyboard,
  setShowKeyboard,
  activeInput,
  isNumericField = false,
  onInsertText,
  onDeleteText,
  onClearField
}: VirtualKeyboardProps) {
  const { t } = useTranslations();
  const [isUpperCase, setIsUpperCase] = useState(false);

  const handleKeyboardNavigation = (isShiftKey: boolean) => {
    const buttons = document.querySelectorAll('[data-keyboard-button="true"]');
    const currentElement = document.activeElement;
    const currentIndex = Array.from(buttons).indexOf(currentElement as Element);
    
    let nextIndex;
    if (isShiftKey) {
      nextIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex >= buttons.length - 1 ? 0 : currentIndex + 1;
    }
    
    (buttons[nextIndex] as HTMLElement).focus();
  };

  if (!showKeyboard) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg z-40 p-4"
      role="dialog"
      aria-label={t('registerPatient.form.virtualKeyboard.title')}
      onKeyDown={(e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          handleKeyboardNavigation(e.shiftKey);
        }
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header del teclado virtual */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {t('registerPatient.form.virtualKeyboard.title')} - {activeInput?.toUpperCase()}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowKeyboard(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowKeyboard(false);
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
              aria-label={t('registerPatient.form.virtualKeyboard.saveAndClose')}
              data-keyboard-button="true"
            >
              {t('registerPatient.form.virtualKeyboard.save')}
            </button>
            <button 
              onClick={() => setShowKeyboard(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowKeyboard(false);
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
              aria-label={t('registerPatient.form.virtualKeyboard.closeWithoutSaving')}
              data-keyboard-button="true"
            >
              {t('registerPatient.form.virtualKeyboard.close')}
            </button>
          </div>
        </div>

        {isNumericField ? (
          // Teclado numérico
          <div className="grid grid-cols-3 gap-2 mb-4" role="grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
              <button
                key={num}
                onClick={() => onInsertText(num)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onInsertText(num);
                  }
                }}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                aria-label={`${t('registerPatient.form.virtualKeyboard.insertNumber')} ${num}`}
                data-keyboard-button="true"
              >
                {num}
              </button>
            ))}
          </div>
        ) : (
          // Teclado alfabético
          <>
            <div className="grid grid-cols-10 gap-2 mb-2">
              {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((letter) => (
                <button
                  key={letter}
                  onClick={() => onInsertText(isUpperCase ? letter : letter.toLowerCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onInsertText(isUpperCase ? letter : letter.toLowerCase());
                    }
                  }}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  aria-label={`${t('registerPatient.form.virtualKeyboard.insertLetter')} ${letter}`}
                  data-keyboard-button="true"
                >
                  {isUpperCase ? letter : letter.toLowerCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-10 gap-2 mb-2">
              {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'].map((letter) => (
                <button
                  key={letter}
                  onClick={() => onInsertText(isUpperCase ? letter : letter.toLowerCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onInsertText(isUpperCase ? letter : letter.toLowerCase());
                    }
                  }}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  aria-label={`${t('registerPatient.form.virtualKeyboard.insertLetter')} ${letter}`}
                  data-keyboard-button="true"
                >
                  {isUpperCase ? letter : letter.toLowerCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-10 gap-2 mb-4">
              {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((letter) => (
                <button
                  key={letter}
                  onClick={() => onInsertText(isUpperCase ? letter : letter.toLowerCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onInsertText(isUpperCase ? letter : letter.toLowerCase());
                    }
                  }}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  aria-label={`${t('registerPatient.form.virtualKeyboard.insertLetter')} ${letter}`}
                  data-keyboard-button="true"
                >
                  {isUpperCase ? letter : letter.toLowerCase()}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Botones de control */}
        <div className="flex gap-2 justify-center">
          {!isNumericField && (
            <div className="flex gap-2 justify-center mb-2 w-full">
              <button
                onClick={() => setIsUpperCase(!isUpperCase)}
                className={`px-6 py-3 ${isUpperCase ? 'bg-blue-500' : 'bg-gray-200'} rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
                aria-label={isUpperCase ? t('registerPatient.form.virtualKeyboard.deactivateCaps') : t('registerPatient.form.virtualKeyboard.activateCaps')}
                data-keyboard-button="true"
              >
                ⇧
              </button>
              <button
                onClick={() => onInsertText(' ')}
                className="px-12 py-3 bg-gray-300 hover:bg-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
                aria-label={t('registerPatient.form.virtualKeyboard.insertSpace')}
                data-keyboard-button="true"
              >
                {t('registerPatient.form.virtualKeyboard.insertSpace')}
              </button>
            </div>
          )}
          
          {/* Botones de Borrar y Limpiar */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={onDeleteText}
              className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label={t('registerPatient.form.virtualKeyboard.deleteLastChar')}
              data-keyboard-button="true"
            >
              ← {t('registerPatient.form.virtualKeyboard.deleteLastChar')}
            </button>
            <button
              onClick={onClearField}
              className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label={t('registerPatient.form.virtualKeyboard.clearField')}
              data-keyboard-button="true"
            >
              {t('registerPatient.form.virtualKeyboard.clearField')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}