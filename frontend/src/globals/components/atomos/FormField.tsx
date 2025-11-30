import React from "react";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  showKeyboardIcon?: boolean;
  onKeyboardIconClick?: () => void;
  isFocused?: boolean;
  error?: string;
  helpText?: string;
  instructionText?: string;
  className?: string;
  width?: "full" | "half";
}

export default function FormField({
  id,
  name,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  type = "text",
  required = false,
  showKeyboardIcon = true,
  onKeyboardIconClick,
  isFocused = false,
  error,
  helpText,
  instructionText,
  className = "",
  width = "full",
}: FormFieldProps) {
  const KeyboardIcon = ({ fieldName }: { fieldName: string }) => (
    <button
      type="button"
      onClick={onKeyboardIconClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onKeyboardIconClick?.();
        }
      }}
      className="ml-2 p-1 text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded inline-flex items-center"
      aria-label={`Abrir teclado virtual para ${fieldName}`}
      title="Abrir teclado virtual"
    >
      ⌨️
    </button>
  );

  const widthClass = width === "half" ? "w-full md:w-1/2" : "w-full";
  const inputClasses = `w-full px-3 py-2 border ${
    error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#a4eac3] bg-white text-black ${className}`;

  return (
    <div className={width === "full" ? "" : "flex justify-start"}>
      <div className={widthClass}>
        <div className="flex items-center mb-1">
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 uppercase">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {showKeyboardIcon && onKeyboardIconClick && (
            <KeyboardIcon fieldName={name} />
          )}
        </div>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          aria-required={required}
          className={inputClasses}
          placeholder={isFocused ? "" : placeholder}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
            {error}
          </p>
        )}
        {helpText && (
          <p className="text-xs text-red-500 mt-1">{helpText}</p>
        )}
        {instructionText && (
          <p className="text-xs text-blue-600 mt-1 flex items-center">
            <span className="mr-1">ℹ️</span> {instructionText}
          </p>
        )}
      </div>
    </div>
  );
}
