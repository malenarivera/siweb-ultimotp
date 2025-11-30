import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  isFocused?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  helpText?: string;
  width?: "full" | "half";
}

export default function FormSelectField({
  id,
  name,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  options,
  placeholder,
  required = false,
  isFocused = false,
  isExpanded = false,
  onToggleExpanded,
  helpText,
  width = "full",
}: FormSelectFieldProps) {
  const widthClass = width === "half" ? "w-full md:w-1/2" : "w-full";
  const selectClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a4eac3] bg-white text-black";

  return (
    <div className={width === "full" ? "" : "flex justify-start"}>
      <div className={widthClass}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onClick={onToggleExpanded}
          onBlur={onBlur}
          required={required}
          aria-required={required}
          aria-expanded={isExpanded}
          className={selectClasses}
        >
          <option value="">
            {isFocused ? placeholder : placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helpText && (
          <p className="text-xs text-red-500 mt-1">{helpText}</p>
        )}
      </div>
    </div>
  );
}
