import { useState } from 'react';

interface UseVirtualKeyboardProps<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}

interface UseVirtualKeyboardReturn {
  showVirtualKeyboard: boolean;
  setShowVirtualKeyboard: (show: boolean) => void;
  activeInput: string | null;
  setActiveInput: (input: string | null) => void;
  insertText: (text: string) => void;
  deleteText: () => void;
  clearField: () => void;
  openKeyboardForField: (fieldName: string) => void;
}

export const useVirtualKeyboard = <T extends Record<string, any>>({
  formData,
  setFormData,
}: UseVirtualKeyboardProps<T>): UseVirtualKeyboardReturn => {
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const insertText = (text: string) => {
    if (activeInput) {
      setFormData((prev: T) => {
        const currentValue = prev[activeInput as keyof T];
        // Si el valor es string, concatenar; si no, convertir a string
        const newValue = typeof currentValue === 'string' 
          ? currentValue + text 
          : String(currentValue || '') + text;
        
        return {
          ...prev,
          [activeInput]: newValue,
        };
      });
    }
  };

  const deleteText = () => {
    if (activeInput) {
      setFormData((prev: T) => {
        const currentValue = prev[activeInput as keyof T];
        const stringValue = typeof currentValue === 'string' 
          ? currentValue 
          : String(currentValue || '');
        
        return {
          ...prev,
          [activeInput]: stringValue.slice(0, -1),
        };
      });
    }
  };

  const clearField = () => {
    if (activeInput) {
      setFormData((prev: T) => ({
        ...prev,
        [activeInput]: "",
      }));
    }
  };

  const openKeyboardForField = (fieldName: string) => {
    setActiveInput(fieldName);
    setShowVirtualKeyboard(true);
  };

  return {
    showVirtualKeyboard,
    setShowVirtualKeyboard,
    activeInput,
    setActiveInput,
    insertText,
    deleteText,
    clearField,
    openKeyboardForField,
  };
};

export default useVirtualKeyboard;

